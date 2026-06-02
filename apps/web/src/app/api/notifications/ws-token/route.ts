import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
	const session = await getServerSession(authOptions);
	const userId = session?.user?.id;

	if (!userId) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 }
		);
	}

	const secret = process.env.NEXTAUTH_SECRET;
	if (!secret) {
		return NextResponse.json(
			{ success: false, message: "NEXTAUTH_SECRET is not configured" },
			{ status: 500 }
		);
	}

	const token = jwt.sign({ id: userId }, secret, { expiresIn: "5m" });

	return NextResponse.json({
		success: true,
		token,
	});
}
