const BYTES_IN_MEGABYTE = 1024 * 1024;

export const PHOTO_UPLOAD_ACCEPTED_EXTENSIONS = [".jpg", ".jpeg"] as const;
export const PHOTO_UPLOAD_ACCEPTED_MIME_TYPES = [
	"image/jpeg",
	"image/jpg",
] as const;

export type PhotoUploadExtension =
	(typeof PHOTO_UPLOAD_ACCEPTED_EXTENSIONS)[number];
export type PhotoUploadMimeType =
	(typeof PHOTO_UPLOAD_ACCEPTED_MIME_TYPES)[number];

export interface PhotoUploadConfig {
	acceptedFormats: readonly PhotoUploadMimeType[];
	fileSizeMb: number;
	fileTypes: readonly PhotoUploadExtension[];
	maxFiles: number;
}

export const PHOTO_UPLOAD_MAX_FILES = 1;
export const PHOTO_UPLOAD_MAX_INPUT_SIZE_MB = 4;
export const PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_MB = 10;

export const PHOTO_UPLOAD_MAX_INPUT_SIZE_BYTES =
	PHOTO_UPLOAD_MAX_INPUT_SIZE_MB * BYTES_IN_MEGABYTE;
export const PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_BYTES =
	PHOTO_UPLOAD_TARGET_OUTPUT_SIZE_MB * BYTES_IN_MEGABYTE;

export const PHOTO_UPLOAD_ACCEPT_ATTRIBUTE = [
	...PHOTO_UPLOAD_ACCEPTED_MIME_TYPES,
	...PHOTO_UPLOAD_ACCEPTED_EXTENSIONS,
].join(",");

export const photoUploadConfig: PhotoUploadConfig = {
	acceptedFormats: PHOTO_UPLOAD_ACCEPTED_MIME_TYPES,
	fileSizeMb: PHOTO_UPLOAD_MAX_INPUT_SIZE_MB,
	fileTypes: PHOTO_UPLOAD_ACCEPTED_EXTENSIONS,
	maxFiles: PHOTO_UPLOAD_MAX_FILES,
};

export const isAcceptedPhotoUploadFile = (file: {
	name: string;
	type: string;
}): boolean => {
	const lowerCaseFileName = file.name.toLowerCase();
	return (
		PHOTO_UPLOAD_ACCEPTED_MIME_TYPES.includes(
			file.type as PhotoUploadMimeType
		) ||
		PHOTO_UPLOAD_ACCEPTED_EXTENSIONS.some((extension) =>
			lowerCaseFileName.endsWith(extension)
		)
	);
};
