import Cookies from 'js-cookie';

const GUEST_SESSION_KEY = 'guest_session_id';
const COOKIE_EXPIRES_DAYS = 365;

export function getGuestSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get(GUEST_SESSION_KEY) ?? null;
}

export function createGuestSessionId(): string {
    const id = crypto.randomUUID();
    Cookies.set(GUEST_SESSION_KEY, id, { path: '/', expires: COOKIE_EXPIRES_DAYS });
    return id;
}

export function ensureGuestSessionId(): string {
    return getGuestSessionId() ?? createGuestSessionId();
}

export function clearGuestSessionId(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove(GUEST_SESSION_KEY, { path: '/' });
}
