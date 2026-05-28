import "dotenv/config";
import { randomInt, randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { photoMetadata, photos, users } from "../../schemas";

const seedUsers = [
	{
		username: "rensa_seed_aya",
		email: "seed-aya@rensa.local",
		password: "seeded-password-not-for-login",
		avatarUrl: "/profile.jpg",
		verified: true,
	},
	{
		username: "rensa_seed_bima",
		email: "seed-bima@rensa.local",
		password: "seeded-password-not-for-login",
		avatarUrl: "/profile.jpg",
		verified: true,
	},
	{
		username: "rensa_seed_clara",
		email: "seed-clara@rensa.local",
		password: "seeded-password-not-for-login",
		avatarUrl: "/profile.jpg",
		verified: true,
	},
	{
		username: "rensa_seed_dimas",
		email: "seed-dimas@rensa.local",
		password: "seeded-password-not-for-login",
		avatarUrl: "/profile.jpg",
		verified: true,
	},
	{
		username: "rensa_seed_elena",
		email: "seed-elena@rensa.local",
		password: "seeded-password-not-for-login",
		avatarUrl: "/profile.jpg",
		verified: true,
	},
] as const;

const categories = ["landscape", "street", "event", "architectural", "other"];
const styles = ["cinematic", "minimalist", "vintage", "modern", "abstract"];
const colors = [
	"b&w",
	"vibrant",
	"muted",
	"warm",
	"cool",
	"film look",
	"pastel",
];

const titles = [
	"Late Afternoon Frame",
	"Soft Light Study",
	"Quiet Street Recipe",
	"Golden Hour Notes",
	"Everyday Geometry",
	"Window Light Memory",
	"Muted Color Walk",
	"Still Morning Scene",
	"Urban Texture Study",
	"Weekend Film Mood",
];

const descriptions = [
	"A seeded Rensa photo with randomized recipe metadata.",
	"Generated sample data for testing explore and roll galleries.",
	"Local seed image paired with a synthetic camera preset.",
	"Randomized category, style, color, and camera settings.",
	"Sample photography recipe created from the bundled seed photos.",
];

const brandModels = {
	Canon: ["R5", "R6 II", "5D MIV", "G7 X MIII"],
	Fujifilm: ["X-T5", "X100VI", "X-Pro3", "GFX 100S II"],
	Hasselblad: ["X2D", "X1D II", "X1D"],
	Leica: ["Q3", "M11", "SL3", "Q2 Monochrom"],
	Nikon: ["Z8", "Zf", "Z6 III", "D850"],
	Olympus: ["E-M1 III", "E-M5 III", "PEN-F", "TG-6"],
	Pentax: ["K-1 II", "K-3 III", "645Z", "KP"],
	Sony: ["A7 IV", "A7R V", "A1 II", "RX100 VII"],
} as const;

type CameraBrand = keyof typeof brandModels;
interface SeededUser {
	email: string;
	userId: string;
	username: string;
}

const brands = Object.keys(brandModels) as CameraBrand[];

const pick = <T>(items: readonly T[]): T => items[randomInt(items.length)];

const randomSigned = (min: number, max: number) =>
	randomInt(max - min + 1) + min;

const randomPastDate = () => {
	const daysAgo = randomInt(1, 91);
	const hoursAgo = randomInt(0, 24);
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	date.setHours(date.getHours() - hoursAgo);
	return date;
};

const assertCloudinaryConfig = () => {
	const requiredEnvVars = [
		"CLOUDINARY_CLOUD_NAME",
		"CLOUDINARY_API_KEY",
		"CLOUDINARY_API_SECRET",
	] as const;
	const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

	if (missingEnvVars.length > 0) {
		throw new Error(
			`Missing Cloudinary env vars: ${missingEnvVars.join(", ")}`
		);
	}

	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
		secure: true,
	});
};

