import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { notificationIdParamDto } from "@/backend/dtos/notification.dto";
import { notificationService } from "@/backend/services/notifications/service";

export async function PUT(
	_req: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const params = notificationIdParamDto.parse(await context.params);
		await notificationService.markAsRead(params.id);
		return NextResponse.json(
			{
				success: true,
				message: "Notification marked as read successfully",
			},
			{ status: 200 }
		);
	} catch (error) {
		return mapRouteError(error, "Failed to mark notification as read");
	}
}

export async function DELETE(
	_req: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const params = notificationIdParamDto.parse(await context.params);
		await notificationService.clearByUserId(params.id);
		return NextResponse.json(
			{
				success: true,
				message: "Notifications cleared successfully",
			},
			{ status: 200 }
		);
	} catch (error) {
		return mapRouteError(error, "Failed to clear notifications");
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

	return NextResponse.json(
		{
			success: false,
			message: fallbackMessage,
			error: error instanceof Error ? error.message : "Unknown error",
		},
		{ status: 500 }
	);
}
