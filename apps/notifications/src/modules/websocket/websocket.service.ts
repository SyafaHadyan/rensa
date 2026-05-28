import type {
	AuthenticatedWebSocket,
	WebSocketJwtPayload,
	WebSocketNotificationPayload,
} from "./websocket.model";

export const onlineUsers = new Map<string, AuthenticatedWebSocket>();

function hasUserId(
	payload: false | WebSocketJwtPayload
): payload is WebSocketJwtPayload & {
	id: string;
} {
	return typeof payload === "object" && typeof payload.id === "string";
}

class WebSocketAuthError extends Error {
	success = false;

	constructor(message: string) {
		super(message);
		this.name = "WebSocketAuthError";
	}
}

export const WebSocketService = {
	async open(ws: AuthenticatedWebSocket) {
		const token = ws.data.query.token;
		const payload = await ws.data.jwt.verify(token);

		if (!hasUserId(payload)) {
			throw new WebSocketAuthError("WebSocket authentication failed");
		}

		const userId = payload.id;
		ws.data.userId = userId;
		WebSocketService.registerUser(userId, ws);

		console.log(`User ${userId} connected`);
	},

	close(ws: AuthenticatedWebSocket) {
		const userId = ws.data.userId;
		if (!userId) {
			return;
		}

		WebSocketService.removeUser(userId);
		console.log(`User ${userId} disconnected`);
	},

	registerUser(userId: string, ws: AuthenticatedWebSocket) {
		onlineUsers.set(userId, ws);
	},

	removeUser(userId: string) {
		onlineUsers.delete(userId);
	},

	sendNotification(notification: WebSocketNotificationPayload) {
		const ws = onlineUsers.get(notification.recipientId);
		if (!ws) {
			return;
		}

		ws.send(
			JSON.stringify({
				actor: notification.actor,
				notificationId: notification.notificationId,
				photoId: notification.photoId,
				type: notification.type,
				read: notification.read,
				recipientId: notification.recipientId,
				createdAt: notification.createdAt,
				updatedAt: notification.updatedAt,
			})
		);
	},
};
