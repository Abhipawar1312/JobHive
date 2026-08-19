import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { MESSAGE_API_END_POINT } from "@/utils/constant";
import { useSocket } from "@/context/SocketContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    X,
    Send,
    MessageSquare,
    Loader2,
    Paperclip,
} from "lucide-react";

const ChatModal = ({ targetUser, job, jobId, onClose }) => {
    const { user } = useSelector((store) => store.auth);
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessageText, setNewMessageText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isTargetTyping, setIsTargetTyping] = useState(false);
    const [attachmentOpen, setAttachmentOpen] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const isCandidate = user?.role !== "recruiter";
    const companyName = job?.company?.name || targetUser?.company?.name;
    const jobTitle = job?.title;

    const displayName = isCandidate
        ? (companyName || targetUser?.fullname || "Company")
        : (targetUser?.fullname || "Candidate");

    const displaySubtitle = isCandidate
        ? (jobTitle ? `${jobTitle} • Recruiter` : (targetUser?.role || "Recruiter"))
        : (jobTitle ? `Applicant • ${jobTitle}` : "Applicant");

    const displayAvatar = isCandidate
        ? (job?.company?.logo || targetUser?.profile?.profilePhoto)
        : targetUser?.profile?.profilePhoto;

    const activeJobId = jobId || job?._id || null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const url = `${MESSAGE_API_END_POINT}/conversation/${targetUser._id}`;
                const res = await axios.get(url, { withCredentials: true });
                if (res.data.success) {
                    setMessages(res.data.messages || []);
                }
            } catch (error) {
                console.error("Fetch messages error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (targetUser?._id) {
            fetchMessages();
        }
    }, [targetUser?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTargetTyping]);

    // Socket Event Handlers
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (incomingMsg) => {
            const senderId = incomingMsg.sender?._id?.toString() || incomingMsg.sender?.toString();
            const targetId = targetUser?._id?.toString();

            if (senderId === targetId) {
                setMessages((prev) => {
                    const alreadyExists = prev.some((m) => m._id === incomingMsg._id);
                    if (alreadyExists) return prev;
                    return [...prev, incomingMsg];
                });
                setIsTargetTyping(false);
            }
        };

        const handleMessageSent = (sentMsg) => {
            setMessages((prev) => {
                const alreadyExists = prev.some((m) => m._id === sentMsg._id);
                if (alreadyExists) return prev;
                // Replace temp message or append
                const filtered = prev.filter((m) => !m._id?.toString().startsWith("temp-"));
                return [...filtered, sentMsg];
            });
        };

        const handleUserTyping = ({ senderId }) => {
            if (senderId === targetUser._id) {
                setIsTargetTyping(true);
            }
        };

        const handleUserStoppedTyping = ({ senderId }) => {
            if (senderId === targetUser._id) {
                setIsTargetTyping(false);
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("messageSent", handleMessageSent);
        socket.on("userTyping", handleUserTyping);
        socket.on("userStoppedTyping", handleUserStoppedTyping);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("messageSent", handleMessageSent);
            socket.off("userTyping", handleUserTyping);
            socket.off("userStoppedTyping", handleUserStoppedTyping);
        };
    }, [socket, targetUser?._id, user?._id]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setNewMessageText(val);

        if (!socket) return;

        socket.emit("typing", { receiverId: targetUser._id, jobId: activeJobId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { receiverId: targetUser._id, jobId: activeJobId });
        }, 1500);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = newMessageText.trim();
        if (!text && !attachmentUrl.trim()) return;

        let finalMessage = text;
        if (attachmentUrl.trim()) {
            finalMessage = text ? `${text}\n📎 Attachment: ${attachmentUrl.trim()}` : `📎 Attachment: ${attachmentUrl.trim()}`;
        }

        setNewMessageText("");
        setAttachmentUrl("");
        setAttachmentOpen(false);

        if (socket) {
            socket.emit("stopTyping", { receiverId: targetUser._id, jobId: activeJobId });
        }

        // Optimistic UI update
        const tempMsg = {
            _id: `temp-${Date.now()}`,
            sender: {
                _id: user?._id,
                fullname: user?.fullname,
                profilePhoto: user?.profile?.profilePhoto,
                role: user?.role
            },
            receiver: targetUser?._id,
            message: finalMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);

        if (socket && socket.connected) {
            socket.emit("sendMessage", {
                receiverId: targetUser._id,
                message: finalMessage,
                jobId: activeJobId,
            });
        } else {
            try {
                const res = await axios.post(
                    `${MESSAGE_API_END_POINT}/send`,
                    {
                        receiverId: targetUser._id,
                        message: finalMessage,
                        jobId: activeJobId,
                    },
                    { withCredentials: true }
                );
                if (res.data.success) {
                    setMessages((prev) => {
                        const filtered = prev.filter((m) => !m._id?.toString().startsWith("temp-"));
                        return [...filtered, res.data.message];
                    });
                }
            } catch (err) {
                console.error("HTTP send message error:", err);
            }
        }
    };

    return (
        <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[400px] h-[540px] max-h-[88vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl z-[9999] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-[#6A38C2] text-white select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 border border-white/20 shrink-0">
                        <AvatarImage src={displayAvatar} />
                        <AvatarFallback className="bg-purple-800 text-white text-xs font-bold">
                            {displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold truncate max-w-[200px]" title={displayName}>
                            {displayName}
                        </h4>
                        <span className="text-[10px] text-purple-200 block truncate max-w-[200px]" title={displaySubtitle}>
                            {displaySubtitle}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 min-h-0 p-3.5 overflow-y-auto space-y-2.5 bg-gray-50/50 dark:bg-gray-950/50 text-xs">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-1">
                        <MessageSquare className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        <p className="text-[11px]">Start a conversation with {displayName}</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = (msg.sender?._id || msg.sender) === user?._id;

                        return (
                            <div
                                key={msg._id || index}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                                <div
                                    className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                                        isMe
                                            ? "bg-[#6A38C2] text-white rounded-br-none shadow-md shadow-purple-500/10"
                                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm"
                                    }`}
                                >
                                    {msg.message}
                                </div>
                                <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}

                {/* Animated Typing Indicator Bubble */}
                {isTargetTyping && (
                    <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-gray-800 text-gray-400 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 max-w-[80px] shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Document / Link Attachment Drawer */}
            {attachmentOpen && (
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border-t border-purple-100 dark:border-purple-900 flex items-center gap-2 text-xs">
                    <Paperclip className="w-4 h-4 text-purple-600 shrink-0" />
                    <Input
                        placeholder="Paste document / resume / portfolio link..."
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        className="h-8 text-xs rounded-xl bg-white dark:bg-gray-900"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAttachmentOpen(false)}
                        className="h-8 px-2 text-xs text-gray-500 hover:text-gray-900"
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="shrink-0 p-2.5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setAttachmentOpen(!attachmentOpen)}
                    title="Attach document or portfolio link"
                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                >
                    <Paperclip className="w-4 h-4" />
                </button>
                <Input
                    placeholder="Type your message..."
                    value={newMessageText}
                    onChange={handleInputChange}
                    className="text-xs rounded-xl h-9 focus-visible:ring-purple-500"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessageText.trim() && !attachmentUrl.trim()}
                    className="h-9 w-9 bg-[#6A38C2] hover:bg-[#5b30a6] text-white rounded-xl shrink-0 shadow-md shadow-purple-500/20"
                >
                    <Send className="w-3.5 h-3.5" />
                </Button>
            </form>
        </div>
    );
};

export default ChatModal;
