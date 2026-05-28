import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BackendError } from "@/backend/common/backend.error";
import { rollIdParamDto } from "@/backend/dtos/roll.dto";
import { rollService } from "@/backend/services/rolls/service";

export async function GET(
	_req: Request,
	context: { params: Promise<{ rollId: string }> }
) {
	try {
		const params = rollIdParamDto.parse(await context.params);
		const ownerId = await rollService.getOwnerId(params.rollId);
		return NextResponse.json({
			success: true,
			message: "Successfully fetched profile data from roll id",
			data: { userId: ownerId },
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					success: false,
					message: "Validation failed",
					details: error.flatten(),
					data: null,
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
					data: null,
				},
				{ status: error.statusCode }
			);
		}
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch roll owner",
				data: null,
			},
			{ status: 500 }
		);
	}
}
