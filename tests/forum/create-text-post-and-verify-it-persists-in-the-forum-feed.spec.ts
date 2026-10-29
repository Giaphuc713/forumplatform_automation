import { expect, test } from "@playwright/test";

test.describe("Forum post create, update, and delete", () => {
  test("Create a text post and verify it persists in the forum feed", async ({
    page,
  }) => {
    const title = `CRUD create ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const body = `Body for ${title}`;
    let created = false;

    try {
      // 1. Start authenticated on the forum feed with no post bearing the unique title used by this test.
      await page.goto("/forum");
      await expect(
        page.getByRole("link", { name: "Ha Gia Phuc Ha Gia Phuc" }),
      ).toBeVisible();
      await page.getByText("Best").first().waitFor({ state: "visible" });

      // 2. Open Create, choose a community the user belongs to, enter a unique title and non-empty body, then submit.
      await page.getByRole("link", { name: "Create" }).click();
      await expect(
        page.getByRole("heading", { name: "Create post" }),
      ).toBeVisible();

      const postButton = page.getByRole("button", {
        name: "Post",
        exact: true,
      });
      await expect(postButton).toBeDisabled();
      await page.getByRole("button", { name: "? Select a community" }).click();
      await expect(page.getByText("Your communities")).toBeVisible();
      await page.getByRole("button", { name: /memberOnly/ }).click();

      const titleInput = page.getByPlaceholder("Title*");
      await titleInput.fill(title);
      await expect(postButton).toBeDisabled();
      await page.locator(".ql-editor").fill(body);
      await expect(postButton).toBeEnabled();

      created = true;
      await postButton.click();
      await expect(
        page.getByText("Post created successfully!", { exact: true }),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/forum(?:\/|$)/);

      // 3. Locate the new post by its unique title and reload the feed.
      const article = page
        .locator("article")
        .filter({ has: page.getByRole("heading", { name: title, exact: true }) });
      await expect(article).toHaveCount(1);
      await expect(article.getByRole("heading", { name: title })).toBeVisible();
      await expect(article.getByText(body, { exact: true })).toBeVisible();

      await page.reload();
      const persistedArticle = page
        .locator("article")
        .filter({ has: page.getByRole("heading", { name: title, exact: true }) });
      await expect(persistedArticle).toHaveCount(1);
      await expect(
        persistedArticle.getByRole("heading", { name: title }),
      ).toBeVisible();
      await expect(
        persistedArticle.getByText(body, { exact: true }),
      ).toBeVisible();

      // 4. Delete the test post through its owner menu and confirm the deletion.
      await persistedArticle.getByTestId(/menu-post-/).click();
      await page.getByRole("button", { name: "Delete Post" }).click();
      await expect(
        page.getByText("Delete post?", { exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Delete", exact: true }).click();
      await expect(
        page.getByText("Post deleted successfully!", { exact: true }),
      ).toBeVisible();
      await expect(
        page
          .locator("article")
          .filter({ has: page.getByRole("heading", { name: title, exact: true }) }),
      ).toHaveCount(0);
      created = false;
    } finally {
      if (created) {
        await page.goto("/forum");
        const cleanupArticle = page
          .locator("article")
          .filter({ has: page.getByRole("heading", { name: title, exact: true }) });
        if (await cleanupArticle.count()) {
          await cleanupArticle.getByTestId(/menu-post-/).click();
          await page.getByRole("button", { name: "Delete Post" }).click();
          await page
            .getByRole("button", { name: "Delete", exact: true })
            .click();
          await expect(
            page.getByText("Post deleted successfully!", { exact: true }),
          ).toBeVisible();
          await expect(cleanupArticle).toHaveCount(0);
        }
      }
    }
  });
});
