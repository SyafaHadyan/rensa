import { registerLimiter } from "@rensa/rate-limit";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { rollService } from "@/backend/services/rolls/service";
import { userService } from "@/backend/services/users/service";
import { sendVerificationEmail } from "@/frontend/services/email.service";

const usersApplication = userService;
const rollsApplication = rollService;

/*
  POST /api/auth/register
  User registration endpoint
*/
export async function POST(req: Request) {
	try {
		const ip =
			req.headers.get("x-forwarded-for") ||
			req.headers.get("x-real-ip") ||
			"unknown";

		const { success, remaining, limit, reset } =
			await registerLimiter.limit(ip);
		if (!success) {
			return NextResponse.json(
				{ message: "Too many registration attempts. Please try again later." },
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
		const { username, email, password, confirmPassword } = await req.json();
		if (password !== confirmPassword) {
			return NextResponse.json(
				{ message: "Invalid Password" },
				{ status: 400 }
			);
		}
		const userExists = await usersApplication.getByEmail(email);
		if (userExists) {
			return NextResponse.json(
				{ message: "Email already exists" },
				{ status: 409 }
			);
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await usersApplication.create({
			username,
			email,
			password: hashedPassword,
		});
		await rollsApplication.createForUser({
			userId: user.userId,
			name: "All Photos",
			description: "This is your default roll.",
		});

		try {
			await sendVerificationEmail(email);
		} catch (err) {
			console.error("Error sending verification email:", err);
		}

		return NextResponse.json(
			{ message: "User registered successfully" },
			{ status: 201 }
		);
	} catch (err) {
		console.log("error in registration route:", err);
		if (err instanceof ZodError) {
			console.log("Validation error:", err.message);
			return NextResponse.json(
				{ message: `Invalid input data: ${err.message}` },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ message: `Error registering user: ${err}` },
			{ status: 500 }
		);
	}
}
