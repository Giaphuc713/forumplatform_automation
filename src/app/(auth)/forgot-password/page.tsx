"use client";
import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API gửi mã OTP
      await authService.forgotPassword(email);

      // Lưu email vào sessionStorage để trang VerifyCode có thể lấy lại
      sessionStorage.setItem("reset_email", email);

      toast.success("Mã xác thực đã được gửi đến email của bạn");
      router.push("/verify-code");
    } catch (err: any) {
      setError("Email không tồn tại hoặc có lỗi xảy ra");
      toast.error("Gửi mã thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-900">Quên mật khẩu</h2>
        <p className="text-zinc-500 text-sm mt-2">Nhập email để nhận mã xác thực 6 chữ số</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-zinc-700">Email*</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${error ? "border-red-500 bg-red-50" : "border-zinc-300 focus:ring-2 focus:ring-blue-500"
              }`}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
          />
          {error && <p className="text-red-500 text-xs italic">{error}</p>}
        </div>

        <button
          disabled={isLoading}
          className="w-full bg-blue-800 text-white py-2.5 rounded-md font-bold hover:bg-blue-900 transition-all disabled:bg-zinc-400"
        >
          {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
        </button>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-sm text-blue-600 font-medium hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}