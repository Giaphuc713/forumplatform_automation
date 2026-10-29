"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Maximize2, Sparkles } from "lucide-react"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type DemoTurn = { question: string; answer: string }

const DEMO_TURNS: DemoTurn[] = [
  {
    question: "Cho tôi hỏi môn này học về những kiến thức gì: Hệ thống thông tin phục vụ trí tuệ kinh doanh",
    answer:
      "Dựa trên dữ liệu môn học **Hệ thống thông tin phục vụ trí tuệ kinh doanh** (CSC12107), nội dung chính gồm:\n\n" +
      "1. **Tổng quan về trí tuệ kinh doanh** - khái niệm BI, quan hệ với hệ hỗ trợ quyết định (DSS).\n" +
      "2. **Data Warehouse** - khái niệm, kiến trúc và quá trình phát triển.\n" +
      "3. **Data Modeling** - lưu trữ dữ liệu theo chiều, bảng dimension/fact.\n" +
      "4. **ETL** - quy trình Extract - Transform - Load.\n" +
      "5. **OLAP** - xử lý phân tích trực tuyến.\n" +
      "6. **Báo cáo & Dashboard** - trực quan hoá hỗ trợ ra quyết định.\n" +
      "7. **Khai thác dữ liệu** - các thuật toán phân tích dự đoán và mô tả.\n\n" +
      "Sau môn học, bạn có thể phân tích yêu cầu kinh doanh và áp dụng vào thiết kế data warehouse thực tế.",
  },
  {
    question: "Môn Cấu trúc dữ liệu và giải thuật có môn tiên quyết nào không?",
    answer:
      "Theo chương trình đào tạo, môn **Cấu trúc dữ liệu và giải thuật** yêu cầu hoàn thành trước:\n\n" +
      "- **Nhập môn lập trình** - nắm vững cú pháp và tư duy giải thuật cơ bản.\n" +
      "- **Toán rời rạc** - hỗ trợ chứng minh độ phức tạp thuật toán.\n\n" +
      "Đây là môn học nền tảng, kiến thức sẽ được dùng lại xuyên suốt các môn chuyên ngành sau này.",
  },
]

type Phase = "typing-question" | "thinking" | "answering" | "pausing" | "fading"

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Trong lúc đang stream, chỉ format in đậm (**...**) bằng cách tách chuỗi thay vì
// parse Markdown đầy đủ (nặng, gây giật). Đoạn ** chưa đóng cặp cũng được in đậm
// luôn để không bao giờ lộ ký tự ** thô ra ngoài.
function renderStreamingText(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function useAutoDemo() {
  const [questionDraft, setQuestionDraft] = useState("")
  const [sentQuestion, setSentQuestion] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState("")
  const [phase, setPhase] = useState<Phase>("typing-question")
  const [faded, setFaded] = useState(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    async function loop() {
      let idx = 0
      while (!cancelledRef.current) {
        const turn = DEMO_TURNS[idx % DEMO_TURNS.length]

        setPhase("typing-question")
        setSentQuestion(null)
        setAnswerText("")
        setQuestionDraft("")

        for (let i = 1; i <= turn.question.length; i++) {
          if (cancelledRef.current) return
          setQuestionDraft(turn.question.slice(0, i))
          await sleep(16)
        }
        await sleep(350)
        if (cancelledRef.current) return

        setSentQuestion(turn.question)
        setQuestionDraft("")
        setPhase("thinking")
        await sleep(800)
        if (cancelledRef.current) return

        setPhase("answering")
        const chunks = turn.answer.split(/(?<=\s)/)
        let acc = ""
        for (const chunk of chunks) {
          if (cancelledRef.current) return
          acc += chunk
          setAnswerText(acc)
          await sleep(22 + Math.random() * 28)
        }
        if (cancelledRef.current) return

        setPhase("pausing")
        await sleep(2500)
        if (cancelledRef.current) return

        setPhase("fading")
        setFaded(true)
        await sleep(400)
        setFaded(false)

        idx++
      }
    }

    loop()
    return () => {
      cancelledRef.current = true
    }
  }, [])

  return { questionDraft, sentQuestion, answerText, phase, faded }
}

