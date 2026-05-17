import { api } from "@/lib/axios-client";

export const fetchProfile = async (id: string) => {
	const res = await api.get(`/profile/${id}`);
	return res.data.data.user;
};

export const fetchProfileByRollId = async (rollId: string) => {
	const res = await api.get(`/rolls/${rollId}/owner`);
	return res.data.data.user_id;
};
