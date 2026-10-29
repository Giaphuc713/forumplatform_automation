"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, ExternalLink, LogIn } from "lucide-react";
import Link from "next/link";

export default function VerifyCodePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = window.sessionStorage.getItem("reset_email");
    if (!storedEmail) {
      router.push("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // Hàm mở trình duyệt mail phổ biến (tiện ích thêm cho user)
  const openMailApp = () => {
    window.open("https://mail.google.com/", "_blank");
  };

  return (
    <div className="text-center space-y-8 py-4">
      <div className="flex justify-center">
        <div className="bg-blue-50 p-6 rounded-full text-blue-600 animate-pulse">
          <Mail size={48} />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-blue-900">Kiểm tra Email</h2>
        <p className="text-zinc-500 text-sm px-4">
          Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến <br />
          <span className="font-bold text-zinc-800">{email}</span>
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mx-4">
        <p className="text-xs text-amber-700 leading-relaxed text-left">
          <b>Lưu ý:</b> Vui lòng nhấn vào liên kết trong email để tiếp tục đặt lại mật khẩu.
          Nếu không thấy, hãy kiểm tra thư mục <b>Spam (Thư rác)</b>.
        </p>
      </div>

      <div className="space-y-3 px-4">
        {/* Button chính */}
        <button
          onClick={openMailApp}
          className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold hover:bg-blue-900 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Mở Gmail <ExternalLink size={18} />
        </button>

        {/* Các lựa chọn quay lại */}
        <div className="flex flex-col gap-4 pt-2">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
          >
            <LogIn size={16} /> Quay lại đăng nhập
          </Link>

          <Link
            href="/forgot-password"
            className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft size={16} /> Nhập email khác
          </Link>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mt-8">
        Bạn chưa nhận được email? <br />
        <button className="text-blue-700 font-bold hover:underline mt-1">Gửi lại yêu cầu</button>
      </p>
    </div>
  );
}