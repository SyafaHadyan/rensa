import type { CameraSettings } from "@/frontend/features/upload/configs/cameraDatas";
import type { NormalizedMetadataValue } from "@/frontend/features/upload/utils/metadata-normalizer";
import CameraSettingsFormView from "../components/CameraSettingsFormView";

export interface CameraSettingsFormContainerProps {
	cameraModels: string[];
	fieldOptions: Record<string, string[]>;
	handleSettings: (settings: CameraSettings) => void;
	settings: CameraSettings;
}

const CameraSettingsFormContainer: React.FC<
	CameraSettingsFormContainerProps
> = ({ settings, cameraModels, fieldOptions, handleSettings }) => {
	const updateSetting = (key: string, value: NormalizedMetadataValue) => {
		handleSettings({
			...(settings as unknown as Record<string, NormalizedMetadataValue>),
			[key]: value,
		} as unknown as CameraSettings);
	};

	const handleModelChange = (model: string) => {
		updateSetting("Model", model);
	};

	const handleOptionChange = (key: string, value: string) => {
		updateSetting(key, value);
	};

	const handleTextChange = (key: string, value: string) => {
		updateSetting(key, value);
	};

	const handleNumberChange = (key: string, value: number) => {
		updateSetting(key, value);
	};

	const handleRemoveField = (key: string) => {
		const nextSettings = {
			...(settings as unknown as Record<string, NormalizedMetadataValue>),
		};
		delete nextSettings[key];
		handleSettings(nextSettings as unknown as CameraSettings);
	};

	const handleAddField = (key: string, value: string) => {
		const normalizedKey = key.trim().replace(/\s+/g, "");
		const normalizedValue = value.trim();
		if (!(normalizedKey && normalizedValue) || normalizedKey === "Brand") {
			return;
		}
		updateSetting(normalizedKey, normalizedValue);
	};

	return (
		<CameraSettingsFormView
			cameraModels={cameraModels}
			fieldOptions={fieldOptions}
			onAddField={handleAddField}
			onModelChange={handleModelChange}
			onNumberChange={handleNumberChange}
			onOptionChange={handleOptionChange}
			onRemoveField={handleRemoveField}
			onTextChange={handleTextChange}
			settings={settings}
		/>
	);
};

export default CameraSettingsFormContainer;
