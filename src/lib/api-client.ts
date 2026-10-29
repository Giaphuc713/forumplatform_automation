import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
    /** true (default): throw + redirect if no token. false: attach token if present, guest header otherwise. */
    requireAuth?: boolean;
    customBaseUrl?: string;
    /** Guest session id — attached as x-guest-session-id header when user is not authenticated. */
    guestSessionId?: string;
    signal?: AbortSignal;
}

export async function fetchClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { requireAuth = true, customBaseUrl, headers, guestSessionId, ...restOptions } = options;

    const isFormData = restOptions.body instanceof FormData;
    let authHeader: Record<string, string> = {};

    if (requireAuth) {
        try {
            const token = await authService.getAuthToken();
            authHeader = { Authorization: `Bearer ${token}` };
        } catch (error) {
            window.location.replace("/login");
            throw new Error("Unauthorized");
        }
    } else {
        const token = Cookies.get("access_token");
        if (token) {
            authHeader = { Authorization: `Bearer ${token}` };
        } else if (guestSessionId) {
            authHeader = { "x-guest-session-id": guestSessionId };
        }
    }

    const config: RequestInit = {
        ...restOptions,
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...authHeader,
            ...headers,
        },
    };

    const finalBaseUrl = customBaseUrl || BASE_URL;
    let response = await fetch(`${finalBaseUrl}${endpoint}`, config);

    if (response.status === 401 && requireAuth) {
        try {
            const newToken = await authService.refreshToken();
            const retryConfig = {
                ...config,
                headers: {
                    ...config.headers,
                    Authorization: `Bearer ${newToken}`,
                },
            };
            response = await fetch(`${finalBaseUrl}${endpoint}`, retryConfig);
        } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            await authService.logout();
            throw new Error("Session expired. Please login again.");
        }
    }

    if (!response.ok) {
        let errorMessage = `Lỗi hệ thống: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) { }
        throw new Error(errorMessage);
    }

    return response.json();
}

export async function fetchStreamClient(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    const { requireAuth = true, customBaseUrl, headers, guestSessionId, ...restOptions } = options;

    const isFormData = restOptions.body instanceof FormData;
    let authHeader: Record<string, string> = {};

    if (requireAuth) {
        try {
            const token = await authService.getAuthToken();
            authHeader = { Authorization: `Bearer ${token}` };
        } catch (error) {
            window.location.replace("/login");
            throw new Error("Unauthorized");
        }
    } else {
        const token = Cookies.get("access_token");
        if (token) {
            authHeader = { Authorization: `Bearer ${token}` };
        } else if (guestSessionId) {
            authHeader = { "x-guest-session-id": guestSessionId };
        }
    }

    const config: RequestInit = {
        ...restOptions,
        signal: options.signal,
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...authHeader,
            ...headers,
        },
    };

    const finalBaseUrl = customBaseUrl || BASE_URL;
    let response = await fetch(`${finalBaseUrl}${endpoint}`, config);

    if (response.status === 401 && requireAuth) {
        try {
            const newToken = await authService.refreshToken();
            const retryConfig = {
                ...config,
                headers: {
                    ...config.headers,
                    Authorization: `Bearer ${newToken}`,
                },
            };
            response = await fetch(`${finalBaseUrl}${endpoint}`, retryConfig);
        } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            await authService.logout();
            throw new Error("Session expired. Please login again.");
        }
    }

    if (!response.ok) {
        let errorMessage = `Lỗi hệ thống: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) { }
        throw new Error(errorMessage);
    }

    return response;
}