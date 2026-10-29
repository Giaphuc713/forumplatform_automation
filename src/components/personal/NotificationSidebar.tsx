"use client";

import { useState } from "react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications"; // Đường dẫn tới file hook bạn vừa tạo
import { formatForumDate } from "@/components/forum/formatForumDate";
import { Loader2 } from "lucide-react";

export const NotificationSidebar = () => {
    // Gọi hook để lấy dữ liệu và các hàm xử lý
    const {
        notifications,
        loading,
        navigating,
        handleNotificationClick,
    } = useNotifications();

    // State quản lý checkbox lọc thông báo chưa đọc
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    // Lọc danh sách thông báo theo state của checkbox
    const filteredNotifications = notifications.filter((notification) =>
        showUnreadOnly ? !notification.isRead : true
    );

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm min-h-[600px] flex flex-col">
            {/* Header của Sidebar */}
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>

            {/* Filter & Actions */}
            <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showUnreadOnly}
                        onChange={(e) => setShowUnreadOnly(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-zinc-600">Unread</span>
                </label>
                <button
                    // TODO: Thêm hàm markAllAsRead vào useNotifications nếu API của bạn hỗ trợ endpoint này
                    className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Mark all as read
                </button>
            </div>

            {/* Danh sách thông báo */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`cursor-pointer transition-opacity ${navigating === notification.id ? "opacity-50 pointer-events-none" : ""
                                }`}
                        >
                            <NotificationItem
                                type={notification.type.toLowerCase()}
                                title={notification.title}
                                description={notification.content}
                                time={formatForumDate(notification.createdAt)}
                                isUnread={!notification.isRead}
                            />
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-zinc-500 text-center">
                            Không có thông báo nào.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer link */}
            <button className="mt-6 w-full py-2 text-sm font-medium text-zinc-500 hover:text-blue-700 transition-colors border-t border-zinc-100 pt-4">
                View all notifications
            </button>
        </div>
    );
};