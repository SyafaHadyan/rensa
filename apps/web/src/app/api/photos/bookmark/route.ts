import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import {
	BackendError,
	UnauthorizedError,
} from "@/backend/common/backend.error";
import {
	photoBookmarkQueryDto,
	photoIdParamDto,
} from "@/backend/dtos/photo.dto";
import { bookmarkService } from "@/backend/services/bookmarks/service";
import { photoService } from "@/backend/services/photos/service";
import { authOptions } from "@/lib/auth";

/*
  GET /api/photos/bookmark?page=1&limit=10&userId=...
*/
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const photoId = searchParams.get("photoId");
		if (photoId) {
			const params = photoIdParamDto.parse({ id: photoId });
			const userId = await getSessionUserId();
			const result = await bookmarkService.getStatus(userId, params.id);

			return NextResponse.json({
				success: true,
				data: result,
			});
		}

		const query = photoBookmarkQueryDto.parse({
			userId: searchParams.get("userId") ?? undefined,
			page: searchParams.get("page") ?? undefined,
			limit: searchParams.get("limit") ?? undefined,
		});

		const result = await photoService.listBookmarkedByUser(
			query.userId,
			query.page,
			query.limit
		);

		return NextResponse.json(result);
	} catch (error) {
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

		return NextResponse.json(
			{
				error: "Failed to fetch photos",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function PUT(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const params = photoIdParamDto.parse({
			id: searchParams.get("photoId") ?? undefined,
		});
		const userId = await getSessionUserId();
		const result = await bookmarkService.add(userId, params.id);

		return NextResponse.json({
			success: true,
			data: result,
			message: "Bookmark added",
		});
	} catch (error) {
		return mapBookmarkError(error, "Failed to add bookmark");
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const params = photoIdParamDto.parse({
			id: searchParams.get("photoId") ?? undefined,
		});
		const userId = await getSessionUserId();
		const result = await bookmarkService.remove(userId, params.id);

		return NextResponse.json({
			success: true,
			data: result,
			message: "Bookmark removed",
		});
	} catch (error) {
		return mapBookmarkError(error, "Failed to remove bookmark");
	}
}

async function getSessionUserId(): Promise<string> {
	const session = await getServerSession(authOptions);
	const userId = session?.user?.id;
	if (!userId) {
		throw new UnauthorizedError();
	}
	return userId;
}

function mapBookmarkError(error: unknown, fallbackMessage: string) {
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

	return NextResponse.json(
		{
			success: false,
			message: fallbackMessage,
			details: error instanceof Error ? error.message : "Unknown error",
		},
		{ status: 500 }
	);
}
