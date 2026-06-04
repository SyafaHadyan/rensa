import type React from "react";
import UploadDropZoneContainer, {
	type UploadDropZoneContainerProps,
} from "@/frontend/features/upload/containers/UploadDropZoneContainer";
import UploadFormContainer, {
	type UploadFormContainerProps,
} from "@/frontend/features/upload/containers/UploadFormContainer";
import UploadDropZoneStatus from "./UploadDropZoneStatus";
import UploadPreviewPanel from "./UploadPreviewPanel";
import UploadSectionHeader from "./UploadSectionHeader";

interface UploadPageViewProps {
	dropZoneMessage: {
		isUploading: boolean;
		message: string;
		uploadedFile: File | null;
	};
	dropZoneProps: UploadDropZoneContainerProps;
	error: string;
	formProps: UploadFormContainerProps;
	hasFile: boolean;
	isDetecting: boolean;
	isSubmitting: boolean;
	onBack: () => void;
	onCancel: () => void;
	onUpload: () => void;
	photo: string;
}

const UploadPageView: React.FC<UploadPageViewProps> = ({
	hasFile,
	isDetecting,
	isSubmitting,
	onBack,
	onCancel,
	onUpload,
	dropZoneMessage,
	dropZoneProps,
	error,
	photo,
	formProps,
}) => (
	<section className="w-full gap-2 px-5 md:px-10 xl:px-65">
		<UploadSectionHeader
			hasFile={hasFile}
			isDetecting={isDetecting}
			isSubmitting={isSubmitting}
			onBack={onBack}
			onCancel={onCancel}
			onUpload={onUpload}
		/>

		{!hasFile && (
			<h1
				className="text-center font-forum text-[24px] text-primary"
				id="upload-title"
			>
				Show us the scene that stayed with you.
			</h1>
		)}

		{hasFile ? (
			<section aria-labelledby="upload-editing-title" className="pt-15">
				<h1 className="sr-only" id="upload-editing-title">
					Upload details
				</h1>
				{error && (
					<p className="mb-2 text-center font-figtree text-red-500">{error}</p>
				)}
				<div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start">
					<UploadPreviewPanel photo={photo} />
					<UploadFormContainer {...formProps} />
				</div>
			</section>
		) : (
			<UploadDropZoneContainer
				{...dropZoneProps}
				content={<UploadDropZoneStatus {...dropZoneMessage} />}
			/>
		)}
	</section>
);

export default UploadPageView;
