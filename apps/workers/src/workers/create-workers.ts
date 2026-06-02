import {
	getQueueConnection,
	QUEUE_NAMES,
	type RensaQueues,
} from "@rensa/queue";
import { Worker } from "bullmq";
import { dispatchEmailJob } from "../job-workers/email-worker";
import { dispatchNotificationJob } from "../job-workers/notification-worker";
import { processPhotoUpload } from "../job-workers/photo-worker";

export const createWorkers = (_queues: RensaQueues) => {
	const connection = getQueueConnection();

	return [
		new Worker(
			QUEUE_NAMES.emails,
			(job) => dispatchEmailJob(job.name as never, job.data as never),
			{ connection }
		),
		new Worker(
			QUEUE_NAMES.notifications,
			(job) => dispatchNotificationJob(job.data),
			{ connection }
		),
		new Worker(QUEUE_NAMES.photos, (job) => processPhotoUpload(job.data), {
			connection,
		}),
	];
};
