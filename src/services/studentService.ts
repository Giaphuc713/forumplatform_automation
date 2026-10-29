import { ApiResponse, Student, StudentUpdateRequest } from '@/types/student';
import { fetchClient } from "@/lib/api-client";
import Cookies from 'js-cookie';

class StudentService {
    private getUserId(): string | number {
        const token = Cookies.get("access_token");
        if (!token) throw new Error("Chưa đăng nhập");
        try {
            const payloadBase64 = token.split('.')[1];
            if (payloadBase64) {
                const payload = JSON.parse(atob(payloadBase64));
                return payload.id || payload.userId || payload.sub;
            }
        } catch (e) {
            console.error("Lỗi khi parse token", e);
        }
        throw new Error("Không tìm thấy ID người dùng");
    }

    async getProfile(id?: string | number): Promise<Student> {
        const targetId = id || this.getUserId();

        const data = await fetchClient<ApiResponse<Student>>(`/api/v1/students/${targetId}/profile`);
        return data.result;
    }

    async updateProfile(id: string | number, payload: StudentUpdateRequest): Promise<Student> {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (value instanceof File || value instanceof Blob) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        const data = await fetchClient<ApiResponse<Student>>(`/api/v1/students/${id}`, {
            method: 'PUT',
            body: formData
        });
        return data.result;
    }

    async uploadAvatar(id: string | number, file: File): Promise<Student> {
        const formData = new FormData();
        formData.append("file", file);

        const data = await fetchClient<ApiResponse<Student>>(`/api/v1/students/${id}/avatar`, {
            method: 'POST',
            body: formData
        });
        return data.result;
    }
}

export const studentService = new StudentService();