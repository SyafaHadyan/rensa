import { fastApi } from "@/lib/axios-server";
import { ValidationError } from "@/backend/common/backend.error";
import { PhotoModerationUnavailableError } from "./photo-upload.errors";

type ModerationResponse = Record<string, { Label?: string }>;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
	const arrayBuffer = new ArrayBuffer(buffer.length);
	new Uint8Array(arrayBuffer).set(buffer);
	return arrayBuffer;
}

export class PhotoModerationService {
	async assertAllowedImage(params: {
		buffer: Buffer;
		filename: string;
	}): Promise<void> {
		const formPhoto = new FormData();
		formPhoto.append(
			"file",
			new Blob([toArrayBuffer(params.buffer)], { type: "image/jpeg" }),
			params.filename
		);

		let moderationResult: ModerationResponse;
		try {
			const res = await fastApi.post("/nsfw/predict", formPhoto, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			moderationResult = res.data as ModerationResponse;
		} catch (error) {
			console.error("NSFW moderation failed:", error);
			throw new PhotoModerationUnavailableError();
		}

		const key = Object.keys(moderationResult)[0];
		if (key && moderationResult[key]?.Label === "NSFW") {
			throw new ValidationError("NSFW content detected. Upload rejected.");
		}
	}
}

export const photoModerationService = new PhotoModerationService();
