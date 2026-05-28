import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
	const token = await getToken({ req });
	const pathname = req.nextUrl.pathname;

	const isProtectedPage = pathname.startsWith("/bookmarks");

	if (!token && isProtectedPage) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/bookmarks/:path*"],
};
