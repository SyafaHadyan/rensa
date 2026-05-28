import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
	createNotificationDto,
	listNotificationsQueryDto,
} from "@/backend/dtos/notification.dto";
import { notificationService } from "@/backend/services/notifications/service";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const query = listNotificationsQueryDto.parse({
			recipientId: searchParams.get("recipientId") ?? undefined,
			page: searchParams.get("page") ?? undefined,
			limit: searchParams.get("limit") ?? undefined,
		});
		const notifications = await notificationService.list(query);

		return NextResponse.json(
			{
				success: true,
				notifications,
				message: "Notifications fetched successfully",
			},
			{ status: 200 }
		);
	} catch (error) {
		return mapRouteError(error, "Failed to fetch notifications");
	}
}

export async function POST(req: Request) {
	try {
		const payload = createNotificationDto.parse(await req.json());
		const response = await notificationService.create(payload);

		return NextResponse.json(
			{
				success: true,
				data: response,
				message: "Notification created successfully",
			},
			{ status: 201 }
		);
	} catch (error) {
		return mapRouteError(error, "Failed to create notification");
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
