import { EMAIL_JOB_NAMES, enqueueEmailJob } from "@rensa/queue";
import { forgotPasswordLimiter } from "@rensa/rate-limit";
import { type NextRequest, NextResponse } from "next/server";
/*
  POST /api/auth/forgot-password
  Send password reset email endpoint
*/
export async function POST(req: NextRequest) {
	try {
		const ip =
			req.headers.get("x-forwarded-for") ||
			req.headers.get("x-real-ip") ||
			"unknown";

		const { success, remaining, limit, reset } =
			await forgotPasswordLimiter.limit(ip);
		if (!success) {
			return NextResponse.json(
				{
					success: false,
					message: "Too many password reset attempts. Please try again later.",
				},
				{
					status: 429,
					headers: {
						"X-RateLimit-Limit": limit.toString(),
						"X-RateLimit-Remaining": remaining.toString(),
						"X-RateLimit-Reset": reset.toString(),
					},
				}
			);
		}
		const { email } = await req.json();

		try {
			if (email) {
				await enqueueEmailJob(EMAIL_JOB_NAMES.sendPasswordReset, { email });
			}
		} catch (err) {
			console.error("Error queueing password reset email:", err);
		}
		return NextResponse.json(
			{
				success: true,
				message:
					"If an account with that email exists, a password reset email has been sent.",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Forgot password error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
