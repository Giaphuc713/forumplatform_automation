import { Bot, Compass, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 overflow-hidden">
      {/* Soft ambient background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-cyan-300/25 blur-[110px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-300/25 blur-[110px] rounded-full" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex w-full max-w-5xl bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/60">

        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-center p-16 w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-100/80 to-indigo-100/60 border-r border-white/40">
          <Link href="/" className="relative flex items-center gap-3 mb-8 group">
            <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <Bot className="text-white" size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
              AI Assistance
            </h1>
          </Link>

          <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-indigo-100 text-xs font-semibold text-indigo-600 w-fit mb-5 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            TRỢ LÝ HỌC TẬP THÔNG MINH
          </div>

          <h2 className="relative text-3xl font-bold mb-4 leading-snug text-slate-800">
            Định hướng lộ trình học tập <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">của riêng bạn.</span>
          </h2>
          <p className="relative text-slate-500 text-sm leading-relaxed max-w-md mb-8">
            Hỏi đáp thông tin môn học, chương trình đào tạo và nhận gợi ý lộ trình học tập phù hợp — cùng trợ lý AI đồng hành với bạn.
          </p>

          <div className="relative flex flex-col gap-3 max-w-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/60 px-4 py-3 shadow-xs">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <GraduationCap size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">Tư vấn môn học</div>
                <div className="text-xs text-slate-400">Tra cứu nội dung, tín chỉ, điều kiện tiên quyết</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/60 px-4 py-3 shadow-xs">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                <Compass size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">Lộ trình cá nhân hóa</div>
                <div className="text-xs text-slate-400">Gợi ý theo ngành học và mục tiêu của bạn</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form (Children) */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 md:p-14">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
