import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	sendBugReportConfirmationEmail,
	sendContactAdminEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
	setResendForTests,
} from ".";

const send = vi.fn().mockResolvedValue({ data: { id: "email_123" } });

describe("email senders", () => {
	beforeEach(() => {
		send.mockClear();
		setResendForTests({ emails: { send } } as never);
		process.env.NEXTAUTH_SECRET = "secret";
		process.env.NEXT_PUBLIC_APP_URL = "https://rensa.test";
		process.env.EMAIL_FROM = "Rensa <no-reply@rensa.test>";
		process.env.ADMIN_EMAIL = "admin@rensa.test";
	});

	it("sends verification email with generated URL", async () => {
		await sendVerificationEmail("user@example.com");

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "user@example.com",
				subject: "Verify your email address",
			})
		);
	});

	it("sends password reset email", async () => {
		await sendPasswordResetEmail("user@example.com");

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "user@example.com",
				subject: "Password Reset Request",
			})
		);
	});

	it("sends contact admin email", async () => {
		await sendContactAdminEmail({
			email: "user@example.com",
			message: "Hello",
			name: "User",
			subject: "Question",
		});

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				subject: "Question",
				to: "admin@rensa.test",
			})
		);
	});

	it("sends bug report confirmation email", async () => {
		await sendBugReportConfirmationEmail({
			email: "user@example.com",
			reportId: "bug_1",
			title: "Upload failed",
		});

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				subject: "Bug Report Received: Upload failed",
				to: "user@example.com",
			})
		);
	});
});
