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
  actor_id: string,
  rollId: string,
  photo_id: string,
) => {
  await sendPhotoSavedNotification(actor_id, photo_id);
  return api.post(`/rolls/${rollId}/photos/${photo_id}`, {
    rollIds: [rollId],
    photo_id,
  });
};

export const removePhotoFromRoll = async (rollId: string, photo_id: string) => {
  const result = await api.delete(`/rolls/${rollId}/photos/${photo_id}`);
  return result;
};

export const fetchIsSavedToRolls = async (photo_id: string) => {
  const res = await api.get("/rolls/is-saved", {
    params: { photo_id },
  });
  return res.data.data.rollIds;
};

export const updateRollDetails = async (
  rollId: string,
  name: string,
  description: string,
) => {
  const result = await api.patch(`/rolls/${rollId}`, { name, description });
  return result;
};

export const fetchDefaultRoll = async () => {
  const res = await api.get("/rolls/default");
  return res.data.data;
};
