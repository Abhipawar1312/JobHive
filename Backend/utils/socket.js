import { Server } from "socket.io";
import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { sendOfflineMessageNotificationEmail } from "./emailService.js";

const userSocketMap = {}; // { userId: socketId }

let io;

export const initSocket = (server, frontendOrigins) => {
    io = new Server(server, {
        cors: {
            origin: frontendOrigins,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId && userId !== "undefined") {
            userSocketMap[userId] = socket.id;
            console.log(`⚡ Socket connected: User ${userId} (Socket ${socket.id})`);
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // Direct 1-on-1 Chat message sending
        socket.on("sendMessage", async ({ receiverId, message, jobId }) => {
            try {
                if (!userId || !receiverId || !message) return;

                const validJobId = (jobId && mongoose.Types.ObjectId.isValid(jobId)) ? jobId : null;

                const newMessage = await Message.create({
                    sender: userId,
                    receiver: receiverId,
                    job: validJobId,
                    message,
                });

                const populatedMessage = await Message.findById(newMessage._id)
                    .populate("sender", "fullname profilePhoto role")
                    .populate({
                        path: "job",
                        populate: { path: "company" }
                    });

                const receiverSocketId = userSocketMap[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
                } else {
                    // Receiver is offline -> Send instant email notification
                    try {
                        const receiverUser = await User.findById(receiverId);
                        const senderUser = await User.findById(userId);
                        if (receiverUser && receiverUser.email) {
                            let jobTitle = "";
                            if (jobId) {
                                const job = await Job.findById(jobId);
                                jobTitle = job?.title || "";
                            }
                            sendOfflineMessageNotificationEmail(
                                receiverUser.email,
                                receiverUser.fullname,
                                senderUser?.fullname || "Recruiter",
                                message,
                                jobTitle
                            ).catch(e => console.error("Offline chat email error:", e.message));
                        }
                    } catch (emailErr) {
                        console.error("Failed to check offline receiver for email:", emailErr.message);
                    }
                }

                // Create in-app Notification record & emit to bell
                try {
                    const senderUser = await User.findById(userId);
                    const chatNotif = await Notification.create({
                        recipient: receiverId,
                        sender: userId,
                        type: "message",
                        title: `💬 New Message from ${senderUser?.fullname || "User"}`,
                        message: message.length > 80 ? message.substring(0, 77) + "..." : message,
                        link: senderUser?.role === "recruiter" ? "/profile" : "/admin/jobs",
                        read: false,
                    });
                    const populatedNotif = await Notification.findById(chatNotif._id).populate("sender", "fullname profilePhoto role");
                    emitNotification(receiverId, populatedNotif);
                } catch (notifErr) {
                    console.error("Failed to create message notification:", notifErr);
                }

                socket.emit("messageSent", populatedMessage);
            } catch (error) {
                console.error("Socket sendMessage error:", error);
            }
        });

        // Real-time Typing Indicators
        socket.on("typing", ({ receiverId, jobId }) => {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { senderId: userId, jobId });
            }
        });

        socket.on("stopTyping", ({ receiverId, jobId }) => {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId, jobId });
            }
        });

        socket.on("disconnect", () => {
            if (userId) {
                delete userSocketMap[userId];
                console.log(`⚡ Socket disconnected: User ${userId}`);
            }
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    return io;
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

export const emitNotification = (recipientId, notificationData) => {
    if (!io) return;
    const socketId = userSocketMap[recipientId];
    if (socketId) {
        io.to(socketId).emit("newNotification", notificationData);
    }
};

export const emitApplicationUpdate = (recipientId, applicationData) => {
    if (!io) return;
    const socketId = userSocketMap[recipientId];
    if (socketId) {
        io.to(socketId).emit("applicationUpdated", applicationData);
    }
};

export const getIO = () => io;
