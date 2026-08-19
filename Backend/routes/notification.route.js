import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getUserNotifications, markAsRead } from "../Controllers/notification.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getUserNotifications);
router.route("/read/:id").put(isAuthenticated, markAsRead);

export default router;
