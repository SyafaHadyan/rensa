import { api } from "@/lib/axios-client";

export const fetchProfile = async (id: string) => {
	const res = await api.get(`/profile/${id}`);
	return res.data.data.user;
};

export const fetchProfileByRollId = async (rollId: string) => {
	const res = await api.get(`/rolls/${rollId}/owner`);
	return res.data.data.userId;
};

export interface UpdateProfilePayload {
	avatar?: File | null;
	userId: string;
	username: string;
}

export const updateProfile = async ({
	avatar,
	userId,
	username,
}: UpdateProfilePayload) => {
	const formData = new FormData();
	formData.append("username", username);
	if (avatar) {
		formData.append("avatar", avatar);
	}

	const res = await api.patch(`/profile/${userId}`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return res.data.data.user;
};
