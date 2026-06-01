import { photoUploadLimiter } from "@rensa/rate-limit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { BackendError } from "@/backend/common/backend.error";
import { photoUploadService } from "@/backend/services/photos/photo-upload.service";
import { logUploadStage } from "@/backend/services/photos/photo-upload-logger";
import { authOptions } from "@/lib/auth";

/*
  POST /api/photos/upload
  Upload a photo
*/
export async function POST(req: Request) {
	const uploadId = crypto.randomUUID();
	const requestStartedAt = performance.now();
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized. Please login to upload photos." },
			{ status: 401 }
		);
	}

	const ip =
		req.headers.get("x-forwarded-for") ||
		req.headers.get("x-real-ip") ||
		"unknown";

	const { success, remaining, limit, reset } =
		await photoUploadLimiter.limit(ip);
	if (!success) {
		return NextResponse.json(
			{ success: false, message: "Too many photo upload attempts" },
			{
				status: 429,
				headers: {
					"X-RateLimit-Limit": limit.toString(),
					"X-RateLimit-Remaining": remaining.toString(),
					"X-RateLimit-Reset": reset.toString(),
				},
			}
		);
	}

	try {
		const parseStartedAt = performance.now();
		const formData = await req.formData();
		logUploadStage(uploadId, "parse_form_data", parseStartedAt);

		const uploadedPhoto = await photoUploadService.upload({
			formData,
			sessionUserId: session.user.id,
			uploadId,
		});
		logUploadStage(uploadId, "complete", requestStartedAt);

		return NextResponse.json({
			success: true,
			data: uploadedPhoto,
		});
	} catch (error) {
		if (error instanceof BackendError) {
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: error.statusCode }
			);
		}

		console.error("Upload error:", error);
		return NextResponse.json(
			{ success: false, error: "Upload failed" },
			{ status: 500 }
		);
	}
}
