"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useExifDetection } from "@/frontend/features/upload/hooks/use-exif-detection";
import { useFileUpload } from "@/frontend/features/upload/hooks/use-file-upload";
import {
	saveOptimisticUpload,
	uploadFormData,
} from "@/frontend/services/upload.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import {
	PHOTO_DESCRIPTION_MAX_LENGTH,
	PHOTO_TAG_MAX_COUNT,
	PHOTO_TAG_MAX_LENGTH,
	PHOTO_TITLE_MAX_LENGTH,
} from "@/shared/configs/content-limits.config";

interface UploadFormState {
	category: string;
	color: string;
	description: string;
	style: string;
	tags: string[];
	title: string;
}

const createInitialFormState = (): UploadFormState => ({
	title: "",
	description: "",
	tags: [],
	category: "",
	style: "",
	color: "",
});

export function useUploadPageController() {
	const fileUpload = useFileUpload();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState<UploadFormState>(createInitialFormState());
	const lastDetectedFileKeyRef = useRef<string | null>(null);

	const exifDetection = useExifDetection(fileUpload.uploadedFile);
	const { detectAndApplyExif, setSettings: setExifSettings } = exifDetection;

	useEffect(() => {
		if (!fileUpload.uploadedFile) {
			lastDetectedFileKeyRef.current = null;
			setExifSettings({});
			return;
		}

		const nextFileKey = `${fileUpload.uploadedFile.name}-${fileUpload.uploadedFile.size}-${fileUpload.uploadedFile.lastModified}`;
		if (lastDetectedFileKeyRef.current === nextFileKey) {
			return;
		}

		lastDetectedFileKeyRef.current = nextFileKey;
		detectAndApplyExif().catch(() => undefined);
	}, [detectAndApplyExif, fileUpload.uploadedFile, setExifSettings]);

	const handleChange = (field: string, value: string | string[]) => {
		const nextValue =
			field === "title" && typeof value === "string"
				? value.slice(0, PHOTO_TITLE_MAX_LENGTH)
				: field === "description" && typeof value === "string"
					? value.slice(0, PHOTO_DESCRIPTION_MAX_LENGTH)
					: value;
		setForm((prev) => ({ ...prev, [field]: nextValue }));
		setError("");
	};

	const handleTagsChange = (value: string | string[]) => {
		if (typeof value === "string") {
			const normalizedTag = value.trim().slice(0, PHOTO_TAG_MAX_LENGTH);
			if (!normalizedTag || form.tags.includes(normalizedTag)) {
				return;
			}
			setForm((prev) => ({
				...prev,
				tags: [...prev.tags, normalizedTag].slice(0, PHOTO_TAG_MAX_COUNT),
			}));
			return;
		}
		setForm((prev) => ({
			...prev,
			tags: value
				.map((tag) => tag.trim().slice(0, PHOTO_TAG_MAX_LENGTH))
				.filter(Boolean)
				.slice(0, PHOTO_TAG_MAX_COUNT),
		}));
	};

	const handleCancel = () => {
		fileUpload.handleCancel();
		setExifSettings({});
		setForm(createInitialFormState());
		setError("");
	};

	const validateForm = (): boolean => {
		if (!form.title.trim()) {
			setError("Title is required!");
			return false;
		}
		if (!form.description.trim()) {
			setError("Description is required!");
			return false;
		}
		if (form.tags.length === 0) {
			setError("At least one tag is required!");
			return false;
		}
		if (!fileUpload.photo) {
			setError("No photo selected!");
			return false;
		}
		return true;
	};

	const handleUpload = async () => {
		setError("");
		if (isSubmitting) {
			return;
		}
		if (!user?.id) {
			setError("You must be logged in to upload.");
			return;
		}
		if (!validateForm()) {
			return;
		}

		const exifForUpload = exifDetection.settings;
		const brandTag =
			typeof exifForUpload.Brand === "string" && exifForUpload.Brand.trim()
				? [exifForUpload.Brand.toLowerCase()]
				: [];
		const tagsWithBrand = [...form.tags, ...brandTag];
		const formData = new FormData();

		if (fileUpload.uploadedFile) {
			formData.append("file", fileUpload.uploadedFile);
		}
		formData.append("userId", user.id);
		formData.append("title", form.title);
		formData.append("description", form.description);
		formData.append("category", form.category.toLowerCase());
		formData.append("style", form.style.toLowerCase());
		formData.append("color", form.color.toLowerCase());
		formData.append("tags", JSON.stringify(tagsWithBrand));
		formData.append("exif", JSON.stringify(exifForUpload));

		try {
			setIsSubmitting(true);
			const uploadedPhoto = await uploadFormData(formData);
			saveOptimisticUpload(uploadedPhoto);
			router.push(`/photo/${uploadedPhoto.photoId}`);
		} catch (uploadError) {
			console.error("Upload failed:", uploadError);
			setError("Upload failed. Please try again.");
			setIsSubmitting(false);
		}
	};

	const onUpload = () => {
		handleUpload().catch(() => undefined);
	};

	return {
		error,
		fileUpload,
		form,
		isSubmitting,
		exifDetection,
		handleChange,
		handleTagsChange,
		handleCancel,
		onUpload,
		onBack: () => router.back(),
	};
}
