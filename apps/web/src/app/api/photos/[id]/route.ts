import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import {
	BackendError,
	UnauthorizedError,
} from "@/backend/common/backend.error";
import { photoIdParamDto } from "@/backend/dtos/photo.dto";
import { photoService } from "@/backend/services/photos/service";
import { authOptions } from "@/lib/auth";

/*
  GET /api/photos/[id]
*/
export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const params = photoIdParamDto.parse(await context.params);
		const photo = await photoService.getById(params.id);
		return NextResponse.json({
			success: true,
			message: "Successfully fetched photo.",
			data: photo,
		});
	} catch (error) {
		return mapRouteError(error, "Failed to fetch photo");
	}
}

/*
  DELETE /api/photos/[id]
*/
export async function DELETE(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const params = photoIdParamDto.parse(await context.params);
		const session = await getServerSession(authOptions);
		const actorId = session?.user?.id;
		if (!actorId) {
			throw new UnauthorizedError();
		}

		await photoService.deleteById(params.id, actorId);

		return NextResponse.json({
			success: true,
			message: "Photo deleted successfully.",
		});
	} catch (error) {
		return mapRouteError(error, "Failed to delete photo");
	}
}

function mapRouteError(error: unknown, fallbackMessage: string): NextResponse {
	if (error instanceof ZodError) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid photo ID format",
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
