"use client";

import { MessageSquare, Bell, Trash2, Loader2 } from "lucide-react";
import { formatForumDate } from "@/components/forum/formatForumDate";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationPage() {
    const {
        notifications,
        loading,
        navigating,
        handleDelete,
        handleNotificationClick
    } = useNotifications();

    const renderIcon = (type: string, isNavigating: boolean) => {
        if (isNavigating) return <Loader2 className="w-6 h-6 animate-spin text-gray-400" />;
        if (type === "COMMENT") return <MessageSquare className="w-6 h-6 text-blue-500" />;
        if (type === "URGENT") return <Bell className="w-6 h-6 text-red-500" />;
        return <Bell className="w-6 h-6 text-gray-500" />;
    };

    return (
        <div className="max-w-3xl mx-auto p-6 font-sans">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h1>

            {loading ? (
                <p className="text-gray-500">Loading notifications...</p>
            ) : (
                <div className="flex flex-col">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`group relative flex items-start p-4 mb-2 rounded-lg transition-colors cursor-pointer ${notification.isRead ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100"
                                } ${navigating === notification.id ? "opacity-60 pointer-events-none" : ""}`}
                        >
                            <div className="flex-shrink-0 mt-1 mr-4">
                                {renderIcon(notification.type, navigating === notification.id)}
                            </div>

                            <div className="flex-1 min-w-0 pr-12">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 truncate mt-0.5">
                                    {notification.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatForumDate(notification.createdAt)}
                                </p>
                            </div>

                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleDelete(e, notification.id)}
                                    className="p-2 bg-white rounded-full shadow-md border hover:bg-gray-200 text-black-50 transition-colors"
                                    aria-label="Delete notification"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No notifications yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}