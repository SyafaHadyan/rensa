import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import {
	UnauthorizedError,
	ValidationError,
} from "@/backend/common/backend.error";
import { sanitizeInput } from "@/lib/validation";
import {
	isAcceptedPhotoUploadFile,
	PHOTO_UPLOAD_MAX_INPUT_SIZE_BYTES,
	PHOTO_UPLOAD_MAX_INPUT_SIZE_MB,
} from "@/shared/configs/photo-upload.config";
import { photoImageProcessingService } from "./photo-image-processing.service";
import { photoModerationService } from "./photo-moderation.service";
import { photoStorageService } from "./photo-storage.service";
import { PhotoPersistenceError } from "./photo-upload.errors";
import { logUploadStage } from "./photo-upload-logger";

type UploadExif = Record<string, unknown> & {
	Brand?: unknown;
};

interface PhotoUploadPayload {
	camera: string;
	category: string;
	color: string;
	description: string;
	exif: UploadExif;
	file: File;
	style: string;
	tags: string[];
	title: string;
}

export interface UploadedPhotoResult {
	camera: string | null;
	category: string | null;
	color: string | null;
	createdAt?: string;
	description: string | null;
	metadata: {
		exif: UploadExif;
		format: string;
		height: number;
		size: number;
		uploadedAt: string;
		width: number;
	};
	photoId: string;
	style: string | null;
	tags: string[];
	title: string;
	updatedAt?: string;
	url: string;
	userId: string;
}

export class PhotoUploadService {
	constructor(
		private readonly photoRepository = new PhotoRepository(),
		private readonly imageProcessing = photoImageProcessingService,
		private readonly moderation = photoModerationService,
		private readonly storage = photoStorageService
	) {}

	async upload(params: {
		formData: FormData;
		sessionUserId: string;
		uploadId: string;
	}): Promise<UploadedPhotoResult> {
		if (!params.sessionUserId) {
			throw new UnauthorizedError(
				"Authenticated user was not found. Please log out and log in again."
			);
		}

		const payload = this.parsePayload(params.formData);
		const fileReadStartedAt = performance.now();
		const arrayBuffer = await payload.file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		logUploadStage(params.uploadId, "read_file", fileReadStartedAt, {
			inputBytes: payload.file.size,
		});

		const compressionStartedAt = performance.now();
		const [compressedBuffer, moderationBuffer] = await Promise.all([
			this.imageProcessing.createUploadImage(buffer),
			this.imageProcessing.createModerationImage(buffer),
		]);
		logUploadStage(params.uploadId, "compress_image", compressionStartedAt, {
			inputBytes: buffer.length,
			moderationBytes: moderationBuffer.length,
			outputBytes: compressedBuffer.length,
		});

		const moderationStartedAt = performance.now();
		await this.moderation.assertAllowedImage({
			buffer: moderationBuffer,
			filename: payload.file.name,
		});
		logUploadStage(params.uploadId, "moderate_image", moderationStartedAt);

		const cloudinaryStartedAt = performance.now();
		const uploadRes = await this.storage.uploadPhoto({
			buffer: compressedBuffer,
			userId: params.sessionUserId,
		});
		logUploadStage(params.uploadId, "cloudinary_upload", cloudinaryStartedAt, {
			uploadBytes: compressedBuffer.length,
		});

		const {
			bytes,
			created_at: createdAt,
			format,
			height,
			secure_url: secureUrl,
			width,
		} = uploadRes;

		let photo;
		try {
			photo = await this.photoRepository.createUploadedPhoto({
				camera: payload.camera,
				category: payload.category,
				color: payload.color,
				description: payload.description,
				exif: payload.exif,
				format,
				height,
				size: bytes,
				style: payload.style,
				title: payload.title,
				uploadedAt: new Date(createdAt),
				url: secureUrl,
				userId: params.sessionUserId,
				width,
			});
		} catch (error) {
			console.error("Failed to persist uploaded photo:", error);
			throw new PhotoPersistenceError();
		}

		return {
			photoId: photo.photoId,
			userId: params.sessionUserId,
			url: photo.url,
			title: photo.title,
			description: photo.description,
			category: photo.category,
			style: photo.style,
			color: photo.color,
			camera: photo.camera,
			createdAt: photo.createdAt?.toISOString(),
			updatedAt: photo.updatedAt?.toISOString(),
			tags: payload.tags,
			metadata: {
				width,
				height,
				format,
				size: bytes,
				exif: payload.exif,
				uploadedAt: createdAt,
			},
		};
	}