const validateCloudinaryUrl = (url: string): boolean => {
	const parsedUrl = new URL(url);
	const allowedDomains = ["res.cloudinary.com", "cloudinary.com"];
	const isValidDomain = allowedDomains.some(
		(domain) =>
			parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
	);

	return (
		parsedUrl.protocol === "https:" &&
		isValidDomain &&
		Boolean(
			process.env.CLOUDINARY_CLOUD_NAME &&
				url.includes(`/${process.env.CLOUDINARY_CLOUD_NAME}/`)
		)
	);
};

const toCloudinaryPublicId = (fileName: string) =>
	path
		.parse(fileName)
		.name.replaceAll(/[^a-zA-Z0-9_-]/g, "_")
		.toLowerCase();

const randomCameraPreset = (): {
	brand: CameraBrand;
	exif: Record<string, unknown>;
	model: string;
} => {
	const brand = pick(brands);
	const model = pick(brandModels[brand]);
	const basePreset = {
		Brand: brand,
		Model: model,
		ISO: pick([100, 160, 200, 400, 800, 1600, 3200]),
		Aperture: pick(["f/1.8", "f/2", "f/2.8", "f/4", "f/5.6", "f/8"]),
		ShutterSpeed: pick(["1/60", "1/125", "1/250", "1/500", "1/1000"]),
		FocalLength: pick(["23mm", "28mm", "35mm", "50mm", "85mm"]),
		WhiteBalance: pick(["Auto", "Daylight", "Cloudy", "Shade", "Kelvin"]),
	};

	const brandPreset: Record<CameraBrand, Record<string, unknown>> = {
		Canon: {
			PictureStyle: pick(["Standard", "Portrait", "Landscape", "Neutral"]),
			Sharpness: pick(["Soft", "Normal", "Hard"]),
			Contrast: randomSigned(-4, 4),
			Saturation: randomSigned(-4, 4),
			ColorTone: randomSigned(-4, 4),
		},
		Fujifilm: {
			FilmMode: pick(["Provia", "Velvia", "Classic Chrome", "Acros"]),
			DynamicRange: pick(["DR100", "DR200", "DR400", "Auto"]),
			GrainEffect: pick(["Off", "Weak-Small", "Strong-Small"]),
			HighlightTone: randomSigned(-2, 4),
			ShadowTone: randomSigned(-2, 4),
			Color: randomSigned(-4, 4),
		},
		Hasselblad: {
			ImageProfile: "HNCS",
			Contrast: randomSigned(-3, 3),
			Sharpness: randomSigned(-3, 3),
		},
		Leica: {
			FilmStyle: pick(["Standard", "Vivid", "Natural", "Monochrome"]),
			Contrast: randomSigned(-3, 3),
			Saturation: randomSigned(-3, 3),
			Sharpness: randomSigned(-3, 3),
			Toning: pick(["Sepia", "Blue", "Selenium"]),
		},
		Nikon: {
			PictureControl: pick(["Standard", "Neutral", "Vivid", "Flat"]),
			QuickSharp: randomSigned(-3, 3),
			Clarity: randomSigned(-3, 3),
			Contrast: randomSigned(-3, 3),
			Saturation: randomSigned(-3, 3),
		},
		Olympus: {
			PictureMode: pick(["i-Enhance", "Vivid", "Natural", "Muted"]),
			Gradation: pick(["Auto", "Normal", "High Key", "Low Key"]),
			ColorFilter: pick(["Neutral", "Yellow", "Orange", "Red", "Green"]),
			Contrast: randomSigned(-3, 3),
			Sharpness: randomSigned(-3, 3),
		},
		Pentax: {
			CustomImage: pick(["Bright", "Natural", "Portrait", "Reversal Film"]),
			HighLowKey: randomSigned(-3, 3),
			HighlightContrast: randomSigned(-3, 3),
			ShadowContrast: randomSigned(-3, 3),
			FineSharpness: randomSigned(-3, 3),
		},
		Sony: {
			CreativeLook: pick(["ST", "PT", "VV", "FL"]),
			Contrast: randomSigned(-9, 9),
			Highlights: randomSigned(-9, 9),
			Shadows: randomSigned(-9, 9),
			Saturation: randomSigned(-9, 9),
			Fade: randomInt(10),
		},
	};

	return {
		brand,
		model,
		exif: {
			...basePreset,
			...brandPreset[brand],
		},
	};
};

