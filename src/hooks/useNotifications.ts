import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Notification } from "@/types/forum";
import { forumService } from "@/services/forum.service";
import { useNotificationCount } from "@/contexts/NotificationContext";

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [navigating, setNavigating] = useState<number | null>(null);

    const { setCount, decrement } = useNotificationCount();
    const router = useRouter();

    // Lấy ID user trực tiếp bên trong hook để đảm bảo luôn lấy đúng lúc runtime
    const currentUserId = Number(Cookies.get("current_user"));

    const fetchNotifications = useCallback(async () => {
        if (!currentUserId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await forumService.getNotifications(currentUserId);
            setNotifications(data);
            setCount(Array.isArray(data) ? data.filter((n) => !n.isRead).length : 0);
        } catch (error) {
            console.error("Failed to load notifications:", error);
            toast.error("Không thể tải thông báo");
        } finally {
            setLoading(false);
        }
    }, [currentUserId, setCount]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            await forumService.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast.success("Đã xóa thông báo");
        } catch (error) {
            console.error("Failed to delete notification:", error);
            toast.error("Xóa thông báo thất bại");
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (navigating !== null) return;
        setNavigating(notification.id);

        try {
            // Đánh dấu đã đọc
            if (!notification.isRead) {
                await forumService.readNotification(notification.id);
                setNotifications((prev) =>
                    prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n)
                );
                decrement();
            }

            // Logic điều hướng
            if (notification.type === "URGENT" || notification.type === "LIKE") {
                const post = await forumService.getPostById(notification.targetId, currentUserId);
                router.push(`/forum/${encodeURIComponent(post.forumName)}?forumId=${post.forumId}&focusPost=${post.id}`);
            } else if (notification.type === "COMMENT" && notification.targetId) {
                const comment = await forumService.getCommentById(notification.targetId);
                const post = await forumService.getPostById(comment.postId, currentUserId);
                router.push(`/forum/${encodeURIComponent(post.forumName)}?forumId=${post.forumId}&focusPost=${post.id}&focusComment=${notification.targetId}`);
            } else if (notification.type === "JOIN_REQUEST" && notification.targetId) {
                router.push(`/forum/approve?forumId=${notification.targetId}`);
            } else if (notification.type === "JOIN" && notification.targetId) {
                const forum = await forumService.getForumById(notification.targetId, currentUserId);
                router.push(`/forum/${encodeURIComponent(forum.name)}?forumId=${notification.targetId}`);
            }
        } catch (error) {
            console.error("Navigation failed:", error);
            toast.error("Không thể chuyển hướng đến bài viết.");
        } finally {
            setNavigating(null);
        }
    };

    return {
        notifications,
        loading,
        navigating,
        handleDelete,
        handleNotificationClick,
        refreshNotifications: fetchNotifications
    };
};