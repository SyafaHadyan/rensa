import {
	EMAIL_JOB_NAMES,
	NOTIFICATION_JOB_NAMES,
	PHOTO_JOB_NAMES,
} from "./names";

export interface SendVerificationEmailPayload {
	email: string;
}

export interface SendPasswordResetEmailPayload {
	email: string;
}

export interface ContactEmailPayload {
	contactId: string;
	email: string;
	message: string;
	name: string;
	subject: string;
}

export interface BugReportTeamEmailPayload {
	actualBehavior?: string | null;
	description: string;
	email: string;
	expectedBehavior?: string | null;
	reportId: string;
	severity: string;
	stepsToReproduce?: string | null;
	submittedAt: string;
	title: string;
}

export interface BugReportConfirmationEmailPayload {
	email: string;
	reportId: string;
	title: string;
}

export interface EmailJobPayloadByName {
	[EMAIL_JOB_NAMES.sendVerification]: SendVerificationEmailPayload;
	[EMAIL_JOB_NAMES.sendPasswordReset]: SendPasswordResetEmailPayload;
	[EMAIL_JOB_NAMES.sendContactAdmin]: ContactEmailPayload;
	[EMAIL_JOB_NAMES.sendContactConfirmation]: ContactEmailPayload;
	[EMAIL_JOB_NAMES.sendBugReportTeam]: BugReportTeamEmailPayload;
	[EMAIL_JOB_NAMES.sendBugReportConfirmation]: BugReportConfirmationEmailPayload;
}

export interface CreatePhotoNotificationPayload {
	actorId: string;
	photoId: string;
	recipientId: string;
	type: "photo-bookmarked" | "photo-commented" | "photo-saved";
}

export interface NotificationJobPayloadByName {
	[NOTIFICATION_JOB_NAMES.createPhotoNotification]: CreatePhotoNotificationPayload;
}

export interface ProcessUploadPayload {
	originalFilename: string;
	photoId: string;
	sourcePublicId: string;
	sourceUrl: string;
	userId: string;
}

export interface PhotoJobPayloadByName {
	[PHOTO_JOB_NAMES.processUpload]: ProcessUploadPayload;
}
