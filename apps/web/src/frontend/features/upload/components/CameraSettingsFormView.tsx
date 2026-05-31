import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type React from "react";
import { useState } from "react";
import { SearchDropdown } from "@/frontend/components/dropdowns/SearchDropdown";
import BaseInputField from "@/frontend/components/inputfields/BaseInputField";
import InputDropdown from "@/frontend/components/inputfields/InputDropdown";
import NumberInputField from "@/frontend/components/inputfields/NumberInputField";
import type { CameraSettings } from "@/frontend/features/upload/configs/cameraDatas";
import { formatLabel } from "@/utils/label-formatter";

export interface CameraSettingsFormViewProps {
	cameraModels: string[];
	fieldOptions: Record<string, string[]>;
	onAddField: (key: string, value: string) => void;
	onModelChange: (model: string) => void;
	onNumberChange: (key: string, value: number) => void;
	onOptionChange: (key: string, value: string) => void;
	onRemoveField: (key: string) => void;
	onTextChange: (key: string, value: string) => void;
	settings: CameraSettings;
}

const CameraSettingsFormView: React.FC<CameraSettingsFormViewProps> = ({
	settings,
	cameraModels,
	fieldOptions,
	onAddField,
	onModelChange,
	onOptionChange,
	onNumberChange,
	onRemoveField,
	onTextChange,
}) => {
	const [newFieldKey, setNewFieldKey] = useState("");
	const [newFieldValue, setNewFieldValue] = useState("");

	const handleAddField = () => {
		onAddField(newFieldKey, newFieldValue);
		setNewFieldKey("");
		setNewFieldValue("");
	};

	const renderRemoveButton = (key: string) => (
		<button
			aria-label={`Remove ${formatLabel(key)}`}
			className="mb-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-black-200 transition-colors hover:bg-red-50 hover:text-red-700"
			onClick={() => onRemoveField(key)}
			title={`Remove ${formatLabel(key)}`}
			type="button"
		>
			<TrashIcon size={18} />
		</button>
	);

	return (
		<section aria-label="Detailed camera settings" className="mt-4 w-full">
			<div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
				{Object.entries(settings).map(([key, value]) => {
					const options = fieldOptions[key];

					if (key === "Brand") {
						return null;
					}

					if (key === "Model") {
						return (
							<div className="flex items-end gap-2" key={key}>
								<div className="min-w-0 flex-1">
									<SearchDropdown
										cameraModels={cameraModels}
										label={formatLabel(key)}
										onSelect={onModelChange}
										value={(settings.Model as string) ?? ""}
									/>
								</div>
								{renderRemoveButton(key)}
							</div>
						);
					}

					if (options && options.length > 0) {
						return (
							<div className="flex items-end gap-2" key={key}>
								<div className="min-w-0 flex-1">
									<InputDropdown
										initialValue={String(value ?? "")}
										label={formatLabel(key)}
										onChange={(event) => {
											onOptionChange(key, event.currentTarget.innerText);
										}}
										placeholder={`Select ${formatLabel(key)}`}
										values={options}
									/>
								</div>
								{renderRemoveButton(key)}
							</div>
						);
					}

					if (typeof value === "number") {
						return (
							<div className="flex items-end gap-2" key={key}>
								<div className="min-w-0 flex-1">
									<NumberInputField
										label={formatLabel(key)}
										onChange={(event) => {
											onNumberChange(key, Number(event.target.value));
										}}
										placeholder={`Enter ${formatLabel(key)}`}
										type="number"
										value={value}
									/>
								</div>
								{renderRemoveButton(key)}
							</div>
						);
					}

					return (
						<div className="flex items-end gap-2" key={key}>
							<div className="min-w-0 flex-1">
								<BaseInputField
									label={formatLabel(key)}
									onChange={(event) => {
										onTextChange(key, event.target.value);
									}}
									placeholder={`Enter ${formatLabel(key)}`}
									value={String(value ?? "")}
								/>
							</div>
							{renderRemoveButton(key)}
						</div>
					);
				})}
			</div>

			<div className="mt-6 grid w-full grid-cols-1 gap-3 rounded-2xl border border-gray-300 bg-white-100 p-4 md:grid-cols-[1fr_1fr_auto]">
				<BaseInputField
					label="Field"
					onChange={(event) => setNewFieldKey(event.target.value)}
					placeholder="Lens"
					value={newFieldKey}
				/>
				<BaseInputField
					label="Value"
					onChange={(event) => setNewFieldValue(event.target.value)}
					placeholder="23mm f/2"
					value={newFieldValue}
				/>
				<button
					aria-label="Add metadata field"
					className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 self-end rounded-full bg-primary px-4 font-figtree text-white transition-opacity hover:opacity-90 md:h-16 md:w-16"
					onClick={handleAddField}
					title="Add metadata field"
					type="button"
				>
					<PlusIcon size={20} weight="bold" />
				</button>
			</div>
		</section>
	);
};

export default CameraSettingsFormView;
