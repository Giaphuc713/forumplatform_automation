import { fetchClient, fetchStreamClient } from "@/lib/api-client";

const AI_BASE_URL = process.env.NEXT_PUBLIC_API_AGENTS_URL;

export const chatApi = {
    getSessions(guestSessionId?: string) {
        return fetchClient<any>('/sessions', {
            method: "GET",
            customBaseUrl: AI_BASE_URL,
            requireAuth: false,
            guestSessionId,
        });
    },

    sendMessage(sessionId: string | null, query: string, guestSessionId?: string, profile?: any) {
        return fetchClient<any>('/chat', {
            method: "POST",
            customBaseUrl: AI_BASE_URL,
            requireAuth: false,
            guestSessionId,
            body: JSON.stringify({
                session_id: sessionId,
                query,
                profile,
            }),
        });
    },

    sendMessageStream(sessionId: string | null, query: string, guestSessionId?: string, signal?: AbortSignal, profile?: any) {
        return fetchStreamClient('/chat/stream', {
            method: "POST",
            customBaseUrl: AI_BASE_URL,
            requireAuth: false,
            guestSessionId,
            signal,
            body: JSON.stringify({
                session_id: sessionId,
                query,
                profile,
            }),
        });
    },

    getChatHistory(sessionId: string, guestSessionId?: string) {
        return fetchClient<any>(`/chat/history/${sessionId}`, {
            method: "GET",
            customBaseUrl: AI_BASE_URL,
            requireAuth: false,
            guestSessionId,
        });
    },
};