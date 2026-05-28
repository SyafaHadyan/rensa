import { Elysia } from "elysia";
import { notificationController } from "./notifications/notification.controller";
import { websocketController } from "./websocket/websocket.controller";

export const apiController = new Elysia({ prefix: "/api" })
	.use(websocketController)
	.use(notificationController);
