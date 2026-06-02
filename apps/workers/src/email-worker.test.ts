import { EMAIL_JOB_NAMES } from "@rensa/queue";
import { describe, expect, it, vi } from "vitest";
import { dispatchEmailJob } from "./email-worker";

vi.mock("@rensa/email", () => ({
	sendBugReportConfirmationEmail: vi.fn(),
	sendBugReportTeamEmail: vi.fn(),
	sendContactAdminEmail: vi.fn(),
	sendContactConfirmationEmail: vi.fn(),
	sendPasswordResetEmail: vi.fn(),
	sendVerificationEmail: vi.fn(),
}));

describe("dispatchEmailJob", () => {
	it("dispatches verification jobs", async () => {
		const email = await import("@rensa/email");

		await dispatchEmailJob(EMAIL_JOB_NAMES.sendVerification, {
			email: "user@example.com",
		});

		expect(email.sendVerificationEmail).toHaveBeenCalledWith(
			"user@example.com"
		);
	});
});
