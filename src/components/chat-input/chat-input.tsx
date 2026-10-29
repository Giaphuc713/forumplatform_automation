"use client"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Send, Loader2 } from "lucide-react" // Thêm Loader2 để làm hiệu ứng loading
import { useUser } from "@/hooks/use-user"

export function ChatInput({ onSend, disabled }: { onSend: (msg: string) => void; disabled?: boolean }) {
    const [text, setText] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const user = useUser()

    const handleInput = () => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${el.scrollHeight}px`
    }

    const handleSend = () => {
        if (!text.trim() || disabled) return

        onSend(text)
        setText("")

        // Reset lại chiều cao textarea sau khi gửi
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <div className={`flex items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all ${disabled ? "opacity-70 bg-muted/50" : ""}`}>

                {/* <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="rounded-full shrink-0 h-10 w-10"
                    disabled={disabled} // Khóa nút thêm file khi đang chat
                >
                    <Plus className="w-5 h-5" />
                </Button> */}

                <Textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onInput={handleInput}
                    disabled={disabled} // KHÓA NHẬP LIỆU
                    onKeyDown={(e) => {
                        // Chỉ gửi khi nhấn Enter (không kèm Shift) và không bị disabled
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                    placeholder={disabled ? "AI đang trả lời..." : "Nhắn tin cho AI..."}
                    rows={1}
                    className="min-h-[40px] max-h-[200px] resize-none border-0 shadow-none bg-transparent focus-visible:ring-0 py-2.5 disabled:cursor-not-allowed"
                />

                <Button
                    onClick={handleSend}
                    size="icon"
                    className="rounded-xl shrink-0 h-10 w-10 transition-all"
                    // Nút gửi sẽ tắt nếu text trống HOẶC đang trong trạng thái loading
                    disabled={!text.trim() || disabled}
                >
                    {disabled ? (
                        <Loader2 className="w-5 h-5 animate-spin" /> // Hiệu ứng xoay khi chờ AI
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </Button>
            </div>
            <p className="text-[10px] text-center mt-2 text-muted-foreground">
                AI có thể đưa ra câu trả lời chưa chính xác. Hãy kiểm tra lại thông tin nhé!
            </p>
        </div>
    )
}
