import sharp from "sharp";
import {
	PHOTO_UPLOAD_COMPRESSION_MIN_QUALITY,
	PHOTO_UPLOAD_COMPRESSION_QUALITY_STEP,
	PHOTO_UPLOAD_COMPRESSION_START_QUALITY,
	PHOTO_UPLOAD_MAX_DIMENSION_PX,
} from "@/backend/services/photos/configs/photo-upload.config";
import { PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_BYTES } from "@/shared/configs/photo-upload.config";

export class PhotoImageProcessingService {
	async compressImageUnderTargetSize(buffer: Buffer): Promise<Buffer> {
		let quality = PHOTO_UPLOAD_COMPRESSION_START_QUALITY;
		let output = await this.compress(buffer, quality);

		while (
			output.length > PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_BYTES &&
			quality > PHOTO_UPLOAD_COMPRESSION_MIN_QUALITY
		) {
			quality -= PHOTO_UPLOAD_COMPRESSION_QUALITY_STEP;
			output = await this.compress(buffer, quality);
		}

		return output;
	}

	private compress(buffer: Buffer, quality: number): Promise<Buffer> {
		return sharp(buffer)
			.rotate()
			.resize({ width: PHOTO_UPLOAD_MAX_DIMENSION_PX })
			.jpeg({ quality })
			.toBuffer();
	}
}

export const photoImageProcessingService = new PhotoImageProcessingService();
