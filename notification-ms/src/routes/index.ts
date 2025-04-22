import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controller/notification.controller";
import {
  getNotificationsValidator,
  markAsReadValidator,
} from "../validator/notification.validator";

const routes = Router();

routes.get("/list", getNotificationsValidator, getNotifications);
routes.put("/:notificationId/read", markAsReadValidator, markAsRead);
routes.put("/read-all", markAllAsRead);

export default routes;
