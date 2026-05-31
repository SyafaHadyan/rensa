import { detectValueinString } from "@/utils/value-detections";

export type RawMetadataValue = boolean | number | object | string | null;
export type RawMetadata = Record<string, RawMetadataValue | undefined>;
export type NormalizedMetadataValue = number | string;
export type NormalizedMetadata = Record<string, NormalizedMetadataValue>;

const metadataAliases: Record<string, string[]> = {
	Brand: ["Make", "CameraMake", "Manufacturer"],
	Model: ["Model", "CameraModel", "UniqueCameraModel"],
	ISO: ["ISO", "ISOSpeedRatings", "PhotographicSensitivity"],
	Aperture: ["FNumber", "Aperture", "ApertureValue"],
	ShutterSpeed: ["ExposureTime", "ShutterSpeed", "ShutterSpeedValue"],
	FocalLength: ["FocalLength", "FocalLengthIn35mmFormat"],
	Lens: ["Lens", "LensModel", "LensInfo", "LensType"],
	WhiteBalance: ["WhiteBalance", "WBMode"],
	DynamicRange: ["DynamicRange"],
	FilmMode: ["FilmMode", "FilmSimulation", "FilmSimulationMode"],
	CreativeLook: ["CreativeLook", "CreativeStyle"],
	PictureStyle: ["PictureStyle"],
	PictureControl: ["PictureControl"],
	PhotoStyle: ["PhotoStyle"],
	PictureMode: ["PictureMode"],
	ImageControl: ["ImageControl"],
	ImageProfile: ["ImageProfile"],
	CustomImage: ["CustomImage"],
	FilmStyle: ["FilmStyle"],
};

const knownBrandNames = [
	"Fujifilm",
	"Sony",
	"Canon",
	"Nikon",
	"Lumix",
	"Olympus",
	"Ricoh",
	"Hasselblad",
	"Leica",
	"Pentax",
];

function getFirstAliasValue(rawMetadata: RawMetadata, aliases: string[]) {
	for (const alias of aliases) {
		const value = rawMetadata[alias];
		if (value !== undefined && value !== null && value !== "") {
			return value;
		}
	}
	return;
}

function normalizePrimitiveValue(
	key: string,
	value: RawMetadataValue | undefined
): NormalizedMetadataValue | undefined {
	if (value === undefined || value === null) {
		return;
	}

	if (typeof value === "boolean") {
		return;
	}

	if (typeof value === "number") {
		if (key === "Aperture" && typeof value === "number") {
			return `f/${value}`;
		}
		if (key === "FocalLength" && typeof value === "number") {
			return `${value}mm`;
		}
		return value;
	}

	if (typeof value !== "string") {
		return;
	}

	const normalizedValue = value.trim();
	if (!normalizedValue) {
		return;
	}

	if (key === "Aperture" && !normalizedValue.startsWith("f/")) {
		return `f/${normalizedValue}`;
	}
	if (key === "FocalLength" && /^\d+(\.\d+)?$/.test(normalizedValue)) {
		return `${normalizedValue}mm`;
	}
	return normalizedValue;
}

function detectBrand(rawMetadata: RawMetadata) {
	const makeValue = getFirstAliasValue(rawMetadata, metadataAliases.Brand);
	if (typeof makeValue !== "string") {
		return;
	}
	return detectValueinString(knownBrandNames, makeValue) ?? makeValue.trim();
}

export function normalizeCameraMetadata(
	rawMetadata: RawMetadata
): NormalizedMetadata {
	const brand = detectBrand(rawMetadata);
	const normalized: NormalizedMetadata = {};

	if (brand) {
		normalized.Brand = brand;
	}

	for (const [key, aliases] of Object.entries(metadataAliases)) {
		if (key === "Brand") {
			continue;
		}

		const rawValue = getFirstAliasValue(rawMetadata, aliases);
		const value = normalizePrimitiveValue(key, rawValue);

		if (value !== undefined) {
			normalized[key] = value;
		}
	}

	return normalized;
}
