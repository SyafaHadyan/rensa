import { useCallback, useEffect, useRef, useState } from "react";
import Comment from "@/frontend/components/Comment";
import Heading from "@/frontend/components/Heading";
import CommentInputField from "@/frontend/components/inputfields/CommentInputField";
import { CommentsListFallback } from "@/frontend/features/photos/components/fallbacks";
import type { CommentType } from "@/frontend/types/comment";
import { api } from "@/lib/axios-client";

interface CommentSectionProps {
	id?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ id }) => {
	const [comments, setComments] = useState<CommentType[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const bottomRef = useRef<HTMLDivElement>(null);

	// -------- Fetch More Comments --------
	const fetchMoreComments = useCallback(async () => {
		if (!(id && hasMore) || loading) {
			return;
		}

		setLoading(true);
		try {
			const res = await api.get(
				`/photos/${id}/comments?offset=${comments.length}`
			);

			setComments((prev) => [...prev, ...res.data.data.comments]);
			setHasMore(res.data.data.hasMore);
		} catch (err) {
			console.error("Error fetching more comments:", err);
		} finally {
			setLoading(false);
		}
	}, [comments.length, hasMore, id, loading]);

	// -------- Reset & Fetch on Photo Change --------
	useEffect(() => {
		if (!id) {
			setComments([]);
			setHasMore(true);
			return;
		}

		let ignore = false;

		async function fetchInitialComments() {
			setLoading(true);
			try {
				const res = await api.get(`/photos/${id}/comments?offset=0`);
				if (ignore) {
					return;
				}

				setComments(res.data.data.comments);
				setHasMore(res.data.data.hasMore);
			} catch (err) {
				if (!ignore) {
					console.error("Error fetching comments:", err);
				}
			} finally {
				if (!ignore) {
					setLoading(false);
				}
			}
		}

		setComments([]);
		setHasMore(true);
		fetchInitialComments();

		return () => {
			ignore = true;
		};
	}, [id]);

	// -------- Scroll to latest comment --------
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
	}, [comments.length]);

	// -------- Add Comment (Optimistic UI) --------
	const handleAddComment = (newComment: CommentType) => {
		setComments((prev) => [...prev, newComment]);
	};

	return (
		<div>
			<Heading className="mb-5" size="m">
				Comments
			</Heading>

			<div className="no-scrollbar mb-5 max-h-90 overflow-y-auto">
				{comments.length > 0 ? (
					comments.map((comment, idx) => (
						<div className="relative" key={comment.commentId}>
							<Comment
								avatarUrl={comment.user.avatarUrl}
								createdAt={comment.createdAt}
								disableBorder={idx === comments.length - 1}
								userId={comment.user.userId}
								username={comment.user.username}
							>
								{comment.text}
							</Comment>
							{hasMore && idx === comments.length - 1 && (
								<div
									className="absolute bottom-0 left-0 flex h-5 w-full cursor-pointer items-center justify-center bg-linear-to-t from-white/95 via-white/60 to-transparent backdrop-blur-[1px]"
									onClick={fetchMoreComments}
								>
									{loading ? (
										<div className="loading loading-spinner scale-75 text-primary" />
									) : (
										<span className="font-figtree text-primary text-xs">
											Load more
										</span>
									)}
								</div>
							)}
						</div>
					))
				) : loading ? (
					<CommentsListFallback />
				) : (
					<p className="font-figtree text-black-200 text-xs">
						No comments yet. Be the first to comment!
					</p>
				)}

				<div ref={bottomRef} />
			</div>

			<CommentInputField id={id} onAddComment={handleAddComment} />
		</div>
	);
};

export default CommentSection;
