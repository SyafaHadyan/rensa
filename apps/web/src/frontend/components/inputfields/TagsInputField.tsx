import React, { type KeyboardEvent } from "react";
import TagChip from "../chips/TagChip";
import BaseInputField from "./BaseInputField";

interface TagsInputFieldProps {
	handleTags: (value: string | string[]) => void;
	label?: string;
	maxTagLength?: number;
	placeholder?: string;
	tags: string[];
}

const TagsInputField: React.FC<TagsInputFieldProps> = ({
	label,
	tags,
	handleTags,
	maxTagLength = 24,
	placeholder,
}) => {
	const addTag = (tag: string) => {
		const normalizedTag = tag.trim().slice(0, maxTagLength);

		if (!normalizedTag) {
			return;
		}

		handleTags(normalizedTag);
		setInputValue("");
	};
	const removeTag = (tag: string) => {
		const newTags = tags.filter((t) => t !== tag);
		handleTags(newTags);
	};
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			if (inputValue) {
				addTag(inputValue);
			}
		}
	};
	const [inputValue, setInputValue] = React.useState("");
	return (
		<div className="w-full min-w-0">
			<div className="mb-2 grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-2 sm:grid-cols-[repeat(auto-fit,minmax(6.25rem,1fr))]">
				{tags.map((tag) => (
					<TagChip
						className="w-full max-w-full sm:w-full"
						key={tag}
						onClick={() => removeTag(tag)}
						tag={tag}
					/>
				))}
			</div>
			<BaseInputField
				label={label}
				maxLength={maxTagLength}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				type="text"
				value={inputValue}
			/>
		</div>
	);
};

export default TagsInputField;
