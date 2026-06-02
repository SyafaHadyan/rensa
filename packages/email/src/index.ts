import jwt from "jsonwebtoken";
import { Resend } from "resend";
import {
	BugReportConfirmationEmail,
	BugReportTeamEmail,
	ContactAdminEmail,
	ContactConfirmationEmail,
	EmailVerificationTemplate,
	PasswordResetEmail,
} from "./templates";

interface EmailSendResult {
	id?: string;
	verificationUrl?: string;
}

export interface ResendResult {
	data?: { id?: string } | null;
	error?: { message?: string; name?: string } | null;
}

const EMAIL_SEND_TIMEOUT_MS = 10_000;

let resendClient: Resend | undefined;

export const getResend = () => {
	if (resendClient) {
		return resendClient;
	}

	if (!process.env.RESEND_API_KEY) {
		throw new Error("RESEND_API_KEY is not configured.");
	}

	resendClient = new Resend(process.env.RESEND_API_KEY);
	return resendClient;
};

export const setResendForTests = (client: Resend | undefined) => {
	resendClient = client;
};

const withTimeout = async <T>(
	promise: Promise<T>,
	timeoutMs: number,
	message: string
): Promise<T> => {
	let timeout: ReturnType<typeof setTimeout> | undefined;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		if (timeout) {
			clearTimeout(timeout);
		}
	}
};

const getAppUrl = (): string => {
	const configuredUrl =
		process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
	const vercelUrl =
		process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
	const appUrl = configuredUrl || (vercelUrl ? `https://${vercelUrl}` : "");

	if (!appUrl) {
		throw new Error("App URL is not configured.");
	}

	return appUrl.replace(/\/$/, "").replace(/^http:\/\//, "https://");
};

const getEmailFrom = (): string => {
	const from = process.env.EMAIL_FROM || process.env.NO_REPLY_EMAIL;
	if (!from) {
		throw new Error("Email sender is not configured.");
	}
	return from;
};

const assertEmailSent = (result: ResendResult) => {
	if (result.error) {
		throw new Error(
			result.error.message ||
				result.error.name ||
				"Email provider rejected the request."
		);
	}

	return result.data?.id;
};

export const sendVerificationEmail = async (
	email: string
): Promise<EmailSendResult> => {
	if (!email) {
		throw new Error("Email is required");
	}

	if (!process.env.NEXTAUTH_SECRET) {
		throw new Error("Email verification is not configured.");
	}

	const appUrl = getAppUrl();
	const token = jwt.sign({ email }, process.env.NEXTAUTH_SECRET, {
		expiresIn: "1h",
	});
	const verificationUrl = `${appUrl}/verified?token=${token}`;

	const result = await withTimeout(
		getResend().emails.send({
			from: getEmailFrom(),
			to: email,
			subject: "Verify your email address",
			react: EmailVerificationTemplate({ verificationLink: verificationUrl }),
		}) as Promise<ResendResult>,
		EMAIL_SEND_TIMEOUT_MS,
		"Email provider timed out while sending verification email."
	);

	return {
		id: assertEmailSent(result),
		verificationUrl:
			process.env.NODE_ENV === "development" ? verificationUrl : undefined,
	};
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
	if (!email || typeof email !== "string") {
		throw new Error("Valid email is required");
	}

	if (!process.env.NEXTAUTH_SECRET) {
		throw new Error("Password reset is not configured.");
	}

	const token = jwt.sign({ email }, process.env.NEXTAUTH_SECRET, {
		expiresIn: "1h",
	});
	const resetLink = `${getAppUrl()}/reset-password?token=${token}`;

	const result = await withTimeout(
		getResend().emails.send({
			from: getEmailFrom(),
			to: email,
			subject: "Password Reset Request",
			react: PasswordResetEmail({ resetLink }),
		}) as Promise<ResendResult>,
		EMAIL_SEND_TIMEOUT_MS,
		"Email provider timed out while sending password reset email."
	);
	assertEmailSent(result);
};

export const sendContactAdminEmail = async (payload: {
	email: string;
	message: string;
	name: string;
	subject: string;
}) => {
	const result = await withTimeout(
		getResend().emails.send({
			from: process.env.CONTACT_NOTIFICATION_EMAIL || getEmailFrom(),
			to: process.env.ADMIN_EMAIL || "",
			subject: payload.subject,
			react: ContactAdminEmail({
				message: payload.message,
				senderEmail: payload.email,
				senderName: payload.name,
				subject: payload.subject,
			}),
		}) as Promise<ResendResult>,
		EMAIL_SEND_TIMEOUT_MS,
		"Contact admin email timed out"
	);
	assertEmailSent(result);
};

export const sendContactConfirmationEmail = async (payload: {
	email: string;
	name: string;
	subject: string;
}) => {
	const result = await withTimeout(
		getResend().emails.send({
			from: getEmailFrom(),
			to: payload.email,
			subject: `New Contact Form Submission: ${payload.subject}`,
			react: ContactConfirmationEmail({
				name: payload.name,
				subject: payload.subject,
			}),
		}) as Promise<ResendResult>,
		EMAIL_SEND_TIMEOUT_MS,
		"Contact confirmation email timed out"
	);
	assertEmailSent(result);
};

export const sendBugReportTeamEmail = async (payload: {
	actualBehavior?: string | null;
	description: string;
	email: string;
	expectedBehavior?: string | null;
	reportId: string;
	severity: string;
	stepsToReproduce?: string | null;
	submittedAt: string;
	title: string;
}) => {
	const result = await withTimeout(
		getResend().emails.send({
			from: process.env.BUG_REPORTS_EMAIL || getEmailFrom(),
			to: process.env.DEV_TEAM_EMAIL || process.env.ADMIN_EMAIL || "",
			subject: `New Bug Report: ${payload.title}`,
			react: BugReportTeamEmail(payload),
		}) as Promise<ResendResult>,
		EMAIL_SEND_TIMEOUT_MS,
		"Bug report team email timed out"
	);
	assertEmailSent(result);
};

export const sendBugReportConfirmationEmail = async (payload: {
	email: string;
	reportId: string;
	title: string;
}) => {
	const result = await withTimeout(
		getResend().emails.send({
			from: getEmailFrom(),
			to: payload.email,
			subject: `Bug Report Received: ${payload.title}`,
			react: BugReportConfirmationEmail(payload),
		}) as Promise<ResendResult>,
		EMAIL_SEND_TIMEOUT_MS,
		"Bug report confirmation email timed out"
	);
	assertEmailSent(result);
};
