const BYTES_IN_MEGABYTE = 1024 * 1024;

export const PROFILE_AVATAR_ACCEPTED_EXTENSIONS = [
	".jpg",
	".jpeg",
	".png",
	".webp",
] as const;

export const PROFILE_AVATAR_ACCEPTED_MIME_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
] as const;

export const PROFILE_AVATAR_MAX_INPUT_SIZE_MB = 4;
export const PROFILE_AVATAR_MAX_INPUT_SIZE_BYTES =
	PROFILE_AVATAR_MAX_INPUT_SIZE_MB * BYTES_IN_MEGABYTE;
export const PROFILE_AVATAR_OUTPUT_MIME_TYPE = "image/jpeg";

export const PROFILE_AVATAR_ACCEPT_ATTRIBUTE = [
	...PROFILE_AVATAR_ACCEPTED_MIME_TYPES,
	...PROFILE_AVATAR_ACCEPTED_EXTENSIONS,
].join(",");

export type ProfileAvatarExtension =
	(typeof PROFILE_AVATAR_ACCEPTED_EXTENSIONS)[number];
export type ProfileAvatarMimeType =
	(typeof PROFILE_AVATAR_ACCEPTED_MIME_TYPES)[number];

export const isAcceptedProfileAvatarFile = (file: {
	name: string;
	type: string;
}): boolean => {
	const lowerCaseFileName = file.name.toLowerCase();
	return (
		PROFILE_AVATAR_ACCEPTED_MIME_TYPES.includes(
			file.type as ProfileAvatarMimeType
		) ||
		PROFILE_AVATAR_ACCEPTED_EXTENSIONS.some((extension) =>
			lowerCaseFileName.endsWith(extension)
		)
	);
};
