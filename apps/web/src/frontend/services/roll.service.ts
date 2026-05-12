import { api } from "@/lib/axios-client";
import { sendPhotoSavedNotification } from "./notification.service";

export const fetchRollById = async (rollId: string) => {
	const res = await api.get(`/rolls/${rollId}`);
	return res.data.data;
};
export type SortOption = "latest" | "oldest";
export const fetchRollsByUserId = async (userId: string, sort?: SortOption) => {
	const res = await api.get("/rolls", {
		params: {
			userId,
			...(sort ? { sort } : {}),
		},
	});
	return res.data.data.rolls;
};

export const addPhotoToRoll = async (
	actorId: string,
	rollId: string,
	photoId: string
) => {
	await sendPhotoSavedNotification(actorId, photoId);
	return api.post(`/rolls/${rollId}/photos/${photoId}`, {
		rollIds: [rollId],
		photoId,
	});
};

export const removePhotoFromRoll = async (rollId: string, photoId: string) => {
	const result = await api.delete(`/rolls/${rollId}/photos/${photoId}`);
	return result;
};

export const fetchIsSavedToRolls = async (photoId: string) => {
	const res = await api.get("/rolls/is-saved", {
		params: { photoId },
	});
	return res.data.data.rollIds;
};

export const updateRollDetails = async (
	rollId: string,
	name: string,
	description: string
) => {
	const result = await api.patch(`/rolls/${rollId}`, { name, description });
	return result;
};

export const fetchDefaultRoll = async () => {
	const res = await api.get("/rolls/default");
	return res.data.data;
};
