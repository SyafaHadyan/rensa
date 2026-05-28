import jwt from "jsonwebtoken";
import EmailVerificationTemplate from "@/frontend/components/emailTemplates/EmailVerificationTemplate";
import { PasswordResetEmail } from "@/frontend/components/emailTemplates/PasswordResetEmail";
import getResend from "@/lib/resend";

interface EmailSendResult {
	id?: string;
	verificationUrl?: string;
}

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

const assertEmailSent = (result: {
	data?: { id?: string } | null;
	error?: { message?: string; name?: string } | null;
}) => {
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

	const resend = await getResend();
	const result = await resend.emails.send({
		from: getEmailFrom(),
		to: email,
		subject: "Verify your email address",
		react: EmailVerificationTemplate({ verificationLink: verificationUrl }),
	});

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
	const appUrl = getAppUrl();
	const resetLink = `${appUrl}/reset-password?token=${token}`;

	const resend = await getResend();
	const result = await resend.emails.send({
		from: getEmailFrom(),
		to: email,
		subject: "Password Reset Request",
		react: PasswordResetEmail({ resetLink }),
	});
	assertEmailSent(result);
};
