import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("/ai-assistant?auth=signup");
  await page.getByRole("textbox", { name: "Nhập họ và tên" }).fill("dsd");
  await page.getByRole("textbox", { name: "Nhập mã sinh viên" }).fill("dsdsd");
  await page.getByRole("textbox", { name: "Nhập địa chỉ email" }).fill("dsdsd");
  await page.getByRole("textbox", { name: "Nhập lại mật khẩu" }).fill("dsds");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();

  await expect(page).toHaveURL("/forum");
});
