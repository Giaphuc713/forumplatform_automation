import React, { useState } from 'react';
import { X, Globe, Lock, Camera, Loader2, Copy, Check } from 'lucide-react';
import { CreateForumRequest } from '@/types/forum';
import { forumService } from '@/services/forum.service';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { OWNED_FORUMS_KEY } from './LeftSideBar';

const currentStudentId = Number(Cookies.get("current_user"));
type CommunityType = 'public' | 'private';

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateCommunityModal({ isOpen, onClose }: CreateCommunityModalProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const [forumType, setForumType] = useState<CommunityType>('public');
    const [formData, setFormData] = useState<Partial<CreateForumRequest>>({
        name: '',
        description: '',
        isPublic: true,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [inviteLink, setInviteLink] = useState('');
    const [createdForum, setCreatedForum] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const handleClose = () => {
        setStep(1);
        setFormData({ name: '', description: '', isPublic: true });
        setImagePreview(null);
        setImageFile(null);
        setInviteLink('');
        setCreatedForum(null);
        setCopied(false);
        onClose();
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setImageFile(file);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await forumService.createForum({
                name: formData.name || '',
                description: formData.description,
                rules: formData.rules,
                isPublic: forumType === 'public',
                authorId: currentStudentId,
                image: imageFile ?? undefined,
            });
            const forum = response?.result ?? response;
            toast.success('Community created successfully!');
            queryClient.invalidateQueries({ queryKey: [OWNED_FORUMS_KEY, String(currentStudentId)] });
            if (forumType === 'private') {
                const code = await forumService.createInvitationCode(forum.id, currentStudentId);
                const link = `${window.location.origin}/forum/invite/${code}`;
                setInviteLink(link);
                setCreatedForum(forum);
                setStep(3);
            } else {
                handleClose();
                router.push(`/forum/${encodeURIComponent(forum.name)}?forumId=${forum.id}`);
            }
        } catch {
            toast.error('Failed to create community. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyInviteLink = async () => {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.08)] animate-in zoom-in-95 duration-200 overflow-hidden">

                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEFF1]">
                            <h2 className="text-base font-bold text-[#1C1C1C]">
                                {step === 1 && 'What kind of community is this?'}
                                {step === 2 && 'Tell us about your community'}
                                {step === 3 && 'Community created!'}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="rounded-full p-1.5 text-[#878A8C] hover:bg-[#EDEFF1] hover:text-[#1C1C1C] transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* STAGE 1: Choose community type */}
                            {step === 1 && (
                                <div className="flex flex-col">
                                    <p className="text-sm text-[#878A8C] mb-5 leading-relaxed">
                                        Decide who can view and contribute in your community. Only public communities show up in search.{' '}
                                        <span className="font-semibold text-[#3C3C3C]">Important:</span> Once set, you will need to submit a request to change your community type.
                                    </p>

                                    <div className="space-y-3 mb-8">
                                        <label className={[
                                            'flex items-start gap-3 p-4 rounded-lg cursor-pointer border-2 transition-all',
                                            forumType === 'public'
                                                ? 'border-[#0079D3] bg-[#F0F8FF]'
                                                : 'border-[#EDEFF1] hover:bg-[#F6F7F8]',
                                        ].join(' ')}>
                                            <Globe className={['h-5 w-5 mt-0.5', forumType === 'public' ? 'text-[#0079D3]' : 'text-[#878A8C]'].join(' ')} />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm text-[#1C1C1C]">Public</h3>
                                                <p className="text-xs text-[#878A8C] mt-0.5">Anyone can view, post, and comment to this community</p>
                                            </div>
                                            <input
                                                type="radio"
                                                name="type"
                                                className="mt-0.5 h-4 w-4 accent-[#0079D3]"
                                                checked={forumType === 'public'}
                                                onChange={() => setForumType('public')}
                                            />
                                        </label>

                                        <div className="border-t border-[#EDEFF1]" />

                                        <label className={[
                                            'flex items-start gap-3 p-4 rounded-lg cursor-pointer border-2 transition-all',
                                            forumType === 'private'
                                                ? 'border-[#0079D3] bg-[#F0F8FF]'
                                                : 'border-[#EDEFF1] hover:bg-[#F6F7F8]',
                                        ].join(' ')}>
                                            <Lock className={['h-5 w-5 mt-0.5', forumType === 'private' ? 'text-[#0079D3]' : 'text-[#878A8C]'].join(' ')} />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm text-[#1C1C1C]">Private</h3>
                                                <p className="text-xs text-[#878A8C] mt-0.5">Only approved users can view and contribute</p>
                                            </div>
                                            <input
                                                type="radio"
                                                name="type"
                                                className="mt-0.5 h-4 w-4 accent-[#0079D3]"
                                                checked={forumType === 'private'}
                                                onChange={() => setForumType('private')}
                                            />
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-[#EDEFF1]">
                                        <StepDots total={2} current={1} />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleClose}
                                                className="rounded-full px-5 py-2 text-sm font-bold text-[#1C1C1C] hover:bg-[#EDEFF1] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleNext}
                                                className="rounded-full bg-[#0079D3] px-6 py-2 text-sm font-bold text-white hover:bg-[#006BBD] transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STAGE 2: Community details */}
                            {step === 2 && (
                                <div className="flex flex-col">
                                    <p className="text-sm text-[#878A8C] mb-5 leading-relaxed">
                                        A name and description help people understand what your community is all about.
                                    </p>

                                    <div className="flex flex-col md:flex-row gap-5 mb-6">
                                        <div className="flex-1 space-y-3">
                                            {/* Name */}
                                            <div className="relative rounded-lg bg-[#F6F7F8] px-3 pt-5 pb-2.5 border-2 border-transparent focus-within:border-[#0079D3] focus-within:bg-white transition-colors">
                                                <label className="absolute left-3 top-1.5 text-[10px] font-semibold text-[#878A8C] uppercase tracking-wide">
                                                    Community name <span className="text-[#FF4500]">*</span>
                                                </label>
                                                <div className="flex items-center text-[#1C1C1C]">
                                                    <span className="text-[#878A8C] mr-0.5 text-sm">c/</span>
                                                    <input
                                                        type="text"
                                                        maxLength={21}
                                                        className="w-full bg-transparent outline-none text-sm font-medium text-[#1C1C1C] placeholder:text-[#878A8C]"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/\s+/g, '') })}
                                                    />
                                                </div>
                                                <span className="absolute right-3 bottom-2 text-[10px] text-[#878A8C]">
                                                    {formData.name?.length || 0}/21
                                                </span>
                                            </div>

                                            {/* Rules */}
                                            <div className="relative rounded-lg bg-[#F6F7F8] px-3 pt-5 pb-2.5 border-2 border-transparent focus-within:border-[#0079D3] focus-within:bg-white transition-colors h-24">
                                                <label className="absolute left-3 top-1.5 text-[10px] font-semibold text-[#878A8C] uppercase tracking-wide">
                                                    Rules <span className="text-[#FF4500]">*</span>
                                                </label>
                                                <textarea
                                                    className="w-full h-full bg-transparent outline-none resize-none text-sm text-[#1C1C1C] placeholder:text-[#878A8C]"
                                                    placeholder="Be respectful, no spam..."
                                                    value={formData.rules || ''}
                                                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                                />
                                            </div>

                                            {/* Description */}
                                            <div className="relative rounded-lg bg-[#F6F7F8] px-3 pt-5 pb-2.5 border-2 border-transparent focus-within:border-[#0079D3] focus-within:bg-white transition-colors h-32">
                                                <label className="absolute left-3 top-1.5 text-[10px] font-semibold text-[#878A8C] uppercase tracking-wide">
                                                    Description <span className="text-[#FF4500]">*</span>
                                                </label>
                                                <textarea
                                                    className="w-full h-full bg-transparent outline-none resize-none text-sm text-[#1C1C1C] placeholder:text-[#878A8C]"
                                                    placeholder="What is your community about?"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Live Preview Card */}
                                        <div className="hidden md:flex flex-col w-64 rounded-lg border border-[#EDEFF1] bg-[#F8F9FA] p-4 h-fit gap-3">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#878A8C]">Preview</p>
                                            <div className="flex items-center gap-2.5">
                                                <label
                                                    htmlFor="upload-avatar"
                                                    className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#0079D3] text-white font-bold text-base overflow-hidden group"
                                                    title="Upload community image"
                                                >
                                                    {imagePreview ? (
                                                        <img src={imagePreview} alt="Community Avatar" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs">c/</span>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Camera className="h-4 w-4 text-white" />
                                                    </div>
                                                </label>
                                                <input
                                                    id="upload-avatar"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-sm text-[#1C1C1C] truncate">
                                                        c/{formData.name || 'communityname'}
                                                    </h4>
                                                    <p className="text-[11px] text-[#878A8C]">1 member</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[#3C3C3C] break-words line-clamp-4 leading-relaxed">
                                                {formData.description || 'Your community description will appear here.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-[#EDEFF1]">
                                        <StepDots total={2} current={2} />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleBack}
                                                className="rounded-full px-5 py-2 text-sm font-bold text-[#1C1C1C] border border-[#EDEFF1] hover:bg-[#EDEFF1] transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={!formData.name || !formData.description || submitting}
                                                className="flex items-center gap-2 rounded-full bg-[#0079D3] px-6 py-2 text-sm font-bold text-white hover:bg-[#006BBD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                                Create Community
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STAGE 3: Invite link (private forums only) */}
                            {step === 3 && createdForum && (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                                            <Check className="h-4 w-4 text-green-600" />
                                        </div>
                                        <p className="text-sm text-[#878A8C] leading-relaxed">
                                            Share this link to invite members to your private community.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#EDEFF1] bg-[#F8F9FA] p-4 mb-5">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#878A8C] mb-2">
                                            Invite link
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                readOnly
                                                value={inviteLink}
                                                className="flex-1 text-sm bg-white border border-[#EDEFF1] rounded-lg px-3 py-2 text-[#3C3C3C] truncate focus:outline-none focus:border-[#0079D3] focus:ring-1 focus:ring-[#0079D3]"
                                            />
                                            <button
                                                onClick={handleCopyInviteLink}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-[#0079D3] text-white text-sm font-bold rounded-lg hover:bg-[#006BBD] whitespace-nowrap transition-colors"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2 border-t border-[#EDEFF1]">
                                        <button
                                            onClick={() => {
                                                handleClose();
                                                router.push(`/forum/${encodeURIComponent(createdForum.name)}?forumId=${createdForum.id}`);
                                            }}
                                            className="rounded-full bg-[#0079D3] px-6 py-2 text-sm font-bold text-white hover:bg-[#006BBD] transition-colors"
                                        >
                                            Go to Community
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function StepDots({ total, current }: { total: number; current: number }) {
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: total }, (_, i) => (
                <div
                    key={i}
                    className={[
                        'h-2 w-2 rounded-full transition-colors',
                        i + 1 === current ? 'bg-[#0079D3]' : 'bg-[#EDEFF1]',
                    ].join(' ')}
                />
            ))}
        </div>
    );
}
