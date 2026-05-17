import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import { photoUploadLimiter } from "@rensa/rate-limit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import sharp from "sharp";
import {
	PHOTO_UPLOAD_COMPRESSION_MIN_QUALITY,
	PHOTO_UPLOAD_COMPRESSION_QUALITY_STEP,
	PHOTO_UPLOAD_COMPRESSION_START_QUALITY,
	PHOTO_UPLOAD_MAX_DIMENSION_PX,
} from "@/backend/services/photos/configs/photo-upload.config";
import { authOptions } from "@/lib/auth";
import { fastApi } from "@/lib/axios-server";
import cloudinary, { validateCloudinaryUrl } from "@/lib/cloudinary";
import { sanitizeInput } from "@/lib/validation";
import {
	isAcceptedPhotoUploadFile,
	PHOTO_UPLOAD_MAX_INPUT_SIZE_BYTES,
	PHOTO_UPLOAD_MAX_INPUT_SIZE_MB,
	PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_BYTES,
} from "@/shared/configs/photo-upload.config";

const photoRepository = new PhotoRepository();

export async function compressImageUnder10MB(buffer: Buffer): Promise<Buffer> {
	let quality = PHOTO_UPLOAD_COMPRESSION_START_QUALITY;
	let output = await sharp(buffer)
		.withMetadata()
		.rotate(0)
		.resize({ width: PHOTO_UPLOAD_MAX_DIMENSION_PX })
		.jpeg({ quality })
		.toBuffer();

	while (
		output.length > PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_BYTES &&
		quality > PHOTO_UPLOAD_COMPRESSION_MIN_QUALITY
	) {
		quality -= PHOTO_UPLOAD_COMPRESSION_QUALITY_STEP;
		output = await sharp(buffer)
			.withMetadata()
			.rotate(0)
			.resize({ width: PHOTO_UPLOAD_MAX_DIMENSION_PX })
			.jpeg({ quality })
			.toBuffer();
	}

	return output;
}

