import type { CreatePhotoNotificationPayload } from "@rensa/queue";
import jwt from "jsonwebtoken";
import { env } from "../env";

export const dispatchNotificationJob = async (
	payload: CreatePhotoNotificationPayload
) => {
	if (!env.nextAuthSecret) {
		throw new Error("NEXTAUTH_SECRET is required for notification jobs.");
	}

	const token = jwt.sign(
		{ id: payload.actorId, service: "workers" },
		env.nextAuthSecret,
		{
			expiresIn: "2m",
		}
	);
	const response = await fetch(`${env.notificationsBaseUrl}/notifications`, {
		body: JSON.stringify(payload),
		headers: {
			authorization: `Bearer ${token}`,
			"content-type": "application/json",
		},
		method: "POST",
	});

	if (!response.ok) {
		throw new Error(`Notification API failed with ${response.status}`);
	}
};