	private parsePayload(formData: FormData): PhotoUploadPayload {
		const rawTitle = formData.get("title") as string;
		const rawDescription = formData.get("description") as string;
		const rawCategory = formData.get("category") as string;
		const rawStyle = formData.get("style") as string;
		const rawColor = formData.get("color") as string;

		const title = sanitizeInput(rawTitle || "");
		const description = sanitizeInput(rawDescription || "");
		const category = sanitizeInput(rawCategory || "");
		const style = sanitizeInput(rawStyle || "");
		const color = sanitizeInput(rawColor || "");

		if (!title || title.trim().length === 0) {
			throw new ValidationError("Title is required");
		}
		if (title.length > 200) {
			throw new ValidationError("Title must be 200 characters or less");
		}
		if (description.length > 5000) {
			throw new ValidationError("Description must be 5000 characters or less");
		}
		if (category && category.length > 100) {
			throw new ValidationError("Category must be 100 characters or less");
		}
		if (style && style.length > 100) {
			throw new ValidationError("Style must be 100 characters or less");
		}
		if (color && color.length > 100) {
			throw new ValidationError("Color must be 100 characters or less");
		}

		const tags = this.parseTags(formData.get("tags"));
		const { camera, exif } = this.parseExif(formData.get("exif"));
		const file = formData.get("file");
		if (!(file instanceof File)) {
			throw new ValidationError("No file provided");
		}
		if (file.size > PHOTO_UPLOAD_MAX_INPUT_SIZE_BYTES) {
			throw new ValidationError(
				`Image must be ${PHOTO_UPLOAD_MAX_INPUT_SIZE_MB}MB or smaller.`
			);
		}
		if (!isAcceptedPhotoUploadFile(file)) {
			throw new ValidationError("Only JPG/JPEG files are allowed.");
		}

		return {
			camera,
			category,
			color,
			description,
			exif,
			file,
			style,
			tags,
			title,
		};
	}

	private parseTags(value: FormDataEntryValue | null): string[] {
		try {
			const rawTags = JSON.parse(value as string);
			if (!Array.isArray(rawTags)) {
				throw new Error("Tags must be an array");
			}

			const tags = rawTags
				.map((tag: unknown) => {
					if (typeof tag !== "string") {
						return null;
					}
					const sanitized = sanitizeInput(tag);
					if (sanitized.length === 0 || sanitized.length > 50) {
						return null;
					}
					return sanitized;
				})
				.filter((tag: string | null): tag is string => tag !== null);

			if (tags.length > 20) {
				throw new ValidationError("Maximum 20 tags allowed");
			}

			return tags;
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error;
			}
			throw new ValidationError(
				"Invalid tags format. Must be an array of strings."
			);
		}
	}

	private parseExif(value: FormDataEntryValue | null): {
		camera: string;
		exif: UploadExif;
	} {
		try {
			const rawExif = JSON.parse(value as string);
			const exif =
				typeof rawExif === "object" && rawExif !== null
					? (rawExif as UploadExif)
					: {};
			const camera =
				typeof exif.Brand === "string"
					? sanitizeInput(exif.Brand).substring(0, 200)
					: "";

			return { camera, exif };
		} catch {
			throw new ValidationError("Invalid EXIF data format");
		}
	}
}

export const photoUploadService = new PhotoUploadService();
