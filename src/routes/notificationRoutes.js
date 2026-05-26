import express from "express";

import {
  getNotifications,
  markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/:user_id", getNotifications);

router.patch(
  "/read/:notification_id",
  markNotificationRead
);

export default router;