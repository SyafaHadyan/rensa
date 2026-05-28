import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BackendError } from "@/backend/common/backend.error";
import {
	listRollPhotosQueryDto,
	rollIdParamDto,
} from "@/backend/dtos/roll.dto";
import { rollService } from "@/backend/services/rolls/service";

/*
 * GET /api/rolls/[rollId]/photos?page=1&limit=10
 */
export async function GET(
	req: Request,
	context: { params: Promise<{ rollId: string }> }
) {
	try {
		const params = rollIdParamDto.parse(await context.params);
		const { searchParams } = new URL(req.url);
		const query = listRollPhotosQueryDto.parse({
			page: searchParams.get("page") ?? undefined,
			limit: searchParams.get("limit") ?? undefined,
		});

		const result = await rollService.listPhotos(params.rollId, query);
		return NextResponse.json(
			{
				success: true,
				message: "Fetched roll photos successfully",
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
