'use client'

import { AppSidebar } from "@/components/ui/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useMessages } from "@/hooks/use-messages"
import { useAutoScroll } from "@/hooks/useAutoScroll"
import { chatApi } from "@/services/chat.service"
import { ChatInput } from "@/src/components/chat-input/chat-input"
import {
  ChevronDown,
  LogIn,
  Loader2,
  UserCircle,
  ArrowDown,
  Settings,
  Sparkles,
  Check,
  X,
  Shield,
  HelpCircle,
  Sun,
  Moon,
  Globe,
  Maximize2,
  Minimize2,
  Lightbulb
} from "lucide-react"
import { ChatDemoPreview } from "@/src/components/chat-demo-preview/chat-demo-preview"
import { useEffect, useState, useRef, Suspense } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useUser } from "@/contexts/UserContext"
import { MessagesContrainer } from "@/components/messagesContrainer/messagesContrainer"
import { ensureGuestSessionId } from "@/lib/guest-session"
import { useTheme } from "next-themes"
import { MindmapViewer, MindmapViewerRef } from "@/components/mindmap/MindmapViewer"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Dynamic Translation Object
const translations = {
  vi: {
    sidebarTitle: "Lịch sử hội thoại",
    noHistory: "Chưa có hội thoại nào.",
    newChat: "Đoạn chat mới",
    ragAssistant: "AI Assistance",
    bypassConfig: "Cấu hình Bypass",
    logout: "Đăng xuất",
    login: "Đăng nhập",
    welcome: "Chào bạn",
    welcomeSub: "Tôi được trang bị kiến thức RAG chuyên sâu. Bạn cần hỏi đáp thông tin, lập lộ trình học tập, hay tư vấn môn học?",
    ragPayload: "Thông tin gửi đến RAG API:",
    major: "Ngành đào tạo",
    enrollmentYear: "Năm nhập học (Khóa)",
    bio: "Mô tả/Nguyện vọng (Bio)",
    changeInfo: "Thay đổi thông tin",
    stopResponse: "Dừng phản hồi",
    placeholderInput: "Nhắn tin cho AI...",
    disclaimer: "AI có thể đưa ra câu trả lời chưa chính xác. Hãy kiểm tra lại thông tin nhé!",
    mockProfileTitle: "Bypass Auth & Hồ sơ Mock",
    mockProfileSub: "Hệ thống đang chạy chế độ Bypass Login. Bạn có thể tự ý thay đổi thông tin User và Student Profile bên dưới để kiểm tra khả năng cá nhân hóa kết quả tìm kiếm của RAG.",
    close: "Đóng",
    saveChanges: "Lưu thay đổi",
    saved: "Đã lưu!",
    random: "Ngẫu nhiên",
    accountInfo: "Thông tin Tài khoản (UI)",
    fullName: "Họ và Tên",
    email: "Email sinh viên",
    avatarSeed: "Avatar URL / Seed",
    studyProfile: "Hồ sơ Học tập (Gửi tới RAG)",
    loading: "Đang tải cấu trúc không gian...",
    stopGenerating: "Stop generating",
    managingMock: "Quản lý Mock User",
    aiIsThinking: "AI đang suy nghĩ...",
    mindmapMode: "Bản đồ tư duy"
  },
  en: {
    sidebarTitle: "Chat History",
    noHistory: "No conversation history.",
    newChat: "New Chat",
    ragAssistant: "AI Assistance",
    bypassConfig: "Bypass Config",
    logout: "Log Out",
    login: "Log In",
    welcome: "Hello",
    welcomeSub: "I am equipped with specialized RAG knowledge. Do you need to ask questions, plan a learning path, or consult on courses?",
    ragPayload: "Metadata sent to RAG API:",
    major: "Major",
    enrollmentYear: "Enrollment Year",
    bio: "Bio / Goal",
    changeInfo: "Change Information",
    stopResponse: "Stop response",
    placeholderInput: "Type a message...",
    disclaimer: "AI can generate inaccurate answers. Please verify the information!",
    mockProfileTitle: "Bypass Auth & Mock Profile",
    mockProfileSub: "The system is in Bypass Login mode. You can customize User and Student Profile info below to test RAG personalization.",
    close: "Close",
    saveChanges: "Save Changes",
    saved: "Saved!",
    random: "Random",
    accountInfo: "Account Info (UI)",
    fullName: "Full Name",
    email: "Student Email",
    avatarSeed: "Avatar URL / Seed",
    studyProfile: "Academic Profile (Sent to RAG)",
    loading: "Loading spatial depth...",
    stopGenerating: "Stop generating",
    managingMock: "Manage Mock User",
    aiIsThinking: "AI is thinking...",
    mindmapMode: "Mindmap mode"
  }
}

type ChatSession = {
  session_id: string;
  title: string;
  [key: string]: unknown;
}

function AIAssistantPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authQuery = searchParams.get("auth")

  const { theme, setTheme } = useTheme()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [isMindmapMode, setIsMindmapMode] = useState(false)
  const [isMindmapMaximized, setIsMindmapMaximized] = useState(false)
  const [showGuideDemo, setShowGuideDemo] = useState(false)
  const mindmapRef = useRef<MindmapViewerRef>(null)
  
  const { messages, addMessage, clearMessages, setMessages, updateLastMessage } = useMessages()
  const { user, isLoading: isUserLoading, updateMockUser } = useUser()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [sessionList, setSessionList] = useState<ChatSession[]>([])
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null)
  const { handleLogout } = useAuth()
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Floating login state and handlers
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginRemember, setLoginRemember] = useState(false)
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" })
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const { checkAuth } = useUser()

  // Signup modal state
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [signupData, setSignupData] = useState({ fullname: "", studentCode: "", email: "", password: "", confirmPassword: "" })
  const [signupErrors, setSignupErrors] = useState({ fullname: "", studentCode: "", email: "", password: "", confirmPassword: "" })
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false)

  useEffect(() => {
    if (authQuery === "login") {
      setIsLoginOpen(true)
      setIsSignupOpen(false)
    } else if (authQuery === "signup") {
      setIsSignupOpen(true)
      setIsLoginOpen(false)
    }
  }, [authQuery])

  const closeLoginModal = () => {
    setIsLoginOpen(false)
    router.replace("/ai-assistant")
  }

  const closeSignupModal = () => {
    setIsSignupOpen(false)
    setSignupData({ fullname: "", studentCode: "", email: "", password: "", confirmPassword: "" })
    setSignupErrors({ fullname: "", studentCode: "", email: "", password: "", confirmPassword: "" })
    router.replace("/ai-assistant")
  }

  const switchToSignup = () => {
    setIsLoginOpen(false)
    setIsSignupOpen(true)
    router.replace("/ai-assistant?auth=signup")
  }

  const switchToLogin = () => {
    setIsSignupOpen(false)
    setIsLoginOpen(true)
    router.replace("/ai-assistant?auth=login")
  }

  const handleModalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { fullname: "", studentCode: "", email: "", password: "", confirmPassword: "" };
    let isValid = true;
    if (!signupData.fullname.trim()) { newErrors.fullname = "Vui lòng nhập họ và tên"; isValid = false; }
    if (!signupData.studentCode.trim()) { newErrors.studentCode = "Vui lòng nhập mã sinh viên"; isValid = false; }
    if (!signupData.email) { newErrors.email = "Vui lòng nhập email"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) { newErrors.email = "Email không đúng định dạng"; isValid = false; }
    if (signupData.password.length < 6) { newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"; isValid = false; }
    if (signupData.confirmPassword !== signupData.password) { newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"; isValid = false; }
    setSignupErrors(newErrors);
    if (!isValid) return;

    setIsSignupSubmitting(true);
    try {
      await authService.registerWithEmail(signupData.email, signupData.password, signupData.fullname, signupData.studentCode);
      await checkAuth();
      setGuestSessionId(null);
      toast.success(lang === 'vi' ? `Tạo tài khoản thành công! Chào mừng ${signupData.fullname}!` : `Account created! Welcome ${signupData.fullname}!`);
      closeSignupModal();
      router.replace("/ai-assistant");
      fetchSessions(undefined);
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setSignupErrors(prev => ({ ...prev, email: lang === 'vi' ? "Email này đã được sử dụng" : "Email already in use" }));
      } else {
        toast.error(lang === 'vi' ? "Đăng ký thất bại. Vui lòng thử lại." : "Registration failed. Please try again.");
      }
    } finally {
      setIsSignupSubmitting(false);
    }
  };

  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({ email: "", password: "" });

    if (!loginEmail) return setLoginErrors(prev => ({ ...prev, email: lang === 'vi' ? "Vui lòng nhập email" : "Please enter email" }));
    if (!loginPassword) return setLoginErrors(prev => ({ ...prev, password: lang === 'vi' ? "Vui lòng nhập mật khẩu" : "Please enter password" }));

    setIsLoginSubmitting(true);
    try {
      const result = await authService.loginWithEmail(loginEmail, loginPassword);
      if (loginRemember) {
        localStorage.setItem("remembered_email", loginEmail);
        localStorage.setItem("remembered_password", btoa(loginPassword));
      } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
      }
      
      await checkAuth();
      setGuestSessionId(null);
      
      toast.success(lang === 'vi' ? `Chào mừng ${result.fullName || 'bạn'}!` : `Welcome back ${result.fullName || 'User'}!`);
      setIsLoginOpen(false);
      router.replace("/ai-assistant");
      fetchSessions(undefined);
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      console.error(code);
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        toast.error(lang === 'vi' ? "Sai tài khoản hoặc mật khẩu" : "Invalid email or password");
        setLoginErrors({ email: " ", password: lang === 'vi' ? "Sai tài khoản hoặc mật khẩu" : "Invalid email or password" });
      } else {
        toast.error(lang === 'vi' ? "Đăng nhập thất bại. Vui lòng thử lại." : "Login failed. Please try again.");
      }
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    const savedPassword = localStorage.getItem("remembered_password");

    if (savedEmail && savedPassword) {
      setLoginEmail(savedEmail);
      setLoginPassword(atob(savedPassword));
      setLoginRemember(true);
    }
  }, []);
  
  // States for Mock User customizer
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileEmail, setProfileEmail] = useState("")
  const [profilePhoto, setProfilePhoto] = useState("")
  const [profileMajor, setProfileMajor] = useState("Công nghệ thông tin")
  const [profileYear, setProfileYear] = useState("2022")
  const [profileDesc, setProfileDesc] = useState("Đang tìm hiểu lộ trình học tập tối ưu")
  const [isSaved, setIsSaved] = useState(false)

  const { scrollRef, isAutoScrollEnabled, scrollToBottom } = useAutoScroll([messages, isChatLoading])

  // Sync language selection on load
  useEffect(() => {
    const savedLang = localStorage.getItem("app_lang") as 'vi' | 'en';
    if (savedLang === 'en' || savedLang === 'vi') {
      setLang(savedLang);
    }
    // Keep mindmap mode disabled by default
  }, [])

  // Sync profile editing fields with User Context
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "")
      setProfileEmail(user.email || "")
      setProfilePhoto(user.photoURL || "")
      
      const userProfileKey = `student_profile_${user.uid}`;
      const cachedProfileRaw = localStorage.getItem(userProfileKey);
      if (cachedProfileRaw) {
        try {
          const profile = JSON.parse(cachedProfileRaw);
          setProfileMajor(profile.major || "Công nghệ thông tin");
          setProfileYear(profile.enrollment_year || "2022");
          setProfileDesc(profile.description || "Đang tìm hiểu lộ trình học tập tối ưu");
        } catch (e) {
          console.error(e);
        }
      } else {
        const legacyMajor = localStorage.getItem("mock_profile_major") || "Công nghệ thông tin";
        const legacyYear = localStorage.getItem("mock_profile_year") || "2022";
        const legacyDesc = localStorage.getItem("mock_profile_desc") || "Đang tìm hiểu lộ trình học tập tối ưu";
        setProfileMajor(legacyMajor);
        setProfileYear(legacyYear);
        setProfileDesc(legacyDesc);
      }
    }
  }, [user])

  // After auth state resolves: init guest id OR fetch authenticated sessions
  useEffect(() => {
    if (isUserLoading) return;

    if (user) {
      setGuestSessionId(null);
      fetchSessions(undefined);
    } else {
      const id = ensureGuestSessionId();
      setGuestSessionId(id);
      fetchSessions(id);
    }
  }, [user, isUserLoading])

  const activeGuestId = (): string | undefined =>
    user ? undefined : (guestSessionId ?? undefined);

  const fetchSessions = async (guestId: string | undefined) => {
    try {
      const data = await chatApi.getSessions(guestId);
      setSessionList(data.sessions || []);
    } catch (error) {
      console.error("Lỗi lấy sessions:", error);
    }
  }

  const handleSelectSession = async (id: string) => {
    setSessionId(id);
    setIsChatLoading(true);
    try {
      const data = await chatApi.getChatHistory(id, activeGuestId());
      setMessages(data.messages);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
    } finally {
      setIsChatLoading(false);
    }
  }

  const handleSendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isChatLoading) return;

    addMessage({ role: 'user', content: trimmedText })

    const isGibberish =
      /(.)\1{6,}/.test(trimmedText) ||
      trimmedText.split(/\s+/).some((w) => w.length > 30);

    if (isGibberish) {
      addMessage({ role: 'ai', content: lang === 'vi' ? "Hình như bạn đang gõ phím ngẫu nhiên thì phải? Hãy nhập một câu hỏi rõ ràng hơn nhé!" : "It seems like you are typing randomly? Please input a clear question!" });
      return;
    }

    if (trimmedText.length > 2000) {
      addMessage({ role: 'ai', content: lang === 'vi' ? "Tin nhắn của bạn dài quá. Tóm tắt lại ý chính giúp mình được không?" : "Your message is too long. Please summarize the key points!" });
      return;
    }

    setIsChatLoading(true);
    const guestId = activeGuestId();
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    // Profile metadata payload sent along to /chat/stream
    const profilePayload = {
      major: profileMajor,
      enrollment_year: profileYear,
      description: profileDesc
    };

    try {
      addMessage({ role: 'ai', content: "" });
      
      const response = await chatApi.sendMessageStream(
        sessionId, 
        trimmedText, 
        guestId, 
        newAbortController.signal,
        profilePayload
      );
      
      if (!response.body) throw new Error("No response body");
      
      const returnedSessionId = response.headers.get("x-session-id") || response.headers.get("X-Session-Id");
      if (returnedSessionId && !sessionId) {
          setSessionId(returnedSessionId);
          fetchSessions(guestId);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
          if (newAbortController.signal.aborted) break;
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
              const chunk = decoder.decode(value, { stream: true });
              if (chunk) updateLastMessage((prev) => prev + chunk);
          }
      }
      const tail = decoder.decode();
      if (tail) updateLastMessage((prev) => prev + tail);
      
      if (!sessionId) {
        fetchSessions(guestId);
      }
    } catch (error: unknown) {
      if ((error as { name?: string }).name === "AbortError") {
          console.log("Stream stopped by user");
      } else {
          console.error("Lỗi gọi API:", error);
          updateLastMessage((prev) => prev ? prev + (lang === 'vi' ? "\n[Lỗi kết nối xảy ra!]" : "\n[Connection error occurred!]") : (lang === 'vi' ? "Có lỗi kết nối xảy ra! Thử lại nhé." : "Connection error occurred! Please try again."));
      }
    } finally {
      setIsChatLoading(false);
      setAbortController(null);
    }
  }

  const handleNewChat = () => {
    setSessionId(null);
    clearMessages();
  }

  const handleLogoutAndReturnToGuest = () => {
    handleLogout();
  }

  const handleSaveProfile = () => {
    if (user) {
      const profile = {
        major: profileMajor,
        enrollment_year: profileYear,
        description: profileDesc
      };
      localStorage.setItem(`student_profile_${user.uid}`, JSON.stringify(profile));
      localStorage.setItem("mock_profile_major", profileMajor);
      localStorage.setItem("mock_profile_year", profileYear);
      localStorage.setItem("mock_profile_desc", profileDesc);
      
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setIsProfileOpen(false);
      }, 1000);
    }
  }

  const toggleLanguage = () => {
    const nextLang = lang === 'vi' ? 'en' : 'vi';
    setLang(nextLang);
    localStorage.setItem("app_lang", nextLang);
  }

  const toggleMindmapMode = () => {
    const nextMode = !isMindmapMode;
    setIsMindmapMode(nextMode);
    localStorage.setItem("app_mindmap_mode", String(nextMode));
  }

  // Extract mindmap markdown from the last AI message
  const extractMindmapMarkdown = (): string => {
    const aiMsgs = messages.filter(m => m.role === 'ai' && m.content);
    if (aiMsgs.length === 0) return "";
    return aiMsgs[aiMsgs.length - 1].content;
  }

  const t = translations[lang]
  const mindmapMarkdown = extractMindmapMarkdown()

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-radial from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <span className="text-sm font-medium text-muted-foreground animate-pulse">{t.loading}</span>
        </div>
      </div>
    )
  }

  const userIsMock = user?.uid.startsWith("mock-");

  return (
    <SidebarProvider>
      <AppSidebar
        sessions={sessionList}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />
      <SidebarInset className="relative flex flex-col h-[100dvh] overflow-hidden bg-slate-50/50 dark:bg-zinc-950/50 backdrop-blur-sm transition-all duration-300">
        
        {/* Spatial background gradients (static — animating large blur radii here was the main source of jank) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-200/20 dark:bg-cyan-900/10 blur-[90px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-200/20 dark:bg-indigo-900/10 blur-[100px]" />
          <div className="absolute top-[35%] right-[25%] w-[400px] h-[400px] rounded-full bg-purple-200/15 dark:bg-purple-900/5 blur-[80px]" />
        </div>

        {/* Glassmorphic Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-white/10 dark:border-zinc-800/30 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md px-6 shadow-xs">
          <div className="flex items-center gap-2 flex-1">
            <SidebarTrigger className="-ml-1 text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-xl" />
            <Separator orientation="vertical" className="mx-2 h-4 bg-white/20 dark:bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-500 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-indigo-400 bg-clip-text text-transparent">
                {t.ragAssistant}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Mindmap Thinking Toggle Button hidden */}

            {/* Language sliding switch toggle */}
            <div 
              onClick={toggleLanguage}
              className="relative flex items-center bg-slate-200/50 dark:bg-zinc-800/50 p-0.5 rounded-full w-[64px] h-7 cursor-pointer border border-white/20 select-none transition-all duration-300"
              title={lang === 'vi' ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            >
              <div 
                className={`absolute top-0.5 bottom-0.5 w-[28px] rounded-full bg-white dark:bg-zinc-700 shadow-xs border border-slate-200/30 transition-all duration-300 ${
                  lang === 'vi' ? 'left-0.5' : 'left-[33px]'
                }`} 
              />
              <div className="flex w-full justify-between items-center text-[10px] font-extrabold z-10 px-2 pointer-events-none">
                <span className={lang === 'vi' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}>VI</span>
                <span className={lang === 'en' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}>EN</span>
              </div>
            </div>

            {/* Dark Mode Switcher */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 rounded-xl bg-white/40 dark:bg-zinc-900/40 border-white/20 dark:border-zinc-800/50 hover:bg-white/80"
              title={theme === 'dark' ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
            >
              {theme === 'dark' ? (
                <Sun size={14} className="text-yellow-500 animate-spin-slow" />
              ) : (
                <Moon size={14} className="text-slate-500" />
              )}
            </Button>

            {/* Quick Mock Customizer Access */}
            {userIsMock && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsProfileOpen(true)}
                className="h-8 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs border-white/20 dark:border-zinc-800/50 hover:bg-white/80 rounded-xl shadow-xs transition-all duration-300 flex items-center gap-2 px-3"
              >
                <Settings size={14} className="text-slate-500 dark:text-slate-400" />
                <span className="hidden md:inline text-[11px] font-semibold text-slate-600 dark:text-slate-300">{t.bypassConfig}</span>
              </Button>
            )}

            {/* Profile Dropdown */}
            <div className="flex items-center gap-1 border-l border-white/20 dark:border-zinc-800 pl-3 md:pl-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <div 
                        className="h-8 w-8 overflow-hidden rounded-full border border-white/40 dark:border-zinc-700 shadow-sm cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => setIsProfileOpen(true)}
                      >
                        <Image
                          width={32}
                          height={32}
                          src={user.photoURL}
                          alt={user.name || "User avatar"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <UserCircle size={28} className="text-zinc-400 cursor-pointer" onClick={() => setIsProfileOpen(true)} />
                    )}
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-zinc-300 max-w-[120px] truncate">{user.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/30">
                        <ChevronDown size={14} className="text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-white/20 rounded-xl shadow-lg mt-1">
                      <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="text-xs focus:bg-indigo-50/50 dark:focus:bg-indigo-950/20">
                        {lang === 'vi' ? 'Cập nhật Hồ sơ học tập' : 'Update Academic Profile'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogoutAndReturnToGuest} className="text-xs text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20">
                        {t.logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 rounded-xl bg-white/40 dark:bg-zinc-900/40 border-white/20"
                >
                  <LogIn size={14} />
                  <span className="text-xs">{t.login}</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content & Side-by-Side Area */}
        <div className="flex flex-col flex-1 relative overflow-hidden z-10">
          <div className={`flex flex-1 w-full h-full ${isMindmapMode ? "flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 dark:divide-zinc-800/30" : "flex-col"}`}>

            {/* Left Pane (Chat Thread) */}
            <div className={`flex flex-col relative overflow-hidden ${isMindmapMode ? "w-full md:w-1/2 h-full" : "w-full h-full"}`}>
              <div className="flex-1 overflow-y-auto w-full scroll-smooth" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center p-8 max-w-2xl mx-auto text-center">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 to-indigo-600 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-200/50 dark:shadow-none mb-6 animate-float">
                      <Sparkles size={32} />
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-indigo-400 bg-clip-text text-transparent mb-3">
                      {user ? `${t.welcome}, ${user.name}!` : `${t.welcome}!`}
                    </h1>
                    
                    <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                      {t.welcomeSub}
                    </p>

                    {!user && (
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-4">
                        {lang === 'vi' ? "Bạn đang dùng với tư cách khách." : "You are using a guest account."}{' '}
                        <button
                          onClick={() => router.push("/login")}
                          className="underline hover:text-slate-600 dark:hover:text-zinc-300 transition-colors font-medium cursor-pointer"
                        >
                          {t.login}
                        </button>{' '}
                        {lang === 'vi' ? "để đồng bộ lịch sử hội thoại." : "to sync chat history."}
                      </p>
                    )}

                    {/* Nút mở popup Hướng dẫn nhanh + Demo mô phỏng */}
                    <button
                      type="button"
                      onClick={() => setShowGuideDemo(true)}
                      className="mt-8 flex items-center gap-2 rounded-full border border-white/30 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs px-4 py-2 text-sm font-medium text-slate-600 dark:text-zinc-300 shadow-xs hover:bg-white/70 dark:hover:bg-zinc-800/60 transition-all duration-300 cursor-pointer"
                    >
                      <HelpCircle size={16} className="text-indigo-500" />
                      {lang === 'vi' ? "Hướng dẫn nhanh & Demo" : "Quick guide & Demo"}
                    </button>

                    <Dialog open={showGuideDemo} onOpenChange={setShowGuideDemo}>
                      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <DialogTitle className="flex items-center gap-2 text-base">
                          <Lightbulb size={18} className="text-amber-500" />
                          {lang === 'vi' ? "Cách dùng nhanh" : "Quick guide"}
                        </DialogTitle>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-zinc-400 text-left">
                          <li>
                            • {lang === 'vi'
                              ? "Đặt câu hỏi về môn học, lộ trình học hoặc chương trình đào tạo bạn cần."
                              : "Ask about a course, learning path, or curriculum you need."}
                          </li>
                          <li>
                            • {lang === 'vi' ? "Nhấn" : "Press"} <span className="font-medium text-slate-800 dark:text-white">Enter</span> {lang === 'vi' ? "để gửi," : "to send,"} <span className="font-medium text-slate-800 dark:text-white">Shift + Enter</span> {lang === 'vi' ? "để xuống dòng." : "for a new line."}
                          </li>
                          <li>
                            • {lang === 'vi'
                              ? `Có thể bấm "${t.stopResponse}" nếu muốn dừng câu trả lời giữa chừng.`
                              : `Click "${t.stopResponse}" to stop the answer midway.`}
                          </li>
                        </ul>

                        <ChatDemoPreview standalone />
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="pb-32 pt-6">
                    <MessagesContrainer 
                      messages={messages} 
                      isChatLoading={isChatLoading} 
                      lang={lang} 
                      onEditMessage={(idx, newText) => {
                        const nextMsgs = messages.slice(0, idx);
                        setMessages(nextMsgs);
                        handleSendMessage(newText);
                      }}
                      onRetry={(idx) => {
                        if (idx > 0 && messages[idx - 1].role === 'user') {
                          const lastQuery = messages[idx - 1].content;
                          const nextMsgs = messages.slice(0, idx - 1);
                          setMessages(nextMsgs);
                          handleSendMessage(lastQuery);
                        }
                      }}
                    />
                    
                    {/* Typing Indicator */}
                    {isChatLoading && messages.length > 0 && messages[messages.length - 1].role === 'ai' && messages[messages.length - 1].content === "" && (
                      <div className="w-full max-w-3xl mx-auto px-6 py-2 flex justify-start">
                        <div className="flex items-center gap-1.5 px-4 py-3 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs border border-white/20 rounded-2xl rounded-tl-none shadow-xs w-fit">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Scroll to Bottom Button */}
              {!isAutoScrollEnabled && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-28 right-8 z-50 rounded-full shadow-lg border border-white/20 bg-white/70 dark:bg-zinc-900/70 dark:border-zinc-800/50 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white"
                  onClick={scrollToBottom}
                >
                  <ArrowDown size={16} className="text-slate-600 dark:text-zinc-300" />
                </Button>
              )}

              {/* Floating Glass Chat Input Area */}
              <div className="absolute bottom-0 left-0 right-0 z-30 pt-2 pb-6 px-4 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 pointer-events-none">
                <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                  <div className="relative">
                    {isChatLoading && (
                      <div className="flex justify-center absolute -top-12 left-0 right-0 z-10">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => abortController?.abort()} 
                          className="rounded-full shadow-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-xs border-white/20 dark:border-zinc-800/50 hover:bg-white flex items-center gap-1.5"
                        >
                          <Loader2 size={12} className="animate-spin text-red-500" />
                          {t.stopResponse}
                        </Button>
                      </div>
                    )}
                    <div className="backdrop-blur-lg bg-white/60 dark:bg-zinc-900/60 border border-white/30 dark:border-zinc-800/50 shadow-lg shadow-slate-100/50 dark:shadow-none rounded-2xl p-1">
                      <ChatInput onSend={handleSendMessage} disabled={isChatLoading} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane (Interactive Mindmap Canvas) */}
            {isMindmapMode && (
              <div className={`${
                isMindmapMaximized 
                  ? "absolute md:fixed inset-0 z-50 bg-slate-50 dark:bg-zinc-950 p-6 flex flex-col animate-fade-in" 
                  : "w-full md:w-1/2 h-full bg-slate-100/10 dark:bg-zinc-950/10 p-4 flex flex-col relative overflow-hidden z-20"
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <Globe className="text-indigo-500 animate-pulse" size={16} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      {lang === 'vi' ? "Sơ đồ Lộ trình Học tập (Markmap)" : "Interactive Learning Path (Markmap)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {mindmapMarkdown && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => mindmapRef.current?.download()}
                        className="text-xs h-7 px-3 rounded-lg border-white/20 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs font-semibold"
                      >
                        {lang === 'vi' ? "Tải xuống PNG" : "Download PNG"}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setIsMindmapMaximized(!isMindmapMaximized)}
                      className="h-7 w-7 rounded-lg border-white/20 bg-white/40 dark:bg-zinc-900/40"
                      title={isMindmapMaximized ? (lang === 'vi' ? "Thu nhỏ" : "Phóng to") : (lang === 'vi' ? "Phóng to" : "Maximize")}
                    >
                      {isMindmapMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 relative">
                  {mindmapMarkdown ? (
                    <MindmapViewer 
                      ref={mindmapRef} 
                      markdown={mindmapMarkdown} 
                      isDark={theme === 'dark'} 
                    />
                  ) : (
                    /* Mindmap Empty State with guidelines */
                    <div className="h-full flex flex-col justify-center items-center p-6 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl bg-white/25 dark:bg-zinc-900/25 backdrop-blur-sm">
                      <Globe size={40} className="text-indigo-500/50 mb-4 animate-spin-slow" />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-2">
                        {lang === 'vi' ? "Mindmap Lộ trình Học tập" : "Study Path Mindmap"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mb-5 leading-relaxed">
                        {lang === 'vi' 
                          ? "Hãy đặt câu hỏi tư vấn lộ trình học tập để hệ thống tự động vẽ sơ đồ tri thức tương tác tại đây!" 
                          : "Ask for a study roadmap/learning path, and the system will automatically render it as an interactive mindmap here!"}
                      </p>
                      <div className="space-y-2 max-w-sm text-left text-[11px] text-slate-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-white/30">
                        <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider block mb-1">
                          {lang === 'vi' ? "💡 Gợi ý câu hỏi:" : "💡 Suggested prompts:"}
                        </span>
                        <div className="space-y-1.5">
                          <button 
                            onClick={() => handleSendMessage(lang === 'vi' ? "Lộ trình học tập các môn chuyên ngành Hệ thống thông tin cho Backend Developer khóa 2022" : "Learning roadmap for HTTT major specializing in Backend Development for class of 2022")}
                            className="w-full text-left hover:underline text-indigo-600 dark:text-indigo-400 cursor-pointer"
                          >
                            • {lang === 'vi' ? "Lộ trình HTTT khóa 2022 cho Backend Dev" : "HTTT 2022 roadmap for Backend Dev"}
                          </button>
                          <button 
                            onClick={() => handleSendMessage(lang === 'vi' ? "Tôi là sinh viên K2022 ngành CNTT. Hãy lập lộ trình học các môn bắt buộc để tốt nghiệp đúng hạn." : "I am a K2022 student in CNTT major. Please map out core courses to graduate on time.")}
                            className="w-full text-left hover:underline text-indigo-600 dark:text-indigo-400 cursor-pointer"
                          >
                            • {lang === 'vi' ? "Lộ trình CNTT K2022 hoàn thành môn bắt buộc" : "CNTT K2022 roadmap for core courses"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Simplified Student Profile Editor Slide-out Drawer */}
        {isProfileOpen && user && (
          <div className="absolute inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 flex justify-end">
            
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setIsProfileOpen(false)} />
            
            {/* Drawer Container (Frosted Glass Panel) */}
            <div className="relative w-full max-w-md h-full bg-white/80 dark:bg-zinc-900/80 border-l border-white/20 dark:border-zinc-800 backdrop-blur-xl shadow-2xl p-6 flex flex-col z-10 transition-transform duration-500 animate-slide-in">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="text-indigo-500" size={20} />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">{lang === 'vi' ? 'Hồ sơ học tập sinh viên' : 'Student Study Profile'}</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsProfileOpen(false)}
                  className="rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Drawer Body (Form) */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-2.5 text-xs text-indigo-700 dark:text-indigo-300">
                  <HelpCircle size={16} className="shrink-0 mt-0.5" />
                  <p>
                    {lang === 'vi' ? 'Cấu hình thông tin học tập của bạn để hệ thống RAG tối ưu hóa câu trả lời tư vấn môn học và sơ đồ lộ trình.' : 'Configure your study details to personalize course advisements and learning path roadmaps.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t.studyProfile}</h3>

                  {/* Major */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-zinc-300">{t.major}</label>
                    <select
                      value={profileMajor}
                      onChange={(e) => setProfileMajor(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                      <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                      <option value="Khoa học máy tính">Khoa học máy tính</option>
                      <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                      <option value="An toàn thông tin">An toàn thông tin</option>
                    </select>
                  </div>

                  {/* Enrollment Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-zinc-300">{t.enrollmentYear}</label>
                    <input 
                      type="text" 
                      value={profileYear} 
                      onChange={(e) => setProfileYear(e.target.value)}
                      placeholder="2022"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Bio/Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-zinc-300">{t.bio}</label>
                    <textarea 
                      rows={3}
                      value={profileDesc} 
                      onChange={(e) => setProfileDesc(e.target.value)}
                      placeholder="Muốn tìm hiểu lộ trình tốt nghiệp sớm..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 mt-6 flex gap-3">
                <Button 
                  onClick={() => setIsProfileOpen(false)}
                  variant="outline" 
                  className="flex-1 rounded-xl text-xs py-2.5 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400"
                >
                  {t.close}
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  className="flex-1 rounded-xl text-xs py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none"
                >
                  {isSaved ? (
                    <>
                      <Check size={14} />
                      {t.saved}
                    </>
                  ) : (
                    <>
                      {t.saveChanges}
                    </>
                  )}
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* Floating frosted login modal overlay */}
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-fade-in p-4">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={closeLoginModal} />
            
            {/* Login Card */}
            <div className="relative w-full max-w-sm bg-white/95 dark:bg-zinc-900/95 border border-white/20 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-scale-in flex flex-col z-10 animate-fade-in">
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeLoginModal}
                className="absolute top-4 right-4 rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X size={16} />
              </Button>
              
              <div className="text-center mb-5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center text-white shadow-md mx-auto mb-2.5">
                  <Sparkles size={22} />
                </div>
                <h2 className="text-xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-indigo-400 bg-clip-text text-transparent">{lang === 'vi' ? 'Đăng nhập hệ thống' : 'Login to System'}</h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{lang === 'vi' ? 'Cổng học tập thông minh cá nhân' : 'Personal Intelligent Study Hub'}</p>
              </div>

              <form onSubmit={handleModalLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Email<span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={loginEmail}
                    placeholder="Enter student email"
                    className={`w-full text-xs px-3 py-2 border rounded-xl outline-none transition-all dark:bg-zinc-950/50 dark:border-zinc-800 ${
                      loginErrors.email ? "border-red-500 bg-red-50/50" : "border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginErrors.email) setLoginErrors({ ...loginErrors, email: "" });
                    }}
                  />
                  {loginErrors.email && <p className="text-red-500 text-[10px] italic">{loginErrors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Mật khẩu<span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={loginPassword}
                    placeholder="Enter password"
                    className={`w-full text-xs px-3 py-2 border rounded-xl outline-none transition-all dark:bg-zinc-950/50 dark:border-zinc-800 ${
                      loginErrors.password ? "border-red-500 bg-red-50/50" : "border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginErrors.password) setLoginErrors({ ...loginErrors, password: "" });
                    }}
                  />
                  {loginErrors.password && <p className="text-red-500 text-[10px] italic">{loginErrors.password}</p>}
                </div>

                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                  <label className="flex items-center gap-1 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300 dark:bg-zinc-950"
                      checked={loginRemember}
                      onChange={(e) => setLoginRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                </div>

                <Button
                  disabled={isLoginSubmitting}
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 text-white py-2.5 rounded-xl font-bold hover:shadow-md transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
                >
                  {isLoginSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isLoginSubmitting ? (lang === 'vi' ? "Đang xử lý..." : "Logging in...") : "Login"}
                </Button>
              </form>

              <p className="mt-5 text-center text-[11px] text-zinc-500">
                {lang === 'vi' ? "Chưa có tài khoản?" : "Don't have an account?"}{' '}
                <button onClick={switchToSignup} className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline cursor-pointer">{lang === 'vi' ? "Đăng ký" : "Register"}</button>
              </p>
            </div>
          </div>
        )}

        {/* Floating frosted signup modal overlay */}
        {isSignupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-fade-in p-4">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={closeSignupModal} />

            {/* Signup Card */}
            <div className="relative w-full max-w-sm bg-white/95 dark:bg-zinc-900/95 border border-white/20 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-scale-in flex flex-col z-10 animate-fade-in">

              <Button
                variant="ghost"
                size="icon"
                onClick={closeSignupModal}
                className="absolute top-4 right-4 rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X size={16} />
              </Button>

              <div className="text-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center text-white shadow-md mx-auto mb-2.5">
                  <Sparkles size={22} />
                </div>
                <h2 className="text-xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-indigo-400 bg-clip-text text-transparent">{lang === 'vi' ? 'Tạo tài khoản' : 'Create Account'}</h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{lang === 'vi' ? 'Cổng học tập thông minh cá nhân' : 'Personal Intelligent Study Hub'}</p>
              </div>

              <form onSubmit={handleModalSignup} className="space-y-2.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Họ và tên<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={signupData.fullname}
                    placeholder="Nhập họ và tên"
                    className={`w-full text-xs px-3 py-2 border rounded-xl outline-none transition-all dark:bg-zinc-950/50 dark:border-zinc-800 ${
                      signupErrors.fullname ? "border-red-500 bg-red-50/50 dark:bg-red-900/20" : "border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                    onChange={(e) => {
                      setSignupData({ ...signupData, fullname: e.target.value });
                      if (signupErrors.fullname) setSignupErrors({ ...signupErrors, fullname: "" });
                    }}
                  />
                  {signupErrors.fullname && <p className="text-red-500 text-[10px] italic">{signupErrors.fullname}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Mã sinh viên<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={signupData.studentCode}
                    placeholder="Nhập mã sinh viên"
                    className={`w-full text-xs px-3 py-2 border rounded-xl outline-none transition-all dark:bg-zinc-950/50 dark:border-zinc-800 ${
                      signupErrors.studentCode ? "border-red-500 bg-red-50/50 dark:bg-red-900/20" : "border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                    onChange={(e) => {
                      setSignupData({ ...signupData, studentCode: e.target.value });
                      if (signupErrors.studentCode) setSignupErrors({ ...signupErrors, studentCode: "" });
                    }}
                  />
                  {signupErrors.studentCode && <p className="text-red-500 text-[10px] italic">{signupErrors.studentCode}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Email<span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={signupData.email}
                    placeholder="Nhập địa chỉ email"
                    className={`w-full text-xs px-3 py-2 border rounded-xl outline-none transition-all dark:bg-zinc-950/50 dark:border-zinc-800 ${
                      signupErrors.email ? "border-red-500 bg-red-50/50 dark:bg-red-900/20" : "border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                    onChange={(e) => {
                      setSignupData({ ...signupData, email: e.target.value });
                      if (signupErrors.email) setSignupErrors({ ...signupErrors, email: "" });
                    }}
                  />
                  {signupErrors.email && <p className="text-red-500 text-[10px] italic">{signupErrors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Mật khẩu<span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={signupData.password}
                    placeholder="Tối thiểu 6 ký tự"
                    className={`w-full text-xs px-3 py-2 border rounded-xl outline-none transition-all dark:bg-zinc-950/50 dark:border-zinc-800 ${
                      signupErrors.password ? "border-red-500 bg-red-50/50 dark:bg-red-900/20" : "border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                    onChange={(e) => {
                      setSignupData({ ...signupData, password: e.target.value });
                      if (signupErrors.password) setSignupErrors({ ...signupErrors, password: "" });
                    }}
                  />
                  {signupErrors.password && <p className="text-red-500 text-[10px] italic">{signupErrors.password}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Xác nhận mật khẩu<span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full text-xs px-3 py-2 border rounded-xl outline-none transition-all dark:bg-zinc-950/50 dark:border-zinc-800 ${
                      signupErrors.confirmPassword ? "border-red-500 bg-red-50/50 dark:bg-red-900/20" : "border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                    onChange={(e) => {
                      setSignupData({ ...signupData, confirmPassword: e.target.value });
                      if (signupErrors.confirmPassword) setSignupErrors({ ...signupErrors, confirmPassword: "" });
                    }}
                  />
                  {signupErrors.confirmPassword && <p className="text-red-500 text-[10px] italic">{signupErrors.confirmPassword}</p>}
                </div>

                <Button
                  disabled={isSignupSubmitting}
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 text-white py-2.5 rounded-xl font-bold hover:shadow-md transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
                >
                  {isSignupSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSignupSubmitting ? (lang === 'vi' ? "Đang xử lý..." : "Creating...") : (lang === 'vi' ? "Tạo tài khoản" : "Create Account")}
                </Button>
              </form>

              <p className="mt-4 text-center text-[11px] text-zinc-500">
                {lang === 'vi' ? "Đã có tài khoản?" : "Already have an account?"}{' '}
                <button onClick={switchToLogin} className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline cursor-pointer">{lang === 'vi' ? "Đăng nhập" : "Login"}</button>
              </p>
            </div>
          </div>
        )}

      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-xs font-bold text-slate-400 dark:text-zinc-500 animate-pulse flex items-center gap-2">
          <Loader2 className="animate-spin text-indigo-500" size={14} />
          Loading assistant...
        </div>
      </div>
    }>
      <AIAssistantPage />
    </Suspense>
  )
}
