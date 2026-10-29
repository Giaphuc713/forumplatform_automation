import * as React from "react"
import { Message } from "@/hooks/use-messages"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { Bot, Loader2, Check, Sparkles, Pencil, RotateCcw, X } from "lucide-react"

interface MessagesProps {
    messages: Message[];
    isChatLoading?: boolean;
    lang?: 'vi' | 'en';
    onEditMessage?: (index: number, newContent: string) => void;
    onRetry?: (index: number) => void;
}

export function MessagesContrainer({ 
    messages, 
    isChatLoading = false, 
    lang = 'vi',
    onEditMessage,
    onRetry
}: MessagesProps) {
    const [step, setStep] = React.useState(0);
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
    const [editBuffer, setEditBuffer] = React.useState("");

    React.useEffect(() => {
        let interval: any;
        if (isChatLoading) {
            setStep(0);
            interval = setInterval(() => {
                setStep((prev) => (prev < 2 ? prev + 1 : prev));
            }, 1800);
        } else {
            setStep(0);
        }
        return () => clearInterval(interval);
    }, [isChatLoading]);

    const handleStartEdit = (index: number, content: string) => {
        setEditingIndex(index);
        setEditBuffer(content);
    }

    const handleSaveEdit = (index: number) => {
        if (editBuffer.trim() && onEditMessage) {
            onEditMessage(index, editBuffer.trim());
        }
        setEditingIndex(null);
    }

    const steps = lang === 'vi' ? [
        "Phân tích câu hỏi & thông tin học tập",
        "Truy vấn đồ thị tri thức",
        "Đang soạn thảo câu trả lời cá nhân hóa..."
    ] : [
        "Analyzing query & student metadata",
        "Querying knowledge graph",
        "Drafting customized study roadmap..."
    ];

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-6">
            {messages.map((message, index) => {
                const isAI = message.role === "ai"
                const isEditing = editingIndex === index

                return (
                    <div
                        key={message.timestamp || index}
                        className={`flex w-full gap-3 animate-fade-in transition-all duration-300 group/msg ${isAI ? "justify-start" : "justify-end"}`}
                    >
                        {/* 1. Area Avatar */}
                        <div className="flex-shrink-0 mt-1">
                            {isAI && (
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-50 to-cyan-50 dark:from-indigo-950/40 dark:to-cyan-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Bot size={18} className="relative z-10 animate-float" />
                                </div>
                            )}
                        </div>

                        {/* 2. Chat Bubble & Timestamp */}
                        <div className={`flex flex-col max-w-[85%] ${isAI ? "items-start" : "items-end"}`}>

                            {/* Bubble Card wrapper */}
                            <div
                                className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-300 relative ${
                                    isAI
                                        ? `backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 text-slate-800 dark:text-zinc-200 rounded-tl-none border border-white/20 dark:border-zinc-800/40`
                                        : "bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-500 text-white rounded-tr-none shadow-md shadow-indigo-100/30 dark:shadow-none border border-indigo-500/10"
                                }`}
                            >
                                {isAI ? (
                                    message.content ? (
                                        <MarkdownRenderer content={message.content} />
                                    ) : (
                                        /* AI Thinking Steps Card */
                                        <div className="flex flex-col gap-2.5 min-w-[260px] md:min-w-[300px]">
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                                                <span>{lang === 'vi' ? "Hệ thống đang xử lý..." : "System is processing..."}</span>
                                            </div>
                                            <div className="space-y-2 mt-1">
                                                {steps.map((text, i) => {
                                                    const isDone = step > i;
                                                    const isActive = step === i;
                                                    return (
                                                        <div key={i} className={`flex items-center gap-2.5 text-xs transition-colors duration-300 ${
                                                            isActive ? "text-slate-800 dark:text-white font-medium" : isDone ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400 dark:text-zinc-600"
                                                        }`}>
                                                            {isDone ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                            ) : isActive ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500 shrink-0" />
                                                            ) : (
                                                                <div className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-zinc-800 shrink-0 bg-slate-50 dark:bg-zinc-950" />
                                                            )}
                                                            <span>{text}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    isEditing ? (
                                        <div className="flex flex-col gap-2 min-w-[220px] md:min-w-[350px]">
                                            <textarea
                                                rows={3}
                                                value={editBuffer}
                                                onChange={(e) => setEditBuffer(e.target.value)}
                                                className="w-full text-xs p-2 rounded-xl bg-white/10 dark:bg-black/20 border border-white/20 text-white outline-none focus:ring-1 focus:ring-white/40 resize-none font-medium"
                                            />
                                            <div className="flex justify-end gap-1.5 mt-1">
                                                <button 
                                                    onClick={() => setEditingIndex(null)}
                                                    className="p-1 px-2.5 rounded-lg text-[10px] font-bold border border-white/20 hover:bg-white/10 text-white/80 transition-all flex items-center gap-1"
                                                >
                                                    <X size={10} />
                                                    {lang === 'vi' ? "Hủy" : "Cancel"}
                                                </button>
                                                <button 
                                                    onClick={() => handleSaveEdit(index)}
                                                    className="p-1 px-2.5 rounded-lg text-[10px] font-bold bg-white text-indigo-600 hover:bg-white/90 transition-all flex items-center gap-1"
                                                >
                                                    <Check size={10} />
                                                    {lang === 'vi' ? "Gửi lại" : "Resend"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        message.content ? (
                                            <div className="whitespace-pre-wrap leading-relaxed break-words font-medium">
                                                {message.content}
                                            </div>
                                        ) : null
                                    )
                                )}
                            </div>

                            {/* 3. Actions / Time label (Pencil icon for user edit, Rotate icon for AI retry) */}
                            <div className="flex items-center gap-2 mt-1 px-1">
                                {message.timestamp && (
                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold tracking-wide">
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                                
                                {!isChatLoading && !isEditing && (
                                    <>
                                        {/* Edit Button for User messages */}
                                        {!isAI && message.content && (
                                            <button
                                                onClick={() => handleStartEdit(index, message.content)}
                                                className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                                                title={lang === 'vi' ? "Chỉnh sửa câu hỏi" : "Edit query"}
                                            >
                                                <Pencil size={11} />
                                            </button>
                                        )}

                                        {/* Retry Button for AI messages */}
                                        {isAI && message.content && onRetry && (
                                            <button
                                                onClick={() => onRetry(index)}
                                                className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                                                title={lang === 'vi' ? "Thử lại câu trả lời" : "Retry response"}
                                            >
                                                <RotateCcw size={11} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                )
            })}
        </div>
    )
}