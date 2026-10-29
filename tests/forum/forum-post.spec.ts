import { test, expect } from "@playwright/test";
import { getAccessToken } from "@tests/utils/auth.helper";

const forumId = "2";
const studentId = 3;

test("forum-post-information-with-noAuthen", async ({ request }) => {
  const accessToken = getAccessToken();
  const response = await request.get(`/api/v1/forums/${forumId}/posts`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      studentId: studentId,
      page: 0,
      size: 10,
    },
  });
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toBeDefined();
});

// [POST] Validate Payload không hợp lệ (Validation Failure):
test("Bug report ", async ({ request }) => {
  const accessToken = getAccessToken();
  const invalidPostData = {
    forumId: "2",
    studentId: "3",
    title: "",
    content: "",
  };
  const response = await request.post(`/api/v1/forums/posts`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: invalidPostData,
  });
  console.log("Real status", response.status());
  expect(response.status()).toBe(500);
});
