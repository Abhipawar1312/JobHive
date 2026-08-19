import React, { useEffect } from "react";
import { Bell, CheckCheck, Briefcase, Calendar, MessageSquare, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { NOTIFICATION_API_END_POINT } from "@/utils/constant";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
    const { notifications, setNotifications, unreadNotifications, setUnreadNotifications, openChat } = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(NOTIFICATION_API_END_POINT, { withCredentials: true });
                if (res.data.success) {
                    setNotifications(res.data.notifications);
                    setUnreadNotifications(res.data.unreadCount);
                }
            } catch (error) {
                // Silently fail if not logged in
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await axios.put(`${NOTIFICATION_API_END_POINT}/read/all`, {}, { withCredentials: true });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadNotifications(0);
        } catch (error) {
            console.error("Mark read error:", error);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.read) {
            try {
                await axios.put(`${NOTIFICATION_API_END_POINT}/read/${notif._id}`, {}, { withCredentials: true });
                setNotifications((prev) =>
                    prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
                );
                setUnreadNotifications((prev) => Math.max(0, prev - 1));
            } catch (err) {}
        }
        if (notif.type === "message" && notif.sender && openChat) {
            openChat(notif.sender);
        } else if (notif.link) {
            navigate(notif.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "interview_scheduled":
                return <Calendar className="h-4 w-4 text-purple-500" />;
            case "status_change":
                return <Briefcase className="h-4 w-4 text-blue-500" />;
            case "message":
                return <MessageSquare className="h-4 w-4 text-green-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-purple-600">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                            {unreadNotifications > 9 ? "9+" : unreadNotifications}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-xl rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50/70 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadNotifications > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-medium px-2 py-0.5 rounded-full">
                                {unreadNotifications} new
                            </span>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 font-medium transition-colors"
                        >
                            <CheckCheck className="h-3.5 w-3.5" /> Mark read
                        </button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex items-start gap-3 p-3 text-sm cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                                    !notif.read ? "bg-purple-50/40 dark:bg-purple-950/20" : ""
                                }`}
                            >
                                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 mt-0.5 shrink-0">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                                            {notif.title}
                                        </p>
                                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                            {new Date(notif.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
