import { loginLimiter } from "@rensa/rate-limit";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { userService } from "@/backend/services/users/service";

/*
  POST /api/auth/login
  User login endpoint
*/
const usersApplication = userService;
export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();

		if (!(email && password)) {
			return NextResponse.json(
				{ success: false, message: "Email and password are required" },
				{ status: 400 }
			);
		}

		// rate limit
		const ip =
			req.headers.get("x-forwarded-for") ||
			req.headers.get("x-real-ip") ||
			"unknown";

		const { success, remaining, limit, reset } = await loginLimiter.limit(ip);
		if (!success) {
			return NextResponse.json(
				{ success: false, message: "Too many login attempts" },
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

		// find user
		const user = await usersApplication.getByEmail(email);
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "Invalid credentials" },
				{ status: 401 }
			);
		}
		// if (!user.verified) {
		// 	let emailSent = false;
		// 	try {
		// 		await sendVerificationEmail(user.email);
		// 		emailSent = true;
		// 	} catch (err) {
		// 		console.error("Error resending verification email:", err);
		// 	}
		// 	return NextResponse.json(
		// 		{
		// 			success: false,
		// 			message: emailSent
		// 				? "Email not verified. A new verification email has been sent."
		// 				: "Email not verified. Please check your inbox or try registering again.",
		// 		},
		// 		{ status: 401 }
		// 	);
		// }
		// validate password
		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			return NextResponse.json(
				{ success: false, message: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// return success without setting token
		return NextResponse.json({
			success: true,
			message: "Login successful",
			user: {
				id: user.userId,
				name: user.username,
				email: user.email,
			},
		});
	} catch (err) {
		console.error("Login error:", err);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
