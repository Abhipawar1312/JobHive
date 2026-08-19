import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Notification } from "../models/notification.model.js";
import { sendOfflineMessageNotificationEmail } from "../utils/emailService.js";
import { getReceiverSocketId, emitNotification } from "../utils/socket.js";

export const getConversation = async (req, res) => {
    try {
        const userId = req.id;
        const otherUserId = req.params.userId;

        const query = {
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId },
            ]
        };

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .populate("sender", "fullname profilePhoto role")
            .populate("receiver", "fullname profilePhoto role")
            .populate({
                path: "job",
                populate: { path: "company" }
            });

        // Mark unread messages from otherUser as read
        await Message.updateMany(
            { sender: otherUserId, receiver: userId, read: false },
            { read: true }
        );

        return res.status(200).json({
            success: true,
            messages: messages || []
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch messages", success: false });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const userId = req.id;
        const { receiverId, message, jobId } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({ message: "Receiver and message are required", success: false });
        }

        const validJobId = (jobId && mongoose.Types.ObjectId.isValid(jobId)) ? jobId : null;

        const newMessage = await Message.create({
            sender: userId,
            receiver: receiverId,
            job: validJobId,
            message
        });

        const populated = await Message.findById(newMessage._id)
            .populate("sender", "fullname profilePhoto role")
            .populate({
                path: "job",
                populate: { path: "company" }
            });

        const socketId = getReceiverSocketId(receiverId);
        if (!socketId) {
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
                console.error("HTTP offline email error:", emailErr.message);
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

        return res.status(201).json({
            success: true,
            message: populated
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to send message", success: false });
    }
};
