import { test as setup, expect } from "@playwright/test";
import path from 'path';

// Đường dẫn đúng: từ tests/auth/ lên 2 cấp về root, rồi vào playwright/.auth/
const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('Phucha2639@gmail.com');
    await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('Phuc123!');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // Chờ redirect về /ai-assistant sau khi login thành công
    await page.waitForURL('**/forum', { timeout: 10000 });

    // Lưu toàn bộ cookies + localStorage vào file
    await page.context().storageState({ path: authFile });
});


