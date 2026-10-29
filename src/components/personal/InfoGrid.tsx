import { useState, useEffect } from "react";
import { Student, StudentUpdateRequest } from "@/types/student";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";
import { Loader2, Edit2, X, Check } from "lucide-react";

interface InfoGridProps {
    profile: Student;
    refetch: () => void;
}

const InfoItem = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div>
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <p className="font-bold text-sm">{value || "N/A"}</p>
    </div>
);

const EditInput = ({
    label,
    name,
    value,
    type = "text",
    onChange
}: {
    label: string;
    name: string;
    value: string;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
    <div>
        <label className="text-zinc-400 text-xs mb-1 block">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full border border-zinc-200 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

export const InfoGrid = ({ profile, refetch }: InfoGridProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<StudentUpdateRequest>({
        fullName: profile.fullName || "",
        dob: profile.dob || "",
        placeOfBirth: profile.placeOfBirth || "",
        phone: profile.phone || "",
        email: profile.email || "",
        industry: profile.industry || "",
        trainingLevel: profile.trainingLevel || "",
        typeOfTraining: profile.typeOfTraining || "",
        currentPosition: profile.currentPosition || "",
        startDate: profile.startDate || ""
    });

    useEffect(() => {
        setFormData({
            fullName: profile.fullName || "",
            dob: profile.dob || "",
            placeOfBirth: profile.placeOfBirth || "",
            phone: profile.phone || "",
            email: profile.email || "",
            industry: profile.industry || "",
            trainingLevel: profile.trainingLevel || "",
            typeOfTraining: profile.typeOfTraining || "",
            currentPosition: profile.currentPosition || "",
            startDate: profile.startDate || ""
        });
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await studentService.updateProfile(profile.id, formData);
            toast.success("Cập nhật thông tin thành công!");
            setIsEditing(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi cập nhật thông tin");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-2xl bg-white p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>

                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors disabled:opacity-50"
                                title="Hủy"
                            >
                                <X size={20} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center justify-center p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                                title="Lưu"
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                            title="Chỉnh sửa"
                        >
                            <Edit2 size={20} />
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="grid grid-cols-2 gap-y-6 gap-x-12 flex-1">
                    <EditInput label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange} />
                    <EditInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                    <EditInput label="Số điện thoại" name="phone" value={formData.phone || ""} onChange={handleChange} />
                    <EditInput label="Ngày sinh" name="dob" value={formData.dob || ""} onChange={handleChange} type="date" />
                    <EditInput label="Nơi sinh" name="placeOfBirth" value={formData.placeOfBirth || ""} onChange={handleChange} />
                    <EditInput label="Ngành học" name="industry" value={formData.industry || ""} onChange={handleChange} />
                    <EditInput label="Trình độ đào tạo" name="trainingLevel" value={formData.trainingLevel || ""} onChange={handleChange} />
                    <EditInput label="Hệ đào tạo" name="typeOfTraining" value={formData.typeOfTraining || ""} onChange={handleChange} />
                    <EditInput label="Ngày bắt đầu (vào làm/học)" name="startDate" value={formData.startDate || ""} onChange={handleChange} type="date" />
                    <EditInput label="Vị trí/Chức vụ" name="currentPosition" value={formData.currentPosition || ""} onChange={handleChange} />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-y-8 gap-x-12 flex-1">
                    <InfoItem label="Họ và tên" value={profile.fullName} />
                    <InfoItem label="Mã số sinh viên" value={profile.studentCode} />
                    <InfoItem label="Email" value={profile.email} />
                    <InfoItem label="Ngày sinh" value={profile.dob} />
                    <InfoItem label="Nơi sinh" value={profile.placeOfBirth} />
                    <InfoItem label="Ngành học" value={profile.industry} />
                    <InfoItem label="Trình độ đào tạo" value={profile.trainingLevel} />
                    <InfoItem label="Hệ đào tạo" value={profile.typeOfTraining} />
                    <InfoItem label="Cập nhật lần cuối" value={profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString("vi-VN") : "N/A"} />
                </div>
            )}
        </div>
    );
};