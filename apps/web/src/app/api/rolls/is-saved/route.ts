import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { BackendError } from "@/backend/common/backend.error";
import {
	isSavedQueryDto,
	photoIdParamDto,
	rollIdParamDto,
} from "@/backend/dtos/roll.dto";
import { rollService } from "@/backend/services/rolls/service";
import { authOptions } from "@/lib/auth";

/*
 * GET /api/rolls/is-saved?photoId=<photoId>
 */
export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		const actorId = session?.user?.id;
		const { searchParams } = new URL(req.url);
		const query = isSavedQueryDto.parse({
			photoId: searchParams.get("photoId") ?? undefined,
		});

		const result = await rollService.listContainingPhoto(
			query.photoId,
			actorId
		);
		return NextResponse.json(
			{
				success: true,
				message: "Fetched saved rolls successfully",
				data: result,
			},
			{ status: 200 }
		);
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
			{ success: false, message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { actorId, photoId, rollId } = await getRollPhotoMutationParams(req);
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

export async function DELETE(req: NextRequest) {
	try {
		const { actorId, photoId, rollId } = await getRollPhotoMutationParams(req);
		await rollService.removePhotoFromRoll(rollId, photoId, actorId);

		return NextResponse.json({
			success: true,
			message: "Photo removed from roll",
		});
	} catch (error) {
		return mapRouteError(error, "Failed to remove photo from roll");
	}
}

async function getRollPhotoMutationParams(req: NextRequest) {
	const session = await getServerSession(authOptions);
	const actorId = session?.user?.id;
	const body = await req.json();
	const { rollId } = rollIdParamDto.parse(body);
	const { photoId } = photoIdParamDto.parse(body);

	return {
		actorId,
		photoId,
		rollId,
	};
}

function mapRouteError(error: unknown, fallbackMessage: string) {
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
		},
		{ status: 500 }
	);
}
