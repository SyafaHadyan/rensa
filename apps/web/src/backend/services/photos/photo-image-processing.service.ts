import sharp from "sharp";
import {
	PHOTO_UPLOAD_FALLBACK_QUALITY,
	PHOTO_UPLOAD_MAX_DIMENSION_PX,
	PHOTO_UPLOAD_MODERATION_DIMENSION_PX,
	PHOTO_UPLOAD_MODERATION_QUALITY,
	PHOTO_UPLOAD_PRIMARY_QUALITY,
} from "@/backend/services/photos/configs/photo-upload.config";
import { PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_BYTES } from "@/shared/configs/photo-upload.config";

export class PhotoImageProcessingService {
	async createUploadImage(buffer: Buffer): Promise<Buffer> {
		const output = await this.compressUploadImage(
			buffer,
			PHOTO_UPLOAD_PRIMARY_QUALITY
		);

		if (output.length <= PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_BYTES) {
			return output;
		}

		return this.compressUploadImage(buffer, PHOTO_UPLOAD_FALLBACK_QUALITY);
	}

	createModerationImage(buffer: Buffer): Promise<Buffer> {
		return sharp(buffer)
			.rotate()
			.resize({
				width: PHOTO_UPLOAD_MODERATION_DIMENSION_PX,
				withoutEnlargement: true,
			})
			.jpeg({
				mozjpeg: true,
				quality: PHOTO_UPLOAD_MODERATION_QUALITY,
			})
			.toBuffer();
	}

	private compressUploadImage(
		buffer: Buffer,
		quality: number
	): Promise<Buffer> {
		return sharp(buffer)
			.rotate()
			.resize({
				width: PHOTO_UPLOAD_MAX_DIMENSION_PX,
				withoutEnlargement: true,
			})
			.jpeg({ mozjpeg: true, quality })
			.toBuffer();
	}
}

export const photoImageProcessingService = new PhotoImageProcessingService();
