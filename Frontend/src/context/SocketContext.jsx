import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { BASE_URL } from "@/utils/constant";
import { toast } from "sonner";
import { updateAppliedJobStatus } from "@/components/redux/jobSlice";
import ChatModal from "@/components/shared/ChatModal";

const defaultSocketContext = {
    socket: null,
    onlineUsers: [],
    notifications: [],
    setNotifications: () => {},
    unreadNotifications: 0,
    setUnreadNotifications: () => {},
    activeChat: { isOpen: false, targetUser: null, job: null },
    openChat: () => {},
    closeChat: () => {},
};

const SocketContext = createContext(defaultSocketContext);

export const useSocket = () => {
    const context = useContext(SocketContext);
    return context || defaultSocketContext;
};

export const SocketProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [activeChat, setActiveChat] = useState({ isOpen: false, targetUser: null, job: null });
    const activeChatRef = useRef(activeChat);
    const { user } = useSelector((store) => store.auth);

    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    const openChat = (targetUser, job = null) => {
        setActiveChat({ isOpen: true, targetUser, job });
    };

    const closeChat = () => {
        setActiveChat({ isOpen: false, targetUser: null, job: null });
    };

    useEffect(() => {
        if (user?._id) {
            const newSocket = io(BASE_URL, {
                query: {
                    userId: user._id,
                },
                transports: ["websocket", "polling"],
                withCredentials: true,
            });

            setSocket(newSocket);

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            newSocket.on("newNotification", (notification) => {
                setNotifications((prev) => [notification, ...prev]);
                setUnreadNotifications((prev) => prev + 1);
                toast.info(notification.title || "New Notification", {
                    description: notification.message,
                });
            });

            // Real-time Application Status Update in Redux
            newSocket.on("applicationUpdated", (appData) => {
                if (appData?._id) {
                    dispatch(updateAppliedJobStatus({
                        applicationId: appData._id,
                        status: appData.status,
                        timeline: appData.timeline,
                        interviewDetails: appData.interviewDetails
                    }));
                }
            });

            // Real-time Incoming Message Alert
            newSocket.on("receiveMessage", (incomingMsg) => {
                const senderId = incomingMsg.sender?._id || incomingMsg.sender;
                const currentActive = activeChatRef.current;

                if (currentActive?.isOpen && currentActive?.targetUser?._id === senderId) {
                    return;
                }

                const senderName = incomingMsg.sender?.fullname || "Recruiter";
                toast.info(`💬 Message from ${senderName}`, {
                    description: incomingMsg.message,
                    action: {
                        label: "Reply",
                        onClick: () => setActiveChat({ isOpen: true, targetUser: incomingMsg.sender, job: incomingMsg.job })
                    }
                });
            });

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user?._id, dispatch]);

    return (
        <SocketContext.Provider
            value={{
                socket,
                onlineUsers,
                notifications,
                setNotifications,
                unreadNotifications,
                setUnreadNotifications,
                activeChat,
                openChat,
                closeChat,
            }}
        >
            {children}
            {activeChat?.isOpen && activeChat?.targetUser && (
                <ChatModal
                    targetUser={activeChat.targetUser}
                    job={activeChat.job}
                    jobId={activeChat.job?._id || (typeof activeChat.job === "string" ? activeChat.job : null)}
                    onClose={closeChat}
                />
            )}
        </SocketContext.Provider>
    );
};
