import { Readable } from "node:stream";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { ValidationError } from "@/backend/common/backend.error";
import cloudinary, { validateCloudinaryUrl } from "@/lib/cloudinary";
import { withTimeout } from "@/lib/timeout";
import { PhotoUploadStorageError } from "./photo-upload.errors";

const CLOUDINARY_UPLOAD_TIMEOUT_MS = 45_000;
const CLOUDINARY_DESTROY_TIMEOUT_MS = 10_000;

export class PhotoStorageService {
	async uploadPhoto(params: {
		buffer: Buffer;
		userId: string;
	}): Promise<UploadApiResponse> {
		let uploadRes: UploadApiResponse;
		try {
			uploadRes = await this.uploadBuffer(params.buffer, {
				fetch_format: "auto",
				folder: `user_uploads/${params.userId}`,
				image_metadata: true,
				quality: "auto",
				resource_type: "image",
				timeout: CLOUDINARY_UPLOAD_TIMEOUT_MS,
				transformation: [{ width: 2000, crop: "limit" }],
			});
		} catch (error) {
			console.error("Cloudinary upload failed:", error);
			throw new PhotoUploadStorageError();
		}

		if (!validateCloudinaryUrl(uploadRes.secure_url)) {
			await this.destroyInvalidUpload(uploadRes.public_id);
			throw new ValidationError(
				"Invalid or suspicious image URL detected. Upload rejected for security reasons."
			);
		}

		return uploadRes;
	}

	private uploadBuffer(
		buffer: Buffer,
		options: UploadApiOptions
	): Promise<UploadApiResponse> {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				options,
				(error, result) => {
					if (error) {
						reject(error);
						return;
					}
					if (!result) {
						reject(new Error("Cloudinary upload returned no result"));
						return;
					}
					resolve(result);
				}
			);

			Readable.from(buffer).pipe(uploadStream);
		});
	}

	private async destroyInvalidUpload(publicId: string): Promise<void> {
		try {
			await withTimeout(
				cloudinary.uploader.destroy(publicId),
				CLOUDINARY_DESTROY_TIMEOUT_MS,
				"Cloudinary invalid upload cleanup timed out"
			);
		} catch (error) {
			console.error("Failed to delete invalid upload:", error);
		}
	}
}

export const photoStorageService = new PhotoStorageService();
