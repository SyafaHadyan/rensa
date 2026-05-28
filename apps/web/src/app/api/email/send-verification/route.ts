import { verificationEmailLimiter } from "@rensa/rate-limit";
import { type NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/frontend/services/email.service";

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
		const result = await sendVerificationEmail(email);

		return NextResponse.json(
			{
				success: true,
				message: "Verification email sent",
				...(result.verificationUrl
					? { verificationUrl: result.verificationUrl }
					: {}),
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error("Error sending verification email:", err);
		return NextResponse.json(
			{
				success: false,
				message:
					err instanceof Error
						? err.message
						: "Failed to send verification email",
			},
			{ status: 500 }
		);
	}
}
