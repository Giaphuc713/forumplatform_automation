import { useState, useEffect } from "react";
import { studentService } from "@/services/studentService";
import { Student } from "@/types/student";
import { toast } from "sonner";

export const useStudentProfile = (id?: string | number) => {
    const [profile, setProfile] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await studentService.getProfile(id);
            setProfile(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Đã có lỗi xảy ra");
            toast.error("Không thể tải thông tin cá nhân");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const refetch = () => {
        fetchProfile();
    };

    return { profile, isLoading, error, refetch };
};
