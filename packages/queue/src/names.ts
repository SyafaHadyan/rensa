export const QUEUE_NAMES = {
	notifications: "notifications",
	emails: "emails",
	photos: "photos",
} as const;

export const EMAIL_JOB_NAMES = {
	sendVerification: "send-verification",
	sendPasswordReset: "send-password-reset",
	sendContactAdmin: "send-contact-admin",
	sendContactConfirmation: "send-contact-confirmation",
	sendBugReportTeam: "send-bug-report-team",
	sendBugReportConfirmation: "send-bug-report-confirmation",
} as const;

export const NOTIFICATION_JOB_NAMES = {
	createPhotoNotification: "create-photo-notification",
} as const;

export const PHOTO_JOB_NAMES = {
	processUpload: "process-upload",
} as const;

export type EmailJobName =
	(typeof EMAIL_JOB_NAMES)[keyof typeof EMAIL_JOB_NAMES];
export type NotificationJobName =
	(typeof NOTIFICATION_JOB_NAMES)[keyof typeof NOTIFICATION_JOB_NAMES];
export type PhotoJobName =
	(typeof PHOTO_JOB_NAMES)[keyof typeof PHOTO_JOB_NAMES];
