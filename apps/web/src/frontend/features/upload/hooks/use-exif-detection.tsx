import { useCallback, useState } from "react";
import {
	type CameraSettings,
	defaultCameraSettings,
} from "@/frontend/features/upload/configs/cameraDatas";
import { brandModels } from "@/frontend/features/upload/configs/cameraModelDatas";
import {
	normalizeCameraMetadata,
	type RawMetadata,
	type RawMetadataValue,
} from "@/frontend/features/upload/utils/metadata-normalizer";
import { api } from "@/lib/axios-client";

type DetectedMetadata = Record<string, RawMetadataValue>;

const DEFAULT_BRAND: CameraSettings["Brand"] = "Fujifilm";

export function useExifDetection(
	file: File | null,
	handleExifChange: (
		field: string,
		value: number | object | string | CameraSettings
	) => void
) {
	const [isDetecting, setIsDetecting] = useState(false);
	const [settings, setSettings] = useState<CameraSettings>(
		defaultCameraSettings.Fujifilm
	);
	const [selectedCamera, setSelectedCamera] =
		useState<CameraSettings["Brand"]>(DEFAULT_BRAND);

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
		(detectedMetadata: DetectedMetadata): CameraSettings => {
			const normalizedMetadata = normalizeCameraMetadata(
				detectedMetadata as RawMetadata,
				{
					brandModels,
					defaultBrand: DEFAULT_BRAND,
					supportedBrands: Object.keys(
						defaultCameraSettings
					) as CameraSettings["Brand"][],
				}
			);
			const brand = normalizedMetadata.Brand as CameraSettings["Brand"];
			const nextSettings = normalizedMetadata as unknown as CameraSettings;

			setSelectedCamera(brand);
			handleExifChange("Brand", brand);

			for (const [key, value] of Object.entries(normalizedMetadata)) {
				if (key !== "Brand") {
					handleExifChange(key, value);
				}
			}

			setSettings(nextSettings);
			return nextSettings;
		},
		[handleExifChange]
	);

	const detectAndApplyExif =
		useCallback(async (): Promise<CameraSettings | null> => {
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
		selectedCamera,
		setSelectedCamera,
		detectAndApplyExif,
		setSettings,
	};
}
