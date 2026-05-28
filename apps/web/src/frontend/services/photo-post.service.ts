import type { CommentType } from "@/frontend/types/comment";
import { api } from "@/lib/axios-client";

export interface BookmarkStatusResponse {
	bookmarkCount: number;
	isBookmarked: boolean;
}

export const bookmarkPhoto = async (
	photoId: string,
	action: "add" | "remove"
): Promise<BookmarkStatusResponse> => {
	const res =
		action === "add"
			? await api.put("/photos/bookmark", null, {
					params: { photoId },
				})
			: await api.delete("/photos/bookmark", {
					params: { photoId },
				});

	return res.data.data;
};

export const commentPhoto = async (newComment: CommentType, id: string) => {
	await api.post(`/photos/${id}/comments`, {
		text: newComment.text,
	});
};

export const removeUserPhoto = async (photoId: string) => {
	await api.delete(`/photos/${photoId}`);
};
