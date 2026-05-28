import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import { commentPhoto } from "@/frontend/services/photo-post.service";
import { fetchProfile } from "@/frontend/services/profile.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import type { CommentType } from "@/frontend/types/comment";
import CommentInputFieldView from "../components/CommentInputFieldView";

export interface CommentInputFieldContainerProps {
	id?: string;
	onAddComment: (c: CommentType) => void;
}

const CommentInputFieldContainer: React.FC<CommentInputFieldContainerProps> = ({
	id,
	onAddComment,
}) => {
	const { user } = useAuthStore();
	const [comment, setComment] = useState("");
	const { data: profile } = useQuery({
		queryKey: ["profile", user?.id],
		queryFn: () => fetchProfile(user?.id ?? ""),
		enabled: !!user?.id,
		staleTime: 1000 * 60 * 5,
	});

	const handleSubmit = async () => {
		if (!comment.trim()) {
			return;
		}

		const tempId = Math.random().toString(36).slice(2, 9);
		const newComment: CommentType = {
			commentId: tempId,
			text: comment,
			user: {
				userId: user?.id || "unknown",
				username: user?.name || "Anonymous",
				avatarUrl: profile?.avatarUrl || user?.image || undefined,
			},
			createdAt: new Date().toISOString(),
		};

		onAddComment(newComment);
		setComment("");
		await commentPhoto(newComment, id || "");
	};

	return (
		<CommentInputFieldView
			comment={comment}
			onChangeComment={setComment}
			onSubmit={handleSubmit}
			userExists={!!user}
		/>
	);
};

export default CommentInputFieldContainer;
