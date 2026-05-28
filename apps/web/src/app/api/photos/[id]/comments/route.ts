import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { BackendError } from "@/backend/common/backend.error";
import {
	commentPhotoParamsDto,
	createCommentDto,
	listCommentsQueryDto,
} from "@/backend/dtos/comment.dto";
import { commentService } from "@/backend/services/comments/service";
import { authOptions } from "@/lib/auth";

/*
	POST /api/photos/:id/comments
	Make a comment on a photo
*/
export async function POST(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const params = commentPhotoParamsDto.parse(await context.params);
		const body = createCommentDto.parse(await request.json());
		const session = await getServerSession(authOptions);
		const actorId = session?.user?.id;
		const newComment = await commentService.createForPhoto(
			params.id,
			body,
			actorId
		);

		return NextResponse.json(
			{
				success: true,
				message: `Commented on photo ${params.id}`,
				data: newComment,
			},
			{ status: 201 }
		);
	} catch (error) {
		return mapRouteError(error, "Failed to create comment");
	}
}

/*
	GET /api/photos/:id/comments?offset=0
	Get comments for a photo with pagination
*/
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const params = commentPhotoParamsDto.parse(await context.params);
		const { searchParams } = new URL(request.url);
		const query = listCommentsQueryDto.parse({
			offset: searchParams.get("offset") ?? undefined,
			limit: searchParams.get("limit") ?? undefined,
		});
		const result = await commentService.listByPhotoId(
			params.id,
			query.offset,
			query.limit
		);

		return NextResponse.json(
			{
				success: true,
				message: `Fetched ${result.comments.length} comments from photo ${params.id}`,
				data: result,
			},
			{ status: 200 }
		);
	} catch (error) {
		return mapRouteError(error, "Failed to fetch comments");
	}
}

function mapRouteError(error: unknown, fallbackMessage: string): NextResponse {
	if (error instanceof ZodError) {
		return NextResponse.json(
			{
				success: false,
				message: "Validation failed",
				errors: error.flatten(),
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
