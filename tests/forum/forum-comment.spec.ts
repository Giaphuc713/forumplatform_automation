import { test, expect, request } from "@playwright/test";
import { getAccessToken } from "@tests/utils/auth.helper";
const impersonatedStudentId = 4;
const postId = 1;
const content = "That could be a great idea";
const parentId = 0;
test.describe('Security Test - Forum Comments', () => {
    test('Bug0 - SECURITY - User A cannot post comment on behalf of User B (Impersonation)', async ({ request }) => {
        const token = getAccessToken();
        const response = await request.post(`/api/v1/forums/comments`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            data: {
                postId: postId,
                studentId: impersonatedStudentId,
                content: content,
                parentId: parentId
            },
        })
        const responseData = await response.json().catch(() => null);
        console.log('[Security Test Log] Status: ', response.status());
        console.log('[Security Test Log] Reponse Data: ', responseData);
        expect(response.status()).toBe(403);
    })
})