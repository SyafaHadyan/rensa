import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type React from "react";
import { useState } from "react";
import BaseInputField from "@/frontend/components/inputfields/BaseInputField";
import NumberInputField from "@/frontend/components/inputfields/NumberInputField";
import type { NormalizedMetadata } from "@/frontend/features/upload/utils/metadata-normalizer";
import { formatLabel } from "@/utils/label-formatter";

export interface CameraSettingsFormViewProps {
	onAddField: (key: string, value: string) => void;
	onNumberChange: (key: string, value: number) => void;
	onRemoveField: (key: string) => void;
	onTextChange: (key: string, value: string) => void;
	settings: NormalizedMetadata;
}

const CameraSettingsFormView: React.FC<CameraSettingsFormViewProps> = ({
	settings,
	onAddField,
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
			<div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
				{Object.entries(settings).map(([key, value]) => {
					if (typeof value === "number") {
						return (
							<div
								className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
								key={key}
							>
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
						<div
							className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
							key={key}
						>
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

			<div className="mt-6 grid w-full grid-cols-1 gap-3 rounded-2xl border border-gray-300 bg-white-100 p-4 lg:grid-cols-[1fr_1fr_auto]">
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
					className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 self-end rounded-full bg-primary px-4 font-figtree text-white transition-opacity hover:opacity-90 lg:h-16 lg:w-16"
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
