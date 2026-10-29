import { create } from "zustand"

export type Message = {
    role: "user" | "ai" | "system"
    content: string
    timestamp?: number
}

type MessageState = {
    messages: Message[]
    addMessage: (message: Message) => void
    setMessages: (messages: Message[]) => void
    clearMessages: () => void
    updateLastMessage: (contentUpdate: string | ((prev: string) => string)) => void
}

export const useMessages = create<MessageState>((set) => ({
    messages: [],

    addMessage: (newMessage) => set((state) => ({
        messages: [
            ...state.messages,
            { ...newMessage, timestamp: Date.now() }
        ]
    })),

    setMessages: (newMessages) => set({
        messages: Array.isArray(newMessages)
            ? newMessages.map((m: any, index) => ({
                role: m.role === "assistant" ? "ai" : "user",
                content: m.content || "",
                timestamp: m.timestamp || Date.now() + index
            }))
            : []
    }),

    clearMessages: () => set({ messages: [] }),

    updateLastMessage: (contentUpdate) => set((state) => {
        if (state.messages.length === 0) return state;
        const lastMsg = state.messages[state.messages.length - 1];
        if (lastMsg.role !== "ai") return state;
        const newContent = typeof contentUpdate === "function" ? contentUpdate(lastMsg.content) : contentUpdate;
        return {
            messages: [
                ...state.messages.slice(0, -1),
                { ...lastMsg, content: newContent }
            ]
        };
    }),
}))