import {
    MessageSquare,
    Bell,
    Heart,
    UserPlus,
    Users,
    MoreVertical
} from "lucide-react";

interface NotificationItemProps {
    type: string;
    title: string;
    description: string;
    time: string;
    isUnread?: boolean;
    onDelete?: (e: React.MouseEvent) => void;
}

export const NotificationItem = ({
    type,
    title,
    description,
    time,
    isUnread,
    onDelete
}: NotificationItemProps) => {

    const renderIcon = () => {
        switch (type.toUpperCase()) {
            case 'COMMENT':
                return <MessageSquare size={18} className="text-blue-500" />;
            case 'URGENT':
                return <Bell size={18} className="text-red-500" />;
            case 'LIKE':
                return <Heart size={18} className="text-pink-500" />;
            case 'JOIN_REQUEST':
                return <UserPlus size={18} className="text-orange-500" />;
            case 'JOIN':
                return <Users size={18} className="text-green-500" />;
            default:
                return <Bell size={18} className="text-zinc-600" />;
        }
    };

    return (
        <div className={`relative flex gap-3 p-4 rounded-xl bg-zinc-50 border-l-4 transition-all hover:bg-zinc-100 ${isUnread ? "border-blue-600 shadow-sm" : "border-transparent"
            }`}>
            {/* Icon */}
            <div className="mt-1 flex-shrink-0">
                {renderIcon()}
            </div>

            {/* Nội dung */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-zinc-800 truncate">{title}</h4>
                    <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap mt-0.5">
                        {time}
                    </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                    {description}
                </p>
            </div>

            <button
                onClick={onDelete}
                className="text-zinc-400 hover:text-zinc-600 flex-shrink-0"
                aria-label="More options"
            >
                <MoreVertical size={14} />
            </button>
        </div>
    );
};