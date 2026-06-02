import { EMAIL_JOB_NAMES, enqueueEmailJob } from "@rensa/queue";
import { verificationEmailLimiter } from "@rensa/rate-limit";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { email } = await req.json();
	if (!email) {
		return NextResponse.json({ message: "Email is required" }, { status: 400 });
	}

	const rateLimitResult = await verificationEmailLimiter.limit(email);
	if (!rateLimitResult.success) {
		return NextResponse.json(
			{
				message: "Too many verification requests. Please try again later.",
			},
			{ status: 429 }
		);
	}

	try {
		await enqueueEmailJob(EMAIL_JOB_NAMES.sendVerification, { email });

		return NextResponse.json(
			{
				success: true,
				message: "Verification email sent",
				verificationEmailQueued: true,
				verificationEmailSent: true,
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error("Error queueing verification email:", err);
		return NextResponse.json(
			{
				success: false,
				message:
					err instanceof Error
						? err.message
						: "Failed to queue verification email",
			},
			{ status: 500 }
		);
	}
}
