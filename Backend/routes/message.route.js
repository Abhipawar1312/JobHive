import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getConversation, sendMessage } from "../Controllers/message.controller.js";

const router = express.Router();

router.route("/conversation/:userId").get(isAuthenticated, getConversation);
router.route("/send").post(isAuthenticated, sendMessage);

export default router;
