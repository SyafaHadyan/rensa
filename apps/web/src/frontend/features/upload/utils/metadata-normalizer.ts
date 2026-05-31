import { detectValueinString } from "@/utils/value-detections";
import { formatShutterSpeed } from "@/utils/shutter-speed-formatter";

export type RawMetadataValue = boolean | number | object | string | null;
export type RawMetadata = Record<string, RawMetadataValue | undefined>;
export type NormalizedMetadataValue = number | string;
export type NormalizedMetadata = Record<string, NormalizedMetadataValue>;

const metadataAliases: Record<string, string[]> = {
	Brand: [
		"Make",
		"CameraMake",
		"Camera Make",
		"CameraManufacturer",
		"Camera Manufacturer",
		"DeviceMake",
		"Device Make",
		"DeviceManufacturer",
		"Device Manufacturer",
		"ExifIFD:Make",
		"IFD0:Make",
		"ImageMake",
		"Manufacturer",
		"NativeMake",
		"TIFF:Make",
	],
	Model: [
		"Model",
		"Camera",
		"CameraModel",
		"Camera Model",
		"CameraModelName",
		"Camera Model Name",
		"CameraType",
		"Camera Type",
		"DeviceModel",
		"Device Model",
		"ExifIFD:Model",
		"IFD0:Model",
		"ImageModel",
		"NativeModel",
		"TIFF:Model",
		"UniqueCameraModel",
		"Unique Camera Model",
	],
	ISO: ["ISO", "ISOSpeedRatings", "PhotographicSensitivity"],
	Aperture: ["FNumber", "Aperture", "ApertureValue"],
	ShutterSpeed: ["ExposureTime", "ShutterSpeed", "ShutterSpeedValue"],
	FocalLength: ["FocalLength", "FocalLengthIn35mmFormat"],
	Lens: ["Lens", "LensModel", "LensInfo", "LensType"],
	WhiteBalance: [
		"WhiteBalance",
		"White Balance",
		"WhiteBalanceSetting",
		"White Balance Setting",
		"WB",
		"WBMode",
	],
	DynamicRange: [
		"DynamicRange",
		"Dynamic Range",
		"DRange",
		"DR",
		"FujiFilm:DynamicRange",
	],
	FilmMode: [
		"FilmMode",
		"Film Mode",
		"FilmSimulation",
		"Film Simulation",
		"FilmSimulationMode",
		"Film Simulation Mode",
		"FujiFilm:FilmMode",
		"FujiFilm:FilmSimulation",
	],
	CreativeLook: [
		"CreativeLook",
		"Creative Look",
		"CreativeStyle",
		"Creative Style",
		"Sony:CreativeLook",
		"Sony:CreativeStyle",
	],
	PictureStyle: [
		"PictureStyle",
		"Picture Style",
		"BasePictureStyle",
		"Base Picture Style",
		"Canon:PictureStyle",
		"UserDef1PictureStyle",
		"UserDef2PictureStyle",
		"UserDef3PictureStyle",
	],
	PictureControl: [
		"PictureControl",
		"Picture Control",
		"PictureControlName",
		"Picture Control Name",
		"Nikon:PictureControl",
	],
	PhotoStyle: [
		"PhotoStyle",
		"Photo Style",
		"PhotoStyleName",
		"Photo Style Name",
		"Lumix:PhotoStyle",
		"Panasonic:PhotoStyle",
	],
	PictureMode: [
		"PictureMode",
		"Picture Mode",
		"ArtFilter",
		"Art Filter",
		"Olympus:PictureMode",
	],
	ImageControl: [
		"ImageControl",
		"Image Control",
		"ImageControlName",
		"Image Control Name",
		"Ricoh:ImageControl",
	],
	ImageProfile: [
		"ImageProfile",
		"Image Profile",
		"CameraProfile",
		"Camera Profile",
		"ColorMode",
		"Color Mode",
		"ColorProfile",
		"Color Profile",
		"PictureProfile",
		"Picture Profile",
		"ProfileName",
		"Profile Name",
	],
	CustomImage: [
		"CustomImage",
		"Custom Image",
		"CustomImageMode",
		"Custom Image Mode",
		"ImageTone",
		"Image Tone",
		"Pentax:CustomImage",
	],
	FilmStyle: [
		"FilmStyle",
		"Film Style",
		"FilmStyleMode",
		"Film Style Mode",
		"Leica:FilmStyle",
	],
	GrainEffect: ["GrainEffect", "Grain Effect", "Grain", "FujiFilm:GrainEffect"],
	ColorChromeEffect: [
		"ColorChromeEffect",
		"Color Chrome Effect",
		"ChromeEffect",
		"Chrome Effect",
		"FujiFilm:ColorChromeEffect",
	],
	ColorChromeFXBlue: [
		"ColorChromeFXBlue",
		"Color Chrome FX Blue",
		"ColorChromeEffectBlue",
		"Color Chrome Effect Blue",
		"FujiFilm:ColorChromeFXBlue",
	],
	HighlightTone: [
		"HighlightTone",
		"Highlight Tone",
		"Highlights",
		"Highlight",
		"FujiFilm:HighlightTone",
	],
	ShadowTone: [
		"ShadowTone",
		"Shadow Tone",
		"Shadows",
		"Shadow",
		"FujiFilm:ShadowTone",
	],
	Color: ["Color", "ColorSetting", "Color Setting", "FujiFilm:Color"],
	Clarity: ["Clarity", "ClaritySetting", "Clarity Setting"],
	Contrast: ["Contrast", "ContrastSetting", "Contrast Setting"],
	Saturation: ["Saturation", "SaturationSetting", "Saturation Setting"],
	Sharpness: ["Sharpness", "SharpnessSetting", "Sharpness Setting"],
	NoiseReduction: [
		"NoiseReduction",
		"Noise Reduction",
		"NoiseReductionSetting",
		"Noise Reduction Setting",
		"HighISONoiseReduction",
		"High ISO Noise Reduction",
	],
	FilterEffect: [
		"FilterEffect",
		"Filter Effect",
		"ColorFilter",
		"Color Filter",
	],
	ToningEffect: [
		"ToningEffect",
		"Toning Effect",
		"Toning",
		"Tone",
		"PictureTone",
		"Picture Tone",
	],
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

function normalizeMetadataKey(key: string) {
	return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isRecord(value: unknown): value is RawMetadata {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getDirectAliasValue(
	rawMetadata: RawMetadata,
	aliases: string[]
): RawMetadataValue | undefined {
	const aliasKeys = new Set(aliases.map(normalizeMetadataKey));

	for (const [key, value] of Object.entries(rawMetadata)) {
		if (
			aliasKeys.has(normalizeMetadataKey(key)) &&
			value !== undefined &&
			value !== null &&
			value !== ""
		) {
			return value;
		}
	}
	return;
}

function getFirstAliasValue(
	rawMetadata: RawMetadata,
	aliases: string[]
): RawMetadataValue | undefined {
	const directValue = getDirectAliasValue(rawMetadata, aliases);
	if (directValue !== undefined) {
		return directValue;
	}

	for (const value of Object.values(rawMetadata)) {
		if (isRecord(value)) {
			const nestedValue: RawMetadataValue | undefined = getFirstAliasValue(
				value,
				aliases
			);
			if (nestedValue !== undefined) {
				return nestedValue;
			}
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
		if (key === "ShutterSpeed") {
			return formatShutterSpeed(value) as NormalizedMetadataValue;
		}
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
	if (key === "ShutterSpeed") {
		return formatShutterSpeed(normalizedValue) as NormalizedMetadataValue;
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
