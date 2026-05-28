import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import {
	BackendError,
	UnauthorizedError,
} from "@/backend/common/backend.error";
import { photoIdParamDto, rollIdParamDto } from "@/backend/dtos/roll.dto";
import { rollService } from "@/backend/services/rolls/service";
import { authOptions } from "@/lib/auth";

/*
  POST /api/rolls/[rollId]/photos/[photoId]
*/
export async function POST(
	req: Request,
	context: { params: Promise<{ rollId: string; photoId: string }> }
) {
	try {
		const rawParams = await context.params;
		const { rollId } = rollIdParamDto.parse(rawParams);
		const { photoId } = photoIdParamDto.parse(rawParams);
		const session = await getServerSession(authOptions);
		const actorId = session?.user?.id;
		if (!actorId) {
			throw new UnauthorizedError();
		}

		const modifiedCount = await rollService.addPhotoToRoll(
			rollId,
			photoId,
			actorId
		);

		return NextResponse.json({
			success: true,
			message: "Photo added to selected roll",
			modifiedCount,
		});
	} catch (error) {
		return mapRouteError(error, "Failed to add photo to roll");
	}
}

/*
  DELETE /api/rolls/[rollId]/photos/[photoId]
*/
export async function DELETE(
	_req: NextRequest,
	context: { params: Promise<{ rollId: string; photoId: string }> }
) {
	try {
		const rawParams = await context.params;
		const { rollId } = rollIdParamDto.parse(rawParams);
		const { photoId } = photoIdParamDto.parse(rawParams);
		const session = await getServerSession(authOptions);
		const actorId = session?.user?.id;
		if (!actorId) {
			throw new UnauthorizedError();
		}

		await rollService.removePhotoFromRoll(rollId, photoId, actorId);

		return NextResponse.json({
			success: true,
			message: "Photo removed from roll",
		});
	} catch (error) {
		return mapRouteError(error, "Failed to remove photo from roll");
	}
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

	return NextResponse.json(
		{ success: false, message: fallbackMessage },
		{ status: 500 }
	);
}
