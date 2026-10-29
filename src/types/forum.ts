export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: "user" | "admin" | "moderator";
}

export interface ForumPost {
  id: string;
  author: Author;
  createdAt: string;
  title: string;
  content: string;
}

export interface ForumDetails {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  privacy: "Public" | "Private";
  rules: string[];
  moderators: Author[];
}

export interface PostComment {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Post {
  id: number;
  forumId: number;
  forumName: string;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string;
  title: string;
  content: string;
  tags: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  forumAvatarUrl?: string;
  comments?: any[];
}

export interface PaginatedResponse {
  code: number;
  message: string;
  result: {
    content: Post[];
  };
}

export interface ApiComment {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  parentId: number | null;
  createdAt: string | null;
  replies: ApiComment[];
}

export interface CommentPaginatedResponse {
  code: number;
  message: string;
  result: {
    content: ApiComment[];
    totalElements: number;
  };
}
export interface Forum {
  id: number;
  name: string;
  description: string;
  rules: string;
  isPublic: boolean;
  type: "GLOBAL" | "PRIVATE" | string;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string;
  membersCount: number;
  avatarUrl?: string;
  createdAt: string;
  invitationCode: string;
}

export interface ForumMember {
  id: number;
  studentCode: string;
  fullName: string;
  dob: string;
  placeOfBirth: string | null;
  phone: string | null;
  email: string;
  industry: string;
  trainingLevel: string;
  typeOfTraining: string;
  currentPosition: string;
  avatarUrl: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}
export interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  targetId: number;
}
export interface CreateForumRequest {
  name: string;
  description?: string;
  rules?: string;
  isPublic: boolean;
  authorId: number;
  image?: string;
}
export interface PendingInfor {
  studentId: number;
  fullName: string;
  avatarUrl: string;
  email: string;
  role: string;
  status: string; // PENDING ( when owner not approve or reject )
  requestMessage: string;
  joinedAt: string;
}