import type { UploadedPhoto } from "@/frontend/types/photo";
import { api } from "@/lib/axios-client";

const optimisticUploadKey = (photoId: string) => `rensa:upload:${photoId}`;

export const uploadFormData = async (
	formData: FormData
): Promise<UploadedPhoto> => {
	const res = await api.post("/photos/upload", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return res.data.data;
};

export const saveOptimisticUpload = (photo: UploadedPhoto) => {
	if (typeof window === "undefined") {
		return;
	}

	window.sessionStorage.setItem(
		optimisticUploadKey(photo.photoId),
		JSON.stringify(photo)
	);
};

export const getOptimisticUpload = (photoId: string): UploadedPhoto | null => {
	if (typeof window === "undefined") {
		return null;
	}

	const raw = window.sessionStorage.getItem(optimisticUploadKey(photoId));
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as UploadedPhoto;
	} catch {
		window.sessionStorage.removeItem(optimisticUploadKey(photoId));
		return null;
	}
};

export const clearOptimisticUpload = (photoId: string) => {
	if (typeof window === "undefined") {
		return;
	}

	window.sessionStorage.removeItem(optimisticUploadKey(photoId));
};
