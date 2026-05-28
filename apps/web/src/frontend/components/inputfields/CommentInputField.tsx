import type React from "react";
import CommentInputFieldContainer, {
	type CommentInputFieldContainerProps,
} from "@/frontend/features/photos/containers/CommentInputFieldContainer";
import type { CommentType } from "@/frontend/types/comment";

export interface CommentInputFieldProps
	extends CommentInputFieldContainerProps {
	id?: string;
	onAddComment: (c: CommentType) => void;
}

const CommentInputField: React.FC<CommentInputFieldProps> = (props) => (
	<CommentInputFieldContainer {...props} />
);

export default CommentInputField;
