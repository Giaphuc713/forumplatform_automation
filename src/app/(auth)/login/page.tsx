"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/auth.service";
import { useUser } from "@/contexts/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { checkAuth } = useUser();

  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    const savedPassword = localStorage.getItem("remembered_password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(atob(savedPassword));
      setRemember(true);
    }
  }, []);

  const t = {
    badge: lang === "vi" ? "Đã bảo mật" : "Secured",
    title: lang === "vi" ? "Chào mừng trở lại" : "Welcome back",
    email: lang === "vi" ? "Email" : "Email",
    password: lang === "vi" ? "Mật khẩu" : "Password",
    remember: lang === "vi" ? "Ghi nhớ đăng nhập" : "Remember me",
    forgot: lang === "vi" ? "Quên mật khẩu?" : "Forgot password?",
    signIn: lang === "vi" ? "Đăng nhập" : "Sign in",
    signingIn: lang === "vi" ? "Đang đăng nhập..." : "Signing in...",
    or: lang === "vi" ? "HOẶC TIẾP TỤC VỚI" : "OR CONTINUE WITH",
    google: lang === "vi" ? "Tiếp tục với Google" : "Continue with Google",
    noAccount: lang === "vi" ? "Chưa có tài khoản?" : "Don't have an account?",
    createOne: lang === "vi" ? "Tạo tài khoản ngay" : "Create one now",
    emailRequired: lang === "vi" ? "Vui lòng nhập email" : "Please enter email",
    passwordRequired: lang === "vi" ? "Vui lòng nhập mật khẩu" : "Please enter password",
    invalidCredential: lang === "vi" ? "Sai tài khoản hoặc mật khẩu" : "Invalid email or password",
    loginFailed: lang === "vi" ? "Đăng nhập thất bại. Vui lòng thử lại." : "Login failed. Please try again.",
    welcome: (name: string) => lang === "vi" ? `Chào mừng ${name}!` : `Welcome back ${name}!`,
    googleSoon: lang === "vi" ? "Đăng nhập Google sắp ra mắt" : "Google sign-in coming soon",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "", password: "" });

    if (!email) return setErrors((prev) => ({ ...prev, email: t.emailRequired }));
    if (!password) return setErrors((prev) => ({ ...prev, password: t.passwordRequired }));

    setIsSubmitting(true);
    try {
      const result = await authService.loginWithEmail(email, password);

      if (remember) {
        localStorage.setItem("remembered_email", email);
        localStorage.setItem("remembered_password", btoa(password));
      } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
      }

      await checkAuth();
      toast.success(t.welcome(result.fullName || (lang === "vi" ? "bạn" : "User")));
      router.replace("/forum");
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        toast.error(t.invalidCredential);
        setErrors({ email: " ", password: t.invalidCredential });
      } else {
        toast.error(t.loginFailed);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Language switch */}
      <div className="flex justify-end mb-2">
        <div
          onClick={() => setLang(lang === "vi" ? "en" : "vi")}
          className="relative flex items-center bg-slate-100 p-0.5 rounded-full w-[64px] h-7 cursor-pointer border border-slate-200 select-none transition-all duration-300"
        >
          <div
            className={`absolute top-0.5 bottom-0.5 w-[28px] rounded-full bg-white shadow-xs border border-slate-200/60 transition-all duration-300 ${lang === "vi" ? "left-0.5" : "left-[33px]"
              }`}
          />
          <div className="flex w-full justify-between items-center text-[10px] font-extrabold z-10 px-2 pointer-events-none">
            <span className={lang === "vi" ? "text-indigo-600" : "text-slate-400"}>VI</span>
            <span className={lang === "en" ? "text-indigo-600" : "text-slate-400"}>EN</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-7">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-cyan-200 mb-4">
          <ShieldCheck className="text-cyan-500" size={28} />
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{t.title}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <div className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 transition-all ${errors.email ? "border-red-400 bg-red-50/50" : "border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10"}`}>
            <Mail size={16} className="text-slate-400 shrink-0" />
            <input
              type="email"
              value={email}
              placeholder={t.email}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
          </div>
          {errors.email.trim() && <p className="text-red-500 text-xs pl-1">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <div className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 transition-all ${errors.password ? "border-red-400 bg-red-50/50" : "border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10"}`}>
            <Lock size={16} className="text-slate-400 shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder={t.password}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password.trim() && <p className="text-red-500 text-xs pl-1">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
            {t.remember}
          </label>
          <Link href="/forgot-password" className="text-indigo-600 font-medium hover:underline">
            {t.forgot}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white py-3 rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-200/60 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t.signingIn}
            </>
          ) : (
            <>
              {t.signIn}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-semibold text-slate-400 tracking-wider">{t.or}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={() => toast.info(t.googleSoon)}
        className="w-full flex items-center justify-center gap-2.5 border border-slate-200 rounded-2xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v3h3.93c2.3-2.12 3.62-5.24 3.62-8.82z" />
          <path fill="#34A853" d="M12 24c3.27 0 6.01-1.09 8.01-2.95l-3.93-3c-1.09.73-2.48 1.16-4.08 1.16-3.14 0-5.8-2.12-6.75-4.96H1.18v3.09C3.17 21.3 7.26 24 12 24z" />
          <path fill="#FBBC05" d="M5.25 14.25c-.25-.73-.38-1.51-.38-2.25s.14-1.52.38-2.25V6.66H1.18C.43 8.24 0 10.06 0 12s.43 3.76 1.18 5.34l4.07-3.09z" />
          <path fill="#EA4335" d="M12 4.75c1.78 0 3.37.61 4.62 1.81l3.47-3.47C18 1.19 15.27 0 12 0 7.26 0 3.17 2.7 1.18 6.66l4.07 3.09c.95-2.84 3.61-4.96 6.75-4.96z" />
        </svg>
        {t.google}
      </button>

      <p className="mt-6 text-center text-xs text-slate-500">
        {t.noAccount}{" "}
        <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
          {t.createOne}
        </Link>
      </p>
    </>
  );
}