type DemoState = ReturnType<typeof useAutoDemo>

function DemoScreen({ compact = false, state }: { compact?: boolean; state: DemoState }) {
  const { questionDraft, sentQuestion, answerText, phase, faded } = state
  const isThinking = phase === "thinking"
  const isStreamingAnswer = phase === "answering"

  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-background shadow-xl">
      {/* Thanh tiêu đề mô phỏng browser */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2.5 sm:px-4 dark:bg-zinc-900/60">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="mx-auto flex items-center gap-1.5 rounded-full border bg-background/70 px-2.5 py-1 text-[10px] text-muted-foreground sm:px-3 sm:text-[11px]">
          <Bot size={12} className="text-blue-500 shrink-0" />
          <span className="truncate">AI Assistant — mô phỏng</span>
        </div>
        <div className="hidden items-center gap-1 text-[11px] text-green-600 sm:flex dark:text-green-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          Live
        </div>
      </div>

      {/* Nội dung hội thoại — cao theo nội dung thực tế, không giới hạn/scroll để tránh giật */}
      <div
        className={`flex flex-col gap-3 p-4 transition-opacity duration-300 sm:p-5 ${compact ? "min-h-64 sm:min-h-72" : "min-h-56 sm:min-h-64"} ${faded ? "opacity-0" : "opacity-100"}`}
      >
        {!sentQuestion && !isThinking && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className={`font-medium text-muted-foreground ${compact ? "text-base sm:text-lg" : "text-sm"}`}>
              Xin chào! Hôm nay tôi có thể giúp gì cho bạn?
            </p>
          </div>
        )}

        {sentQuestion && (
          <div className="flex justify-end">
            <div className={`max-w-[85%] rounded-2xl rounded-tr-none bg-blue-600 px-3 py-2 text-white ${compact ? "text-sm" : "text-xs"}`}>
              {sentQuestion}
            </div>
          </div>
        )}

        {(isThinking || answerText) && (
          <div className="flex justify-start">
            <div className={`max-w-[90%] rounded-2xl rounded-tl-none border bg-white px-3 py-2 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 ${compact ? "text-sm" : "text-xs"}`}>
              {isThinking ? (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/80" style={{ animationDelay: "300ms" }} />
                </div>
              ) : isStreamingAnswer ? (
                // Trong lúc đang stream: hiển thị văn bản thô + con trỏ nhấp nháy,
                // tránh parse Markdown liên tục (nguyên nhân chính gây giật UI).
                <p className="whitespace-pre-wrap leading-relaxed">
                  {renderStreamingText(answerText)}
                  <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-current align-middle" />
                </p>
              ) : (
                <MarkdownRenderer content={answerText} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ô nhập giả lập */}
      <div className="border-t px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
          <span className="truncate">
            {questionDraft || "Nhắn tin cho AI..."}
            {phase === "typing-question" && <span className="animate-pulse">▍</span>}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ChatDemoPreview({ standalone = false }: { standalone?: boolean }) {
  const [open, setOpen] = useState(false)
  const demoState = useAutoDemo()

  // Dùng khi component đã tự nằm trong một modal/khu vực nổi bật khác:
  // chỉ hiển thị khung demo tự chạy, không cần lớp phóng to lồng thêm.
  if (standalone) {
    return (
      <div className="w-full">
        <DemoScreen compact state={demoState} />
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles size={12} className="text-blue-500" />
          Mô phỏng tự động — minh hoạ cách AI trả lời
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="group relative">
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative">
          <DemoScreen state={demoState} />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100 cursor-pointer"
          >
            <span className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
              <Maximize2 size={14} />
              Nhấp để phóng to mô phỏng
            </span>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles size={12} className="text-blue-500" />
          Mô phỏng tự động — minh hoạ cách AI trả lời
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">Mô phỏng AI Assistant</DialogTitle>
          <DemoScreen compact state={demoState} />
        </DialogContent>
      </Dialog>
    </>
  )
}
