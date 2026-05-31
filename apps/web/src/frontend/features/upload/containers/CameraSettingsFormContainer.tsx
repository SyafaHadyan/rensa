import type {
	NormalizedMetadata,
	NormalizedMetadataValue,
} from "@/frontend/features/upload/utils/metadata-normalizer";
import CameraSettingsFormView from "../components/CameraSettingsFormView";

export interface CameraSettingsFormContainerProps {
	handleSettings: (settings: NormalizedMetadata) => void;
	settings: NormalizedMetadata;
}

const CameraSettingsFormContainer: React.FC<
	CameraSettingsFormContainerProps
> = ({ settings, handleSettings }) => {
	const updateSetting = (key: string, value: NormalizedMetadataValue) => {
		handleSettings({
			...settings,
			[key]: value,
		});
	};

	const handleTextChange = (key: string, value: string) => {
		updateSetting(key, value);
	};

	const handleNumberChange = (key: string, value: number) => {
		updateSetting(key, value);
	};

	const handleRemoveField = (key: string) => {
		const nextSettings = { ...settings };
		delete nextSettings[key];
		handleSettings(nextSettings);
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
			onAddField={handleAddField}
			onNumberChange={handleNumberChange}
			onRemoveField={handleRemoveField}
			onTextChange={handleTextChange}
			settings={settings}
		/>
	);
};

export default CameraSettingsFormContainer;
