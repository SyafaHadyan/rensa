import {
	type EmailJobName,
	NOTIFICATION_JOB_NAMES,
	PHOTO_JOB_NAMES,
} from "./names";
import {
	emailJobOptions,
	notificationJobOptions,
	photoJobOptions,
} from "./options";
import type {
	CreatePhotoNotificationPayload,
	EmailJobPayloadByName,
	ProcessUploadPayload,
} from "./payloads";
import { getRensaQueues } from "./queues";

export const enqueueEmailJob = async <Name extends EmailJobName>(
	name: Name,
	payload: EmailJobPayloadByName[Name]
) => getRensaQueues().emails.add(name, payload, emailJobOptions);

export const enqueueNotificationJob = async (
	payload: CreatePhotoNotificationPayload
) =>
	getRensaQueues().notifications.add(
		NOTIFICATION_JOB_NAMES.createPhotoNotification,
		payload,
		notificationJobOptions
	);

export const enqueuePhotoProcessingJob = async (
	payload: ProcessUploadPayload
) =>
	getRensaQueues().photos.add(
		PHOTO_JOB_NAMES.processUpload,
		payload,
		photoJobOptions
	);
