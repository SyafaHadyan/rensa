import type React from "react";
import BaseInputField from "@/frontend/components/inputfields/BaseInputField";
import InputDropdown from "@/frontend/components/inputfields/InputDropdown";
import TagsInputField from "@/frontend/components/inputfields/TagsInputField";
import TextAreaInput from "@/frontend/components/inputfields/TextAreaInput";
import type { NormalizedMetadata } from "@/frontend/features/upload/utils/metadata-normalizer";
import CameraSettingsFormContainer from "../containers/CameraSettingsFormContainer";

interface UploadFormViewProps {
	categoryOptions: string[];
	colorOptions: string[];
	handleTags: (value: string | string[]) => void;
	isDetecting: boolean;
	onCategoryChange: (category: string) => void;
	onColorChange: (color: string) => void;
	onDescriptionChange: (description: string) => void;
	onStyleChange: (style: string) => void;
	onTitleChange: (title: string) => void;
	setSettings: (settings: NormalizedMetadata) => void;
	settings: NormalizedMetadata;
	styleOptions: string[];
	tags: string[];
}

const UploadFormView: React.FC<UploadFormViewProps> = ({
	onTitleChange,
	onDescriptionChange,
	handleTags,
	tags,
	onCategoryChange,
	onStyleChange,
	onColorChange,
	categoryOptions,
	styleOptions,
	colorOptions,
	isDetecting,
	setSettings,
	settings,
}) => (
	<form
		aria-label="Upload photo details"
		className="no-scrollbar mt-8 mb-20 flex w-full max-w-full flex-col gap-5 overflow-y-auto rounded-2xl bg-white-200 p-4 text-primary shadow-lg sm:p-6 md:mt-10 md:mb-25 md:h-190 md:w-[80%] md:rounded-3xl md:p-10 lg:h-175"
		onSubmit={(event) => {
			event.preventDefault();
		}}
	>
		<BaseInputField
			label="Title"
			onChange={(event) => onTitleChange(event.target.value)}
			placeholder="Title"
		/>
		<TextAreaInput
			label="Description"
			onChange={(event) => onDescriptionChange(event.target.value)}
			placeholder="Add a description"
		/>
		<TagsInputField
			handleTags={handleTags}
			label="Tags"
			placeholder="Enter Tags"
			tags={tags}
		/>
		<InputDropdown
			label="Category"
			onChange={(event) => onCategoryChange(event.currentTarget.innerText)}
			placeholder="Select Category"
			values={categoryOptions}
		/>
		<InputDropdown
			label="Style"
			onChange={(event) => onStyleChange(event.currentTarget.innerText)}
			placeholder="Select Style"
			values={styleOptions}
		/>
		<InputDropdown
			label="Color"
			onChange={(event) => onColorChange(event.currentTarget.innerText)}
			placeholder="Select Color"
			values={colorOptions}
		/>
		<hr className="my-2 w-full border-white-700" />
		<fieldset className="flex w-full flex-col items-stretch justify-center">
			<legend className="mb-2 font-figtree text-[13px] text-black-200">
				Camera settings
			</legend>
			{isDetecting ? (
				<div className="loading loading-spinner loading-xl mt-5 text-primary" />
			) : (
				<CameraSettingsFormContainer
					handleSettings={setSettings}
					settings={settings}
				/>
			)}
		</fieldset>
	</form>
);

export default UploadFormView;
