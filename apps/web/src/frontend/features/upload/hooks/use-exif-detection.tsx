import { parse } from "exifr";
import { useCallback, useState } from "react";
import {
	type NormalizedMetadata,
	normalizeCameraMetadata,
	type RawMetadata,
	type RawMetadataValue,
} from "@/frontend/features/upload/utils/metadata-normalizer";
import { api } from "@/lib/axios-client";

type DetectedMetadata = Record<string, RawMetadataValue>;

function toDetectedMetadata(metadata: unknown): DetectedMetadata | null {
	if (!(metadata && typeof metadata === "object") || Array.isArray(metadata)) {
		return null;
	}

	const entries = Object.entries(metadata).filter((entry) => {
		const [, value] = entry;
		return (
			value === null ||
			typeof value === "boolean" ||
			typeof value === "number" ||
			typeof value === "object" ||
			typeof value === "string"
		);
	}) as [string, RawMetadataValue][];

	if (entries.length === 0) {
		return null;
	}

	return Object.fromEntries(entries);
}

function hasUsableNormalizedMetadata(metadata: DetectedMetadata) {
	return (
		Object.keys(normalizeCameraMetadata(metadata as RawMetadata)).length > 0
	);
}

export function useExifDetection(file: File | null) {
	const [isDetecting, setIsDetecting] = useState(false);
	const [settings, setSettings] = useState<NormalizedMetadata>({});

	const detectClientMetadata =
		useCallback(async (): Promise<DetectedMetadata | null> => {
			if (!file) {
				return null;
			}

			try {
				const metadata = await parse(file, {
					exif: true,
					iptc: true,
					jfif: true,
					mergeOutput: true,
					sanitize: true,
					tiff: true,
					xmp: true,
				});
				const detectedMetadata = toDetectedMetadata(metadata);
				if (detectedMetadata) {
					console.log("Client EXIF metadata detected:", detectedMetadata);
				}
				return detectedMetadata;
			} catch (err) {
				console.warn("Client metadata detection failed:", err);
				return null;
			}
		}, [file]);

	const detectServerMetadata =
		useCallback(async (): Promise<DetectedMetadata | null> => {
			if (!file) {
				return null;
			}

			const formData = new FormData();
			formData.append("file", file);

			const res = await api.post("/photos/exifread", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			const detectedMetadata = toDetectedMetadata(res.data.data);
			if (detectedMetadata) {
				console.log("Server EXIF metadata detected:", detectedMetadata);
			}
			return detectedMetadata;
		}, [file]);

	const detectMetadata =
		useCallback(async (): Promise<DetectedMetadata | null> => {
			if (!file) {
				return null;
			}
			setIsDetecting(true);
			try {
				const clientMetadata = await detectClientMetadata();
				if (clientMetadata && hasUsableNormalizedMetadata(clientMetadata)) {
					return clientMetadata;
				}
				console.log("Falling back to Express EXIF service.");
				return await detectServerMetadata();
			} catch (err) {
				console.error("Metadata detection failed:", err);
				return null;
			} finally {
				setIsDetecting(false);
			}
		}, [detectClientMetadata, detectServerMetadata, file]);

	const autoFillSettings = useCallback(
		(detectedMetadata: DetectedMetadata): NormalizedMetadata => {
			const normalizedMetadata = normalizeCameraMetadata(
				detectedMetadata as RawMetadata
			);

			setSettings(normalizedMetadata);
			return normalizedMetadata;
		},
		[]
	);

	const detectAndApplyExif =
		useCallback(async (): Promise<NormalizedMetadata | null> => {
			const metadata = await detectMetadata();
			if (metadata) {
				return autoFillSettings(metadata);
			}
			return null;
		}, [autoFillSettings, detectMetadata]);

	return {
		isDetecting,
		detectMetadata,
		autoFillSettings,
		settings,
		detectAndApplyExif,
		setSettings,
	};
}
