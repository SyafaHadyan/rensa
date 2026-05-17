import type { CommentType } from "@/frontend/types/comment";
import { api } from "@/lib/axios-client";
import {
  sendBookmarkedNotification,
  sendCommentedNotification,
} from "./notification.service";

export const bookmarkPhoto = async (
  userId: string | undefined,
  photo_id: string,
  action: "decrement" | "increment",
) => {
  const res = await api.post(`/photos/bookmark/${photo_id}`, {
    action,
    userId,
  });

  if (action === "increment") {
    await sendBookmarkedNotification(userId || "", photo_id);
  }

  return res.data.bookmarks;
};

export const commentPhoto = async (
  newComment: CommentType,
  id: string,
  userId: string | undefined,
) => {
  await api.post(`/photos/${id}/comments`, {
    text: newComment.text,
    userId,
  });
  await sendCommentedNotification(userId || "", id);
};

export const removeUserPhoto = async (photo_id: string) => {
  await api.delete(`/photos/${photo_id}`);
};
