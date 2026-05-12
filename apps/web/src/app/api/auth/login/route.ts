import { loginLimiter } from "@rensa/rate-limit";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { rollController } from "@/backend/services/rolls/controller";
import { userController } from "@/backend/services/users/controller";

/*
  POST /api/auth/login
  User login endpoint
*/
const usersApplication = userController;
const rollsApplication = rollController;
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!(email && password)) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
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
        },
      );
    }

    // find user
    const user = await usersApplication.getByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
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
    // creates default "All Photos" roll
    const defaultRoll = await rollsApplication.create(
      {
        name: "All Photos",
        user_id: user.user_id,
      },
      user.user_id,
    );
    if (!defaultRoll) {
      return NextResponse.json(
        { success: false, message: "Error creating default roll" },
        { status: 500 },
      );
    }
    // validate password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // return success without setting token
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
