import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const photoRepository = new PhotoRepository();

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ photoId: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	const { photoId } = await params;
	const status = await photoRepository.getUploadStatus(photoId);
	if (!status) {
		return NextResponse.json(
			{ success: false, error: "Photo not found" },
			{ status: 404 }
		);
	}

	if (status.userId !== session.user.id) {
		return NextResponse.json(
			{ success: false, error: "Forbidden" },
			{ status: 403 }
		);
	}

	return NextResponse.json({
		success: true,
		data: {
			metadata:
				status.processingStatus === "ready" ? status.metadata : undefined,
			photoId: status.photoId,
			processingError: status.processingError,
			processingStatus: status.processingStatus,
			url: status.url,
		},
	});
}
