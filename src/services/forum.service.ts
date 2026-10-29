import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import {
  Post,
  ApiComment,
  PaginatedResponse,
  CommentPaginatedResponse,
  Forum,
  ForumMember,
  Notification,
} from "@/types/forum";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ForumService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.api = axios.create({
      baseURL: "",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = Cookies.get("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || original._retry) {
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          return new Promise((resolve) => {
            this.refreshSubscribers.push((token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(this.api(original));
            });
          });
        }

        original._retry = true;
        this.isRefreshing = true;

        try {
          const newToken = await this.doRefresh();
          this.refreshSubscribers.forEach((cb) => cb(newToken));
          this.refreshSubscribers = [];
          original.headers.Authorization = `Bearer ${newToken}`;
          return this.api(original);
        } catch {
          this.refreshSubscribers = [];
          Cookies.remove("access_token", { path: "/" });
          Cookies.remove("refresh_token", { path: "/" });
          if (typeof window !== "undefined") window.location.href = "/login";
          return Promise.reject(error);
        } finally {
          this.isRefreshing = false;
        }
      },
    );
  }

  private async doRefresh(): Promise<string> {
    const refreshToken = Cookies.get("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    const { data } = await axios.post(`${API_URL}/api/v1/auth/refreshtoken`, { refreshToken });
    const newToken: string = data.result.accessToken;
    Cookies.set("access_token", newToken, { path: "/" });
    if (data.result.refreshToken) {
      Cookies.set("refresh_token", data.result.refreshToken, { path: "/" });
    }
    return newToken;
  }

  // support navigate to post detail from notification
  async getPostById(postId: number, studentId: number): Promise<Post> {
    const { data } = await this.api.get<Post>(`/api/v1/forums/posts/${postId}`, {
      params: { studentId },
    });
    return data;
  }

  // support navigate to comment detail from notification
  async getCommentById(commentId: number): Promise<ApiComment> {
    const { data } = await this.api.get<ApiComment>(`/api/v1/forums/comments/${commentId}`);
    return data;
  }
  // Tìm kiếm bài viết
  async searchPosts(
    keyword: string,
    page: number = 0,
    size: number = 10,
  ): Promise<{ posts: Post[]; totalPages: number; totalElements: number }> {
    const { data } = await this.api.get<PaginatedResponse>(
      "/api/v1/forums/posts/search",
      {
        params: { keyword, page, size },
      },
    );
    const result = data.result as any;
    return {
      posts: result.content,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
    };
  }

  // Lấy danh sách comments của một bài viết
  async getComments(
    postId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<ApiComment[]> {
    const { data } = await this.api.get<CommentPaginatedResponse>(
      `/api/v1/forums/posts/${postId}/comments`,
      {
        params: { page, size },
      },
    );
    return data.result.content;
  }

  // Lấy danh sách bài viết của một forum cụ thể
  async getForumPosts(
    forumId: number,
    studentId: number = 1,
    page: number = 0,
    size: number = 10,
  ): Promise<{ posts: Post[]; totalPages: number; totalElements: number }> {
    const { data } = await this.api.get<PaginatedResponse>(
      `/api/v1/forums/${forumId}/posts`,
      {
        params: { studentId, page, size },
      },
    );
    const result = data.result as any;
    return {
      posts: result.content,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
    };
  }

  // Lấy feed bài viết theo studentId
  async getFeed(
    studentId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<{ posts: Post[]; totalPages: number; totalElements: number }> {
    const { data } = await this.api.get<PaginatedResponse>(
      "/api/v1/forums/feed",
      {
        params: { studentId, page, size },
      },
    );
    const result = data.result as any;
    return {
      posts: result.content,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
    };
  }

  // Tạo bài viết mới
  async createPost(formData: FormData): Promise<Post> {
    const { data } = await this.api.post<Post>(
      "/api/v1/forums/posts",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  }

  // Xóa bài viết
  async deletePost(postId: number, authorId: number): Promise<void> {
    await this.api.delete(`/api/v1/forums/posts/${postId}`, {
      params: { authorId },
    });
  }

  // Cập nhật bài viết

  async updatePost(postId: number, payload: FormData, authorId: number): Promise<Post> {
    const { data } = await this.api.put<Post>(
      `/api/v1/forums/posts/${postId}`,
      payload,
      { params: { authorId }, headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  }

  // Tạo comment mới
  async createComment(payload: {
    postId: number;
    studentId: number;
    content: string;
    parentId?: number;
  }): Promise<ApiComment> {
    const { data } = await this.api.post<ApiComment>(
      "/api/v1/forums/comments",
      payload,
    );
    return data;
  }

  // Cập nhật comment
  async updateComment(
    commentId: number,
    authorId: number,
    content: string,
  ): Promise<ApiComment> {
    const { data } = await this.api.put<ApiComment>(
      `/api/v1/forums/comments/${commentId}`,
      { content },
      { params: { authorId } },
    );
    return data;
  }

  // Xóa comment
  async deleteComment(commentId: number, authorId: number): Promise<void> {
    await this.api.delete(`/api/v1/forums/comments/${commentId}`, {
      params: { authorId },
    });
  }
  // Toggle Like/Unlike bài viết
  async toggleLikePost(postId: number, studentId: number): Promise<any> {
    const { data } = await this.api.post(
      `/api/v1/forums/posts/${postId}/like`,
      null,
      {
        params: { studentId },
      },
    );
    return data;
  }
  async isStudentLikedPost(postId: number, studentId: number): Promise<any> {
    const { data } = await this.api.get(`/api/v1/forums/posts/${postId}/is-liked`, {
      params: { studentId },
    });
    return data;
  }

  async toggleUnlikePost(postId: number, studentId: number): Promise<any> {
    const { data } = await this.api.post(
      `/api/v1/forums/posts/${postId}/unlike`,
      null,
      {
        params: { studentId },
      },
    );
    return data;
  }

  async getForums(studentId: number): Promise<Forum[]> {
    const { data } = await this.api.get<Forum[]>(`/api/v1/forums`, {
      params: { studentId },
    });
    return data;
  }

  // this api will join forum using invitation code (message and invitecode is optional to request join private forum by receiving generated code)
  async joinForum(forumId: number, studentId: number, message: string, invitationCode: string): Promise<any> {
    const { data } = await this.api.post(
      `/api/v1/forums/${forumId}/join`,
      null,
      {
        params: { studentId, message, invitationCode },
      },
    );
    return data;
  }

  async leaveForum(forumId: number, studentId: number): Promise<any> {
    const { data } = await this.api.post(
      `/api/v1/forums/${forumId}/leave`,
      null,
      {
        params: { studentId },
      },
    );
    return data;
  }

  async getForumMembers(forumId: number): Promise<ForumMember[]> {
    const { data } = await this.api.get(`/api/v1/forums/${forumId}/members`);
    return data;
  }
  async getForumById(forumId: number, studentId: number): Promise<Forum> {
    const { data } = await this.api.get(`/api/v1/forums/${forumId}`, {
      params: { studentId },
    });
    return data;
  }
  async getJoinedForums(studentId: number): Promise<Forum[]> {
    const { data } = await this.api.get(`/api/v1/forums/student/${studentId}/joined`);
    return data;
  }
  async getNotifications(id: number): Promise<Notification[]> {
    const { data } = await this.api.get(`/api/v1/notifications/${id}`);
    return data;
  }
  async readNotification(id: number): Promise<any> {
    const { data } = await this.api.put(`/api/v1/notifications/${id}/read`);
    return data;
  }
  async deleteNotification(id: number): Promise<any> {
    const { data } = await this.api.delete(`/api/v1/notifications/${id}`);
    return data;
  }
  async getPostsByTag(tag: string, page: number = 0, size: number = 10): Promise<{ posts: Post[]; totalPages: number; totalElements: number }> {
    const { data } = await this.api.get(`/api/v1/forums/posts/tags/${tag}`, {
      params: { page, size },
    });
    return { posts: data.result.content, totalPages: data.totalPages, totalElements: data.totalElements };
  }

  async getPostsByStudentId(studentId: number, page: number, size: number): Promise<Post[]> {
    const { data } = await this.api.get(`/api/v1/forums/student/${studentId}/posts`, {
      params: { page, size },
    });
    return data;
  }
  async getTrendingPosts(page: number = 0, size: number = 10): Promise<{ posts: Post[]; totalPages: number; totalElements: number }> {
    const { data } = await this.api.get('/api/v1/forums/posts/trending', {
      params: { page, size },
    });
    const result = data.result ?? data;
    return { posts: result.content, totalPages: result.totalPages, totalElements: result.totalElements };
  }
  async createForum(payload: { name: string; description?: string; rules?: string; isPublic: boolean; authorId: number, image?: File }): Promise<any> {
    try {
      const formData = new FormData();
      if (payload.image) {
        formData.append('image', payload.image);
      }
      const response = await this.api.post('/api/v1/forums', formData, {
        params: {
          name: payload.name,
          description: payload.description,
          rules: payload.rules,
          isPublic: payload.isPublic,
          authorId: payload.authorId
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error in createForum service:", error);
      throw error;
    }
  }
  // this api will generate invite link for forum ( returning a code)
  async createInvitationCode(forumId: number, ownerId: number): Promise<string> {
    const { data } = await this.api.post(`/api/v1/forums/${forumId}/invite-link`, null, {
      params: { ownerId },
    });
    return data;
  }
  async approveJoinRequest(forumId: number, memberId: number, ownerId: number): Promise<any> {
    const { data } = await this.api.post(`/api/v1/forums/${forumId}/approve`, null, {
      params: { memberId, ownerId },
    });
    return data;
  }

  async rejectJoinRequest(forumId: number, memberId: number, ownerId: number): Promise<any> {
    const { data } = await this.api.post(`/api/v1/forums/${forumId}/reject`, null, {
      params: { memberId, ownerId },
    });
    return data;
  }
  // this api will get pending membership request for a forum
  async getPendingMemberShip(forumId: number, ownerId: number): Promise<any> {
    const { data } = await this.api.get(`/api/v1/forums/${forumId}/requests`, {
      params: { ownerId },
    });
    return data;
  }
  async getForumInforByInviteCode(inviteCode: string): Promise<Forum> {
    const { data } = await this.api.get(`/api/v1/forums/by-code/${inviteCode}`);
    return data;
  }
  async getListForumByOwnerId(ownerId: number): Promise<Forum[]> {
    const { data } = await this.api.get(`/api/v1/forums/author/${ownerId}`);
    return data;
  }
  // delete member of a forum
  async deleteMember(forumId: number, memberId: number, authorId: number): Promise<any> {
    const { data } = await this.api.delete(`/api/v1/forums/${forumId}/members/${memberId}`, {
      params: { authorId },
    });
    return data;
  }

}

// Export một instance duy nhất (Singleton Pattern)
export const forumService = new ForumService();
