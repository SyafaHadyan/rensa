import type React from "react";
import BaseInputField from "@/frontend/components/inputfields/BaseInputField";
import InputDropdown from "@/frontend/components/inputfields/InputDropdown";
import TagsInputField from "@/frontend/components/inputfields/TagsInputField";
import TextAreaInput from "@/frontend/components/inputfields/TextAreaInput";
import type { CameraSettings } from "@/frontend/features/upload/configs/cameraDatas";
import { cameraFieldOptions } from "@/frontend/features/upload/configs/cameraFieldDatas";
import CameraSettingsFormContainer from "../containers/CameraSettingsFormContainer";

interface UploadFormViewProps {
	cameraBrandOptions: string[];
	cameraModelOptions: string[];
	categoryOptions: string[];
	colorOptions: string[];
	handleTags: (value: string | string[]) => void;
	isDetecting: boolean;
	onBrandChange: (brand: CameraSettings["Brand"]) => void;
	onCategoryChange: (category: string) => void;
	onColorChange: (color: string) => void;
	onDescriptionChange: (description: string) => void;
	onStyleChange: (style: string) => void;
	onTitleChange: (title: string) => void;
	selectedCamera: CameraSettings["Brand"];
	setSettings: (settings: CameraSettings) => void;
	settings: CameraSettings;
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
	cameraBrandOptions,
	isDetecting,
	onBrandChange,
	selectedCamera,
	cameraModelOptions,
	setSettings,
	settings,
}) => (
	<form
		aria-label="Upload photo details"
		className="no-scrollbar mt-10 mb-25 flex w-[80%] flex-col gap-5 overflow-y-scroll rounded-3xl bg-white-200 p-10 text-primary shadow-lg md:h-190 lg:h-175"
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
		<fieldset className="flex flex-col items-center justify-center">
			<legend className="mb-2 font-figtree text-[13px] text-black-200">
				Camera settings
			</legend>
			{isDetecting ? (
				<div className="loading loading-spinner loading-xl mt-5 text-primary" />
			) : (
				<>
					<InputDropdown
						label="Camera Brand"
						onChange={(event) =>
							onBrandChange(
								event.currentTarget.innerText as CameraSettings["Brand"]
							)
						}
						placeholder={selectedCamera}
						values={cameraBrandOptions}
					/>
					<CameraSettingsFormContainer
						cameraModels={cameraModelOptions}
						fieldOptions={cameraFieldOptions[selectedCamera] ?? {}}
						handleSettings={setSettings}
						settings={settings}
					/>
				</>
			)}
		</fieldset>
	</form>
);

export default UploadFormView;
