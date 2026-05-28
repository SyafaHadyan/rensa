import type { User } from "@/types/User";

export interface CommentType {
	commentId: string;
	createdAt?: string;
	text: string;
	user: User;
}