const main = async () => {
	assertCloudinaryConfig();

	const pool = new Pool({
		connectionString:
			process.env.DATABASE_URL ||
			"postgresql://postgres:postgres@localhost:5432/rensa",
	});
	const db = drizzle(pool, { casing: "snake_case" });

	try {
		const currentFile = fileURLToPath(import.meta.url);
		const seederDir = path.dirname(currentFile);
		const sourceDir = path.join(seederDir, "photos");
		const publicDir = path.join(
			seederDir,
			"../../../../apps/web/public/images/seeded-photos"
		);

		await mkdir(publicDir, { recursive: true });

		const files = (await readdir(sourceDir, { withFileTypes: true }))
			.filter((file) => file.isFile() && /\.(jpe?g|png|webp)$/i.test(file.name))
			.map((file) => file.name)
			.sort();

		if (files.length === 0) {
			throw new Error(`No seed photos found in ${sourceDir}`);
		}

		const seededUsers: SeededUser[] = [];
		for (const seedUser of seedUsers) {
			const [user] = await db
				.insert(users)
				.values(seedUser)
				.onConflictDoUpdate({
					target: users.email,
					set: {
						avatarUrl: seedUser.avatarUrl,
						updatedAt: new Date(),
						username: seedUser.username,
						verified: seedUser.verified,
					},
				})
				.returning({
					userId: users.userId,
					email: users.email,
					username: users.username,
				});

			if (!user) {
				throw new Error(`Failed to create or load seed user ${seedUser.email}`);
			}

			seededUsers.push(user);
		}

		await db.delete(photos).where(
			inArray(
				photos.userId,
				seededUsers.map((user) => user.userId)
			)
		);

		for (const [index, fileName] of files.entries()) {
			const sourceFile = path.join(sourceDir, fileName);
			const publicFile = path.join(publicDir, fileName);
			await copyFile(sourceFile, publicFile);

			const fileStats = await stat(sourceFile);
			const preset = randomCameraPreset();
			const uploadedAt = randomPastDate();
			const createdAt = uploadedAt;
			const title = `${pick(titles)} ${String(index + 1).padStart(2, "0")}`;
			const owner = seededUsers[index % seededUsers.length];
			const uploadResult = await cloudinary.uploader.upload(sourceFile, {
				folder: `seed_uploads/${owner.userId}`,
				public_id: toCloudinaryPublicId(fileName),
				overwrite: true,
				resource_type: "image",
				image_metadata: true,
				quality: "auto",
				fetch_format: "auto",
				transformation: [{ width: 2000, crop: "limit" }],
			});

			if (!validateCloudinaryUrl(uploadResult.secure_url)) {
				await cloudinary.uploader.destroy(uploadResult.public_id);
				throw new Error(`Invalid Cloudinary URL returned for ${fileName}`);
			}

			const [photo] = await db
				.insert(photos)
				.values({
					photoId: randomUUID(),
					userId: owner.userId,
					url: uploadResult.secure_url,
					title,
					description: pick(descriptions),
					category: pick(categories),
					style: pick(styles),
					color: pick(colors),
					camera: preset.brand.toLowerCase(),
					createdAt,
					updatedAt: createdAt,
				})
				.returning({ photoId: photos.photoId });

			if (!photo) {
				throw new Error(`Failed to insert seeded photo for ${fileName}`);
			}

			await db.insert(photoMetadata).values({
				photoMetadataId: photo.photoId,
				exif: preset.exif,
				width: uploadResult.width,
				height: uploadResult.height,
				format: uploadResult.format,
				size: uploadResult.bytes || fileStats.size,
				uploadedAt: new Date(uploadResult.created_at),
			});
		}

		console.info(
			`Seeded ${files.length} photos across ${seededUsers.length} users.`
		);
	} finally {
		await pool.end();
	}
};

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
