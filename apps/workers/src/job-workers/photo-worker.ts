import { Readable } from "node:stream";
import { cloudinary, type UploadApiResponse } from "@rensa/cloudinary";
import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import type { ProcessUploadPayload } from "@rensa/queue";
import sharp from "sharp";
import { env } from "../env";

export class PermanentPhotoProcessingError extends Error {}

const uploadBuffer = (
	buffer: Buffer,
	userId: string
): Promise<UploadApiResponse> =>
	new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				fetch_format: "auto",
				folder: `user_uploads/${userId}`,
				image_metadata: true,
				quality: "auto",
				resource_type: "image",
				transformation: [{ crop: "limit", width: 2000 }],
			},
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

		Readable.from(buffer).pipe(stream);
	});

const downloadSource = async (sourceUrl: string) => {
	const response = await fetch(sourceUrl);
	if (!response.ok) {
		throw new Error(`Failed to download staged image: ${response.status}`);
	}

	return Buffer.from(await response.arrayBuffer());
};

const assertAllowedImage = async (buffer: Buffer, filename: string) => {
	const formData = new FormData();
	const body = buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength
	) as ArrayBuffer;
	formData.set("file", new Blob([body]), filename);
	const response = await fetch(`${env.aiBaseUrl}/nsfw/predict`, {
		body: formData,
		method: "POST",
	});

	if (!response.ok) {
		if (response.status >= 400 && response.status < 500) {
			throw new PermanentPhotoProcessingError("Image failed moderation.");
		}
		throw new Error(`Moderation service failed with ${response.status}`);
	}

	const result = (await response.json()) as { label?: string };
	if (result.label?.toUpperCase() === "NSFW") {
		throw new PermanentPhotoProcessingError("Image failed moderation.");
	}
};

export const processPhotoUpload = async (
	payload: ProcessUploadPayload,
	repository = new PhotoRepository()
) => {
	try {
		const original = await downloadSource(payload.sourceUrl);
		const moderationImage = await sharp(original)
			.rotate()
			.resize({ fit: "inside", width: 768, withoutEnlargement: true })
			.jpeg({ quality: 80 })
			.toBuffer();
		await assertAllowedImage(moderationImage, payload.originalFilename);

		const optimized = await sharp(original)
			.rotate()
			.resize({ fit: "inside", width: 2000, withoutEnlargement: true })
			.jpeg({ quality: 85 })
			.toBuffer();
		const uploaded = await uploadBuffer(optimized, payload.userId);

		await repository.markProcessingReady(payload.photoId, {
			format: uploaded.format,
			height: uploaded.height,
			publicId: uploaded.public_id,
			size: uploaded.bytes,
			uploadedAt: new Date(uploaded.created_at),
			url: uploaded.secure_url,
			width: uploaded.width,
		});
		await cloudinary.uploader.destroy(payload.sourcePublicId);
	} catch (error) {
		if (error instanceof PermanentPhotoProcessingError) {
			await repository.markProcessingFailed(payload.photoId, error.message);
			await cloudinary.uploader.destroy(payload.sourcePublicId);
			return;
		}

		throw error;
	}
};
