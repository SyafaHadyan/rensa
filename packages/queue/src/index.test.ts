import { Queue } from "bullmq";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createRensaQueues,
	EMAIL_JOB_NAMES,
	emailJobOptions,
	enqueueEmailJob,
	enqueueNotificationJob,
	enqueuePhotoProcessingJob,
	NOTIFICATION_JOB_NAMES,
	notificationJobOptions,
	PHOTO_JOB_NAMES,
	photoJobOptions,
	QUEUE_NAMES,
	setRensaQueuesForTests,
} from ".";

vi.mock("bullmq", () => ({
	Queue: vi.fn().mockImplementation(function MockQueue(
		this: unknown,
		name: string
	) {
		return {
			add: vi.fn().mockResolvedValue({ id: `${name}-job` }),
			close: vi.fn(),
			name,
		};
	}),
}));

describe("queue producers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setRensaQueuesForTests(undefined);
	});

	it("uses stable queue and job names", () => {
		expect(QUEUE_NAMES).toEqual({
			emails: "emails",
			notifications: "notifications",
			photos: "photos",
		});
		expect(EMAIL_JOB_NAMES.sendVerification).toBe("send-verification");
		expect(NOTIFICATION_JOB_NAMES.createPhotoNotification).toBe(
			"create-photo-notification"
		);
		expect(PHOTO_JOB_NAMES.processUpload).toBe("process-upload");
	});

	it("keeps retry defaults conservative", () => {
		expect(emailJobOptions).toMatchObject({
			attempts: 5,
			backoff: { type: "exponential", delay: 30_000 },
		});
		expect(notificationJobOptions).toMatchObject({ attempts: 3 });
		expect(photoJobOptions).toMatchObject({ attempts: 3 });
	});

	it("creates named BullMQ queues", () => {
		createRensaQueues({} as never);

		expect(Queue).toHaveBeenCalledWith("emails", expect.any(Object));
		expect(Queue).toHaveBeenCalledWith("notifications", expect.any(Object));
		expect(Queue).toHaveBeenCalledWith("photos", expect.any(Object));
	});

	it("enqueues email jobs with email defaults", async () => {
		const add = vi.fn().mockResolvedValue({ id: "job" });
		setRensaQueuesForTests({
			emails: { add } as never,
			notifications: { add: vi.fn() } as never,
			photos: { add: vi.fn() } as never,
		});

		await enqueueEmailJob(EMAIL_JOB_NAMES.sendVerification, {
			email: "user@example.com",
		});

		expect(add).toHaveBeenCalledWith(
			"send-verification",
			{ email: "user@example.com" },
			emailJobOptions
		);
	});

	it("enqueues notification and photo producers", async () => {
		const notificationsAdd = vi.fn().mockResolvedValue({ id: "notification" });
		const photosAdd = vi.fn().mockResolvedValue({ id: "photo" });
		setRensaQueuesForTests({
			emails: { add: vi.fn() } as never,
			notifications: { add: notificationsAdd } as never,
			photos: { add: photosAdd } as never,
		});

		await enqueueNotificationJob({
			actorId: "actor",
			photoId: "photo",
			recipientId: "recipient",
			type: "photo-bookmarked",
		});
		await enqueuePhotoProcessingJob({
			photoId: "photo",
			originalFilename: "photo.jpg",
			sourcePublicId: "staged/photo",
			sourceUrl: "https://example.com/photo.jpg",
			userId: "user",
		});

		expect(notificationsAdd).toHaveBeenCalledWith(
			"create-photo-notification",
			expect.objectContaining({ photoId: "photo" }),
			notificationJobOptions
		);
		expect(photosAdd).toHaveBeenCalledWith(
			"process-upload",
			expect.objectContaining({ sourcePublicId: "staged/photo" }),
			photoJobOptions
		);
	});
});
