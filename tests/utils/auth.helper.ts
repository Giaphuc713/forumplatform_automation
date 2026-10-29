import fs from 'fs';
import path from 'path';

/**
 * Hàm hỗ trợ trích xuất Access Token từ file playwright/.auth/user.json
 */
export function getAccessToken(): string {
    const authPath = path.join(process.cwd(), 'playwright/.auth/user.json');

    if (!fs.existsSync(authPath)) {
        console.warn(`[AuthHelper] File auth không tồn tại tại: ${authPath}`);
        return '';
    }

    try {
        const authContent = fs.readFileSync(authPath, 'utf-8');
        const authData = JSON.parse(authContent);
        const tokenCookie = authData.cookies?.find((c: any) => c.name === 'access_token');
        return tokenCookie?.value || '';
    } catch (error) {
        console.error('[AuthHelper] Lỗi khi đọc file auth:', error);
        return '';
    }
}

/**
 * Hàm hỗ trợ trích xuất Refresh Token từ file playwright/.auth/user.json
 */
export function getRefreshToken(): string {
    const authPath = path.join(process.cwd(), 'playwright/.auth/user.json');

    if (!fs.existsSync(authPath)) {
        console.warn(`[AuthHelper] File auth không tồn tại tại: ${authPath}`);
        return '';
    }

    try {
        const authContent = fs.readFileSync(authPath, 'utf-8');
        const authData = JSON.parse(authContent);
        const tokenCookie = authData.cookies?.find((c: any) => c.name === 'refresh_token');
        return tokenCookie?.value || '';
    } catch (error) {
        console.error('[AuthHelper] Lỗi khi đọc file auth:', error);
        return '';
    }
}

