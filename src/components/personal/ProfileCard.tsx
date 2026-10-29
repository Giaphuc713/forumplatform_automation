import { useRef, useState } from "react";
import { Phone, Mail, Calendar, Briefcase, Camera, Loader2 } from "lucide-react";
import { Student } from "@/types/student";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";

interface ProfileCardProps {
    profile: Student;
    refetch: () => void;
}

export const ProfileCard = ({ profile, refetch }: ProfileCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file hình ảnh hợp lệ");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 5MB");
            return;
        }

        try {
            setIsUploading(true);
            await studentService.uploadAvatar(profile.id, file);
            toast.success("Cập nhật ảnh đại diện thành công!");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi cập nhật ảnh đại diện");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="relative mb-4 group w-full aspect-square rounded-xl overflow-hidden bg-zinc-200">
                {profile.avatarUrl ? (
                    <img
                        src={profile.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        Chưa có ảnh
                    </div>
                )}
                
                {/* Overlay upload button */}
                <div 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <Loader2 className="animate-spin text-white w-8 h-8" />
                    ) : (
                        <div className="flex flex-col items-center text-white">
                            <Camera className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Thay đổi</span>
                        </div>
                    )}
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>
            
            <h2 className="text-2xl font-bold mb-6 text-center">{profile.fullName || "Chưa cập nhật tên"}</h2>

            <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                    <Phone size={18} className="text-zinc-500 mt-0.5" />
                    <div><p className="text-zinc-400 text-xs">Điện thoại</p><p className="font-medium">{profile.phone || "N/A"}</p></div>
                </div>
                <div className="flex items-start gap-3">
                    <Mail size={18} className="text-zinc-500 mt-0.5" />
                    <div><p className="text-zinc-400 text-xs">Email</p><p className="font-medium">{profile.email || "N/A"}</p></div>
                </div>
                <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-zinc-500 mt-0.5" />
                    <div><p className="text-zinc-400 text-xs">Ngày vào làm/học</p><p className="font-medium">{profile.startDate || "N/A"}</p></div>
                </div>
                <div className="flex items-start gap-3">
                    <Briefcase size={18} className="text-zinc-500 mt-0.5" />
                    <div><p className="text-zinc-400 text-xs">Vị trí/Chức vụ</p><p className="font-medium">{profile.currentPosition || "N/A"}</p></div>
                </div>
            </div>
        </div>
    );
};