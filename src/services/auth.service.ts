import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log(API_URL);

class AuthService {
    private refreshTokenPromise: Promise<string> | null = null;

    private setTokens(accessToken: string, refreshToken?: string, userId?: string) {
        if (typeof window !== "undefined") {
            Cookies.set("access_token", accessToken, { path: '/' });
            if (refreshToken) {
                Cookies.set("refresh_token", refreshToken, { path: '/' });
            }
            if (userId) {
                Cookies.set("current_user", userId, { path: '/' });
            }
        }
    }

    private removeTokens() {
        if (typeof window !== "undefined") {
            Cookies.remove("access_token", { path: '/' });
            Cookies.remove("refresh_token", { path: '/' });
            Cookies.remove("current_user", { path: '/' });
        }
    }

    async getAuthToken(): Promise<string> {
        const token = Cookies.get("access_token");
        if (!token) {
            const refreshToken = Cookies.get("refresh_token");
            if (refreshToken) {
                return this.refreshToken();
            }
            // Trả về mock token thay vì bắn lỗi để bypass đăng nhập trên giao diện
            return "mock-jwt-token-xyz";
        }
        return token;
    }

    async loginWithEmail(email: string, pass: string) {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });

            if (!response.ok) throw new Error("Đăng nhập thất bại");

            const data = await response.json();
            const result = data.result

            this.setTokens(result.token, result.refreshToken, result.id);
            return result;
        } catch (error) {
            console.error("Custom BE Login Error:", error);
            throw error;
        }
    }

    async registerWithEmail(email: string, pass: string, fullName: string, studentCode: string) {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass, fullName, studentCode })
            });

            if (!response.ok) throw new Error("Đăng ký thất bại");

            return await response.json();
        } catch (error) {
            console.error("Custom BE Register Error:", error);
            throw error;
        }
    }

    async forgotPassword(email: string) {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!response.ok) throw new Error("Gửi yêu cầu thất bại");
            return { success: true };
        } catch (error) {
            console.error("Custom BE Forgot Password Error:", error);
            throw error;
        }
    }

    async verifyResetCode(code: string) {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            if (!response.ok) throw new Error("Xác thực thất bại");
            const data = await response.json();
            return { success: true, email: data.email };
        } catch (error) {
            console.error("Custom BE Verify Code Error:", error);
            throw error;
        }
    }

    // 6. Đặt mật khẩu mới (Reset Password)
    async resetPassword(code: string, newPass: string) {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: code, newPassword: newPass })
            });
            if (!response.ok) throw new Error("Đặt lại mật khẩu thất bại");
            return { success: true };
        } catch (error) {
            console.error("Custom BE Reset Password Error:", error);
            throw error;
        }
    }

    // 7. Đăng xuất
    async logout() {
        try {
            const token = Cookies.get("access_token");
            if (token) {
                await fetch(`${API_URL}/api/v1/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error("Custom BE Logout Error:", error);
        } finally {
            this.removeTokens();

            if (typeof window !== "undefined") {
                window.location.href = '/ai-assistant';
            }
        }
    }
    async refreshToken() {
        if (this.refreshTokenPromise) {
            return this.refreshTokenPromise;
        }

        this.refreshTokenPromise = (async () => {
            try {
                const refreshToken = Cookies.get("refresh_token");
                if (!refreshToken) throw new Error("No refresh token available");

                const response = await fetch(`${API_URL}/api/v1/auth/refreshtoken`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });

                if (!response.ok) {
                    this.logout();
                    throw new Error("Refresh token expired");
                }

                const data = await response.json();
                const { token, refreshToken: newRefreshToken } = data.result;

                this.setTokens(token, newRefreshToken);
                return token;
            } catch (error) {
                this.logout();
                throw error;
            } finally {
                this.refreshTokenPromise = null;
            }
        })();

        return this.refreshTokenPromise;
    }
}
export const authService = new AuthService();