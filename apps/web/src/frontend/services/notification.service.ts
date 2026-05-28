import { api } from "@/lib/axios-client";

export const fetchNotifications = async (
	recipientId: string,
	page = 1,
	limit = 10
) => {
	const res = await api.get("/notifications", {
		params: { recipientId, page, limit },
	});
	return res.data?.notifications ?? [];
};

export const clearUserNotifications = async (userId: string) => {
	const res = await api.delete(`/notifications/${userId}`);
	return res.data.success ?? false;
};

export const markUserNotificationAsRead = async (notificationId: string) => {
	const res = await api.put(`/notifications/${notificationId}/read`);
	return res.data?.success ?? false;
};
