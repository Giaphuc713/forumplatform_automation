"use client";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });

  useEffect(() => {
    const token = window.sessionStorage.getItem("reset_token");
    if (!token) {
      toast.error("Phiên làm việc hết hạn");
      router.push("/forgot-password");
    }
  }, [router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    const newErrors = { password: "", confirmPassword: "" };

    if (password.length < 6) {
      newErrors.password = "Mật khẩu mới phải có ít nhất 6 ký tự";
      hasError = true;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const resetToken = window.sessionStorage.getItem("reset_token") || "";
      // Gọi service với token đã lưu
      await authService.resetPassword(resetToken, password);

      toast.success("Đặt lại mật khẩu thành công!");
      window.sessionStorage.clear(); // Dọn dẹp session
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-900">Mật khẩu mới</h2>
        <p className="text-zinc-500 text-sm mt-2">Thiết lập mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
            <Lock size={14} /> Mật khẩu mới*
          </label>
          <input
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${errors.password ? "border-red-500 bg-red-50" : "border-zinc-300 focus:ring-2 focus:ring-blue-500"
              }`}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
          />
          {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
            <Lock size={14} /> Xác nhận mật khẩu*
          </label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-zinc-300 focus:ring-2 focus:ring-blue-500"
              }`}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
            }}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword}</p>}
        </div>

        <button
          disabled={isLoading}
          className="w-full bg-blue-800 text-white py-2.5 rounded-md font-bold hover:bg-blue-900 shadow-lg disabled:bg-zinc-400"
        >
          {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}