import { useCallback, useState } from "react";
import {
	type NormalizedMetadata,
	normalizeCameraMetadata,
	type RawMetadata,
	type RawMetadataValue,
} from "@/frontend/features/upload/utils/metadata-normalizer";
import { api } from "@/lib/axios-client";

type DetectedMetadata = Record<string, RawMetadataValue>;

export function useExifDetection(file: File | null) {
	const [isDetecting, setIsDetecting] = useState(false);
	const [settings, setSettings] = useState<NormalizedMetadata>({});

	const detectMetadata =
		useCallback(async (): Promise<DetectedMetadata | null> => {
			if (!file) {
				return null;
			}
			setIsDetecting(true);
			try {
				const formData = new FormData();
				formData.append("file", file);

				const res = await api.post("/photos/exifread", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
				return res.data.data as DetectedMetadata;
			} catch (err) {
				console.error("Metadata detection failed:", err);
				return null;
			} finally {
				setIsDetecting(false);
			}
		}, [file]);

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
