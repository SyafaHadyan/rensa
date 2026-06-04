import { ArrowLeftIcon } from "@phosphor-icons/react";
import type React from "react";
import PrimaryButton from "@/frontend/components/buttons/PrimaryButton";
import TertiaryButton from "@/frontend/components/buttons/TertiaryButton";

interface UploadSectionHeaderProps {
	hasFile: boolean;
	isDetecting: boolean;
	isSubmitting: boolean;
	onBack: () => void;
	onCancel: () => void;
	onUpload: () => void;
}

const UploadSectionHeader: React.FC<UploadSectionHeaderProps> = ({
	hasFile,
	isDetecting,
	isSubmitting,
	onBack,
	onCancel,
	onUpload,
}) => {
	if (hasFile) {
		return (
			<header className="flex items-center justify-between py-10 lg:mb-10">
				<TertiaryButton onClick={onCancel} type="button">
					Cancel
				</TertiaryButton>
				<PrimaryButton
					disabled={isDetecting || isSubmitting}
					onClick={onUpload}
					type="button"
				>
					{isSubmitting ? "Preparing..." : "Upload"}
				</PrimaryButton>
			</header>
		);
	}

	return (
		<header className="mb-10 flex items-end justify-between">
			<button
				aria-label="Go back"
				className="cursor-pointer text-primary transition-colors duration-300 hover:text-gray-500"
				onClick={onBack}
				type="button"
			>
				<ArrowLeftIcon size={32} />
			</button>
		</header>
	);
};

export default UploadSectionHeader;
