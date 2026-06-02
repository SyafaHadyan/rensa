import { Queue } from "bullmq";
import type IORedis from "ioredis";
import { closeQueueConnection, getQueueConnection } from "./connection";
import { QUEUE_NAMES } from "./names";

export interface RensaQueues {
	emails: Queue;
	notifications: Queue;
	photos: Queue;
}

let queues: RensaQueues | undefined;

export const createRensaQueues = (
	queueConnection: IORedis = getQueueConnection()
): RensaQueues => ({
	emails: new Queue(QUEUE_NAMES.emails, { connection: queueConnection }),
	notifications: new Queue(QUEUE_NAMES.notifications, {
		connection: queueConnection,
	}),
	photos: new Queue(QUEUE_NAMES.photos, { connection: queueConnection }),
});

export const getRensaQueues = () => {
	queues ??= createRensaQueues();
	return queues;
};

export const setRensaQueuesForTests = (testQueues: RensaQueues | undefined) => {
	if (process.env.NODE_ENV !== "test" && process.env.VITEST !== "true") {
		throw new Error("setRensaQueuesForTests can only be used in tests.");
	}

	queues = testQueues;
};

export const closeRensaQueues = async () => {
	if (!queues) {
		await closeQueueConnection();
		return;
	}

	await Promise.all([
		queues.emails.close(),
		queues.notifications.close(),
		queues.photos.close(),
	]);
	queues = undefined;
	await closeQueueConnection();
};