/*
  POST /api/photos/upload
  Upload a photo
*/
export async function POST(req: Request) {
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
		const formData = await req.formData();

		const file = formData.get("file") as File;
		const userId = session.user.id;

		// ðŸ”’ SECURITY: Sanitize and validate all photo metadata
		const rawTitle = formData.get("title") as string;
		const rawDescription = formData.get("description") as string;
		const rawCategory = formData.get("category") as string;
		const rawStyle = formData.get("style") as string;
		const rawColor = formData.get("color") as string;

		// Sanitize text inputs to prevent XSS
		const title = sanitizeInput(rawTitle || "");
		const description = sanitizeInput(rawDescription || "");
		const category = sanitizeInput(rawCategory || "");
		const style = sanitizeInput(rawStyle || "");
		const color = sanitizeInput(rawColor || "");

		// Validate title (required, 1-200 chars)
		if (!title || title.trim().length === 0) {
			return NextResponse.json(
				{ success: false, error: "Title is required" },
				{ status: 400 }
			);
		}
		if (title.length > 200) {
			return NextResponse.json(
				{ success: false, error: "Title must be 200 characters or less" },
				{ status: 400 }
			);
		}

		// Validate description (optional, 0-5000 chars)
		if (description.length > 5000) {
			return NextResponse.json(
				{
					success: false,
					error: "Description must be 5000 characters or less",
				},
				{ status: 400 }
			);
		}

		// Validate category (optional, 1-100 chars)
		if (category && category.length > 100) {
			return NextResponse.json(
				{ success: false, error: "Category must be 100 characters or less" },
				{ status: 400 }
			);
		}

		// Validate style (optional, 1-100 chars)
		if (style && style.length > 100) {
			return NextResponse.json(
				{ success: false, error: "Style must be 100 characters or less" },
				{ status: 400 }
			);
		}

		// Validate color (optional, 1-100 chars)
		if (color && color.length > 100) {
			return NextResponse.json(
				{ success: false, error: "Color must be 100 characters or less" },
				{ status: 400 }
			);
		}

		// Parse and validate tags
		let tags: string[] = [];
		try {
			const rawTags = JSON.parse(formData.get("tags") as string);
			if (!Array.isArray(rawTags)) {
				throw new Error("Tags must be an array");
			}

			// Sanitize and validate each tag
			tags = rawTags
				.map((tag: any) => {
					if (typeof tag !== "string") {
						return null;
					}
					const sanitized = sanitizeInput(tag);
					// Each tag: 1-50 chars
					if (sanitized.length === 0 || sanitized.length > 50) {
						return null;
					}
					return sanitized;
				})
				.filter((tag: string | null): tag is string => tag !== null);

			// Limit to 20 tags max
			if (tags.length > 20) {
				return NextResponse.json(
					{ success: false, error: "Maximum 20 tags allowed" },
					{ status: 400 }
				);
			}
		} catch {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid tags format. Must be an array of strings.",
				},
				{ status: 400 }
			);
		}

		// Parse and validate EXIF data
		let exif: any = {};
		let camera = "";
		try {
			const rawExif = JSON.parse(formData.get("exif") as string);
			if (typeof rawExif !== "object" || rawExif === null) {
				exif = {};
			} else {
				exif = rawExif;
			}

			if (exif.Brand && typeof exif.Brand === "string") {
				camera = sanitizeInput(exif.Brand).substring(0, 200); // Max 200 chars
			}
		} catch {
			return NextResponse.json(
				{ success: false, error: "Invalid EXIF data format" },
				{ status: 400 }
			);
		}

		// Validate file
		if (!file) {
			return NextResponse.json(
				{ success: false, error: "No file provided" },
				{ status: 400 }
			);
		}
		if (file.size > PHOTO_UPLOAD_MAX_INPUT_SIZE_BYTES) {
			return NextResponse.json(
				{
					success: false,
					error: `Image must be ${PHOTO_UPLOAD_MAX_INPUT_SIZE_MB}MB or smaller.`,
				},
				{ status: 400 }
			);
		}
		if (!isAcceptedPhotoUploadFile(file)) {
			return NextResponse.json(
				{ success: false, error: "Only JPG/JPEG files are allowed." },
				{ status: 400 }
			);
		}

		// Convert File -> Buffer -> Base64 for Cloudinary
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const compressedBuffer = await compressImageUnder10MB(buffer);

		const base64File = `data:${file.type};base64,${compressedBuffer.toString(
			"base64"
		)}`;
		const formPhoto = new FormData();
		formPhoto.append("file", file);

		const res = await fastApi.post("/nsfw/predict", formPhoto, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		const key = Object.keys(res.data)[0];
		if (res.data[key].Label === "NSFW") {
			return NextResponse.json(
				{ success: false, error: "NSFW content detected. Upload rejected." },
				{ status: 400 }
			);
		}

		const uploadRes = await cloudinary.uploader.upload(base64File, {
			folder: `user_uploads/${userId}`,
			resource_type: "image",
			image_metadata: true,
			quality: "auto",
			fetch_format: "auto",
			transformation: [{ width: 2000, crop: "limit" }],
		});

		const { secure_url, width, height, format, bytes, created_at } = uploadRes;

		if (!validateCloudinaryUrl(secure_url)) {
			try {
				const publicId = uploadRes.public_id;
				await cloudinary.uploader.destroy(publicId);
			} catch (deleteError) {
				console.error("Failed to delete invalid upload:", deleteError);
			}

			return NextResponse.json(
				{
					success: false,
					error:
						"Invalid or suspicious image URL detected. Upload rejected for security reasons.",
				},
				{ status: 400 }
			);
		}

		let photo;
		try {
			photo = await photoRepository.createUploadedPhoto({
				camera,
				category,
				color,
				description,
				exif,
				format,
				height,
				size: bytes,
				style,
				title,
				uploadedAt: new Date(created_at),
				url: secure_url,
				userId,
				width,
			});
		} catch (persistError) {
			console.error("Failed to persist uploaded photo:", persistError);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to persist photo",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			photo: {
				photo_id: photo.photoId,
				user_id: photo.userId,
				url: photo.url,
				title: photo.title,
				description: photo.description,
				category: photo.category,
				style: photo.style,
				color: photo.color,
				camera: photo.camera,
				created_at: photo.createdAt?.toISOString(),
				updated_at: photo.updatedAt?.toISOString(),
				tags,
				metadata: {
					width,
					height,
					format,
					size: bytes,
					exif,
					uploadedAt: created_at,
				},
			},
		});
	} catch (err) {
		console.error("Upload error:", err);
		return NextResponse.json({ success: false, error: err }, { status: 500 });
	}
}
