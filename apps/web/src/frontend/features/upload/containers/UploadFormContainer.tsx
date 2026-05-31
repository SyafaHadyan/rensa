import { FilterLists } from "@/frontend/data/filterDatas";
import type { NormalizedMetadata } from "@/frontend/features/upload/utils/metadata-normalizer";
import UploadFormView from "../components/UploadFormView";

export interface UploadFormContainerProps {
	handleTags: (value: string | string[]) => void;
	isDetecting: boolean;
	onChange: (field: string, value: string | string[]) => void;
	setSettings: (settings: NormalizedMetadata) => void;
	settings: NormalizedMetadata;
	tags: string[];
}

const UploadFormContainer: React.FC<UploadFormContainerProps> = ({
	onChange,
	tags,
	handleTags,
	isDetecting,
	settings,
	setSettings,
}) => (
	<UploadFormView
		categoryOptions={FilterLists[0].items.map((item) => item.label)}
		colorOptions={FilterLists[3].items.map((item) => item.label)}
		handleTags={handleTags}
		isDetecting={isDetecting}
		onCategoryChange={(value) => onChange("category", value)}
		onColorChange={(value) => onChange("color", value)}
		onDescriptionChange={(value) => onChange("description", value)}
		onStyleChange={(value) => onChange("style", value)}
		onTitleChange={(value) => onChange("title", value)}
		setSettings={setSettings}
		settings={settings}
		styleOptions={FilterLists[2].items.map((item) => item.label)}
		tags={tags}
	/>
);

export default UploadFormContainer;
