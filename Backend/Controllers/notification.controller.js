import { Notification } from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate("sender", "fullname profilePhoto");

        const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

        return res.status(200).json({
            success: true,
            notifications: notifications || [],
            unreadCount,
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch notifications", success: false });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === "all") {
            await Notification.updateMany({ recipient: req.id, read: false }, { read: true });
        } else {
            await Notification.findByIdAndUpdate(id, { read: true });
        }
        return res.status(200).json({ message: "Marked as read", success: true });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update notification", success: false });
    }
};
