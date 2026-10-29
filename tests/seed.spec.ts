import { test, expect } from "@playwright/test";

test("Đăng nhập", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("Phucha2639@gmail.com");
  await page.getByRole("textbox", { name: "Mật khẩu" }).fill("Phuc123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  // Đăng nhập thành công và chuyển hướng đến trang forum
  await expect(page).toHaveURL("/forum", { timeout: 10000 });
});
