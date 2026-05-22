import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { BackendError } from "@/backend/common/backend.error";
import { profileIdParamDto } from "@/backend/dtos/profile.dto";
import { profileService } from "@/backend/services/profile/service";
import { authOptions } from "@/lib/auth";

/*
  GET /api/profile/[id]
  Fetch user profile by ID along with their rolls and preview photos
*/
export async function GET(
	_req: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const rawParams = await context.params;
		const params = profileIdParamDto.parse({ userId: rawParams.id });
		const user = await profileService.getById(params.userId);

		return NextResponse.json(
			{
				success: true,
				message: "Successfully fetched user profile!",
				data: {
					user: {
						userId: user.userId,
						username: user.username,
						email: user.email,
						avatarUrl: user.avatarUrl ?? undefined,
					},
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		return mapRouteError(error, "Failed to fetch profile");
	}
}

export async function PATCH(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const rawParams = await context.params;
		const params = profileIdParamDto.parse({ userId: rawParams.id });
		const session = await getServerSession(authOptions);
		const { avatarFile, username } = await parseProfileUpdateRequest(req);
		const updatedUser = await profileService.updateProfile({
			actorId: session?.user?.id,
			avatarFile,
			userId: params.userId,
			username,
		});

		return NextResponse.json(
			{
				success: true,
				message: "Successfully updated user profile!",
				data: {
					user: {
						userId: updatedUser.userId,
						username: updatedUser.username,
						email: updatedUser.email,
						avatarUrl: updatedUser.avatarUrl ?? undefined,
					},
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		return mapRouteError(error, "Failed to update profile");
	}
}

export async function POST(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	return PATCH(req, context);
}

async function parseProfileUpdateRequest(req: Request): Promise<{
	avatarFile: File | null;
	username: string;
}> {
	const contentType = req.headers.get("content-type") ?? "";
	if (contentType.includes("multipart/form-data")) {
		const formData = await req.formData();
		const avatar = formData.get("avatar") ?? formData.get("avatarUrl");
		return {
			avatarFile: avatar instanceof File && avatar.size > 0 ? avatar : null,
			username: String(formData.get("username") ?? ""),
		};
	}

	const body = (await req.json()) as { username?: unknown };
	return {
		avatarFile: null,
		username: typeof body.username === "string" ? body.username : "",
	};
}

function mapRouteError(error: unknown, fallbackMessage: string): NextResponse {
	if (error instanceof ZodError) {
		return NextResponse.json(
			{
				success: false,
				message: "Validation failed",
				details: error.flatten(),
			},
			{ status: 400 }
		);
	}

	if (error instanceof BackendError) {
		return NextResponse.json(
			{
				success: false,
				message: error.message,
				code: error.code,
			},
			{ status: error.statusCode }
		);
	}

	console.error(fallbackMessage, error);
	return NextResponse.json(
		{ success: false, message: "Internal Server Error" },
		{ status: 500 }
	);
}
