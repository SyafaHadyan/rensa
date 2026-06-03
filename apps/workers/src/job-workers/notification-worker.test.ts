import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("jsonwebtoken", () => ({
	default: {
		sign: vi.fn(() => "signed-worker-token"),
	},
}));

const payload = {
	actorId: "actor-1",
	photoId: "photo-1",
	recipientId: "recipient-1",
	type: "photo-bookmarked",
} as const;

describe("dispatchNotificationJob", () => {
	beforeEach(() => {
		vi.resetModules();
		process.env.ELYSIA_BASE_URL = "http://notifications.test/api";
		process.env.NEXTAUTH_SECRET = "worker-secret";
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
		delete process.env.ELYSIA_BASE_URL;
		delete process.env.NEXTAUTH_SECRET;
	});

	it("posts notification jobs with a short-lived worker token", async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		vi.stubGlobal("fetch", fetchMock);
		const { dispatchNotificationJob } = await import("./notification-worker");

		await dispatchNotificationJob(payload);

		expect(jwt.sign).toHaveBeenCalledWith(
			{ id: "actor-1", service: "workers" },
			"worker-secret",
			{ expiresIn: "2m" }
		);
		expect(fetchMock).toHaveBeenCalledWith(
			"http://notifications.test/api/notifications",
			{
				body: JSON.stringify(payload),
				headers: {
					authorization: "Bearer signed-worker-token",
					"content-type": "application/json",
				},
				method: "POST",
			}
		);
	});

	it("requires NEXTAUTH_SECRET", async () => {
		delete process.env.NEXTAUTH_SECRET;
		const { dispatchNotificationJob } = await import("./notification-worker");

		await expect(dispatchNotificationJob(payload)).rejects.toThrow(
			"NEXTAUTH_SECRET is required for notification jobs."
		);
	});

	it("throws when the notification API rejects the job", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 503 })
		);
		const { dispatchNotificationJob } = await import("./notification-worker");

		await expect(dispatchNotificationJob(payload)).rejects.toThrow(
			"Notification API failed with 503"
		);
	});
});
