import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { BackendError } from "@/backend/common/backend.error";
import {
	createContactDto,
	listContactsQueryDto,
} from "@/backend/dtos/contact.dto";
import { contactService } from "@/backend/services/contacts/service";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/contact
 * Submit a contact form inquiry
 */
export async function POST(req: Request) {
	try {
		const body = createContactDto.parse(await req.json());
		const forwardedIp = req.headers.get("x-forwarded-for");
		const fallbackIp = req.headers.get("x-real-ip");
		const ipAddress =
			forwardedIp?.split(",")[0]?.trim() || fallbackIp || "unknown";
		const userAgent = req.headers.get("user-agent") || "";
		const result = await contactService.submit(body, {
			ipAddress: ipAddress,
			userAgent: userAgent,
		});

		return NextResponse.json(
			{
				success: true,
				message: "Your message has been received. We'll get back to you soon!",
				data: result,
			},
			{ status: 201 }
		);
	} catch (error) {
		return mapRouteError(
			error,
			"An error occurred while processing your request"
		);
	}
}

/**
 * GET /api/contact
 * Retrieve contact messages (admin only)
 */
export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		const { searchParams } = new URL(req.url);
		const query = listContactsQueryDto.parse({
			status: searchParams.get("status") ?? undefined,
			page: searchParams.get("page") ?? undefined,
			limit: searchParams.get("limit") ?? undefined,
		});
		const result = await contactService.list(query, session?.user?.role);

		return NextResponse.json({
			success: true,
			data: result.contacts,
			pagination: result.pagination,
		});
	} catch (error) {
		return mapRouteError(error, "Failed to retrieve contacts");
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
		},
		{ status: 500 }
	);
}
