import { api } from "@/lib/axios-client";
import { fetchPhotoOwnerByPhotoId } from "./photo.service";

export type PhotoNotificationType =
  | "photo-bookmarked"
  | "photo-commented"
  | "photo-saved";

export const fetchNotifications = async (
  recipient_id: string,
  page = 1,
  limit = 10,
) => {
  const res = await api.get("/notifications", {
    params: { recipient_id, page, limit },
  });
  return res.data?.data ?? [];
};

const sendPhotoNotification = async (
  actor_id: string,
  photo_id: string,
  type: PhotoNotificationType,
) => {
  const recipient_id = await fetchPhotoOwnerByPhotoId(photo_id);

  if (!recipient_id || recipient_id === actor_id) {
    return null;
  }

  const res = await api.post("/notifications", {
    actor_id,
    recipient_id,
    photo_id,
    type,
  });

  return res.data;
};

export const sendPhotoSavedNotification = (
  actor_id: string,
  photo_id: string,
) => sendPhotoNotification(actor_id, photo_id, "photo-saved");

export const sendBookmarkedNotification = (
  actor_id: string,
  photo_id: string,
) => sendPhotoNotification(actor_id, photo_id, "photo-bookmarked");

export const sendCommentedNotification = (actor_id: string, photo_id: string) =>
  sendPhotoNotification(actor_id, photo_id, "photo-commented");

export const clearUserNotifications = async (userId: string) => {
  const res = await api.delete(`/notifications/${userId}`);
  return res.data.success ?? false;
};

export const markUserNotificationAsRead = async (notificationId: string) => {
  const res = await api.put(`/notifications/${notificationId}/read`);
  return res.data?.success ?? false;
};
