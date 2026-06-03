import { v2 as cloudinary } from "cloudinary";

export type { UploadApiOptions, UploadApiResponse } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

const allowedCloudinaryDomains = ["res.cloudinary.com", "cloudinary.com"];
const publicIdPattern = /^[A-Za-z0-9_\-/]+$/;
const versionPathPattern = /^v\d+$/;

export const validateCloudinaryUrl = (url: string): boolean => {
	try {
		const parsedUrl = new URL(url);

		if (parsedUrl.protocol !== "https:") {
			console.error("URL validation failed: Not HTTPS");
			return false;
		}

		const isValidDomain = allowedCloudinaryDomains.some(
			(domain) =>
				parsedUrl.hostname === domain ||
				parsedUrl.hostname.endsWith(`.${domain}`)
		);

		if (!isValidDomain) {
			console.error("URL validation failed: Not from Cloudinary domain");
			return false;
		}

		const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
		if (cloudName && !url.includes(`/${cloudName}/`)) {
			console.error("URL validation failed: Wrong cloud name");
			return false;
		}

		return true;
	} catch (error) {
		console.error("URL validation failed: Invalid URL format", error);
		return false;
	}
};

export const getCloudinaryPublicIdFromUrl = (url: string): string | null => {
	try {
		if (!validateCloudinaryUrl(url)) {
			return null;
		}

		const parsedUrl = new URL(url);
		const parts = parsedUrl.pathname
			.split("/")
			.filter(Boolean)
			.map((part) => decodeURIComponent(part));
		const uploadIndex = parts.indexOf("upload");
		if (uploadIndex === -1) {
			return null;
		}

		const uploadPath = parts.slice(uploadIndex + 1);
		const versionIndex = uploadPath.findIndex((part) =>
			versionPathPattern.test(part)
		);
		const publicIdParts =
			versionIndex === -1 ? uploadPath : uploadPath.slice(versionIndex + 1);
		if (publicIdParts.length === 0) {
			return null;
		}

		const lastPart = publicIdParts.at(-1);
		if (!lastPart) {
			return null;
		}

		const extensionIndex = lastPart.lastIndexOf(".");
		publicIdParts[publicIdParts.length - 1] =
			extensionIndex === -1 ? lastPart : lastPart.slice(0, extensionIndex);

		const publicId = publicIdParts.join("/");
		return publicIdPattern.test(publicId) ? publicId : null;
	} catch (error) {
		console.error("Failed to parse Cloudinary public ID:", error);
		return null;
	}
};

export default cloudinary;
