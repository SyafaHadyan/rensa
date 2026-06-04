"use client";

import type React from "react";
import { useUploadPageController } from "@/frontend/features/upload/hooks/use-upload-page-controller";
import UploadPageView from "../components/UploadPageView";

const UploadPageContainer: React.FC = () => {
	const {
		error,
		fileUpload,
		form,
		exifDetection,
		handleChange,
		handleTagsChange,
		handleCancel,
		onUpload,
		onBack,
		isSubmitting,
	} = useUploadPageController();

	return (
		<UploadPageView
			dropZoneMessage={{
				uploadedFile: fileUpload.uploadedFile,
				isUploading: fileUpload.isUploading,
				message: fileUpload.message,
			}}
			dropZoneProps={{
				fileInputRef: fileUpload.fileInputRef,
				handleDragLeave: fileUpload.handleDragLeave,
				handleDragOver: fileUpload.handleDragOver,
				handleDrop: fileUpload.handleDrop,
				handleFileChange: fileUpload.handleFileChange,
				isDragOver: fileUpload.isDragOver,
				isUploading: fileUpload.isUploading,
			}}
			error={error}
			formProps={{
				handleTags: handleTagsChange,
				isDetecting: exifDetection.isDetecting,
				onChange: handleChange,
				setSettings: exifDetection.setSettings,
				settings: exifDetection.settings,
				tags: form.tags,
			}}
			hasFile={Boolean(fileUpload.uploadedFile)}
			isDetecting={exifDetection.isDetecting}
			isSubmitting={isSubmitting}
			onBack={onBack}
			onCancel={handleCancel}
			onUpload={onUpload}
			photo={fileUpload.photo}
		/>
	);
};

export default UploadPageContainer;
