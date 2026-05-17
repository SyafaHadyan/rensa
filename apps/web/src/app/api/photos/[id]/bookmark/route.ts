import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import {
	BackendError,
	UnauthorizedError,
} from "@/backend/common/backend.error";
import { photoIdParamDto } from "@/backend/dtos/photo.dto";
import { bookmarkService } from "@/backend/services/bookmarks/service";
import { authOptions } from "@/lib/auth";

export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id: photoId } = photoIdParamDto.parse(await context.params);
		const userId = await getSessionUserId();
		const result = await bookmarkService.getStatus(userId, photoId);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		return mapBookmarkRouteError(error, "Failed to fetch bookmark status");
	}
}

export async function PUT(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id: photoId } = photoIdParamDto.parse(await context.params);
		const userId = await getSessionUserId();
		const result = await bookmarkService.add(userId, photoId);

		return NextResponse.json({
			success: true,
			data: result,
			message: "Bookmark added",
		});
	} catch (error) {
		return mapBookmarkRouteError(error, "Failed to add bookmark");
	}
}

export async function DELETE(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id: photoId } = photoIdParamDto.parse(await context.params);
		const userId = await getSessionUserId();
		const result = await bookmarkService.remove(userId, photoId);

		return NextResponse.json({
			success: true,
			data: result,
			message: "Bookmark removed",
		});
	} catch (error) {
		return mapBookmarkRouteError(error, "Failed to remove bookmark");
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

function mapBookmarkRouteError(error: unknown, fallbackMessage: string) {
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
			error: error instanceof Error ? error.message : "Unknown error",
		},
		{ status: 500 }
	);
}
