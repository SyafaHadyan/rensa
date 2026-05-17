"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/frontend/providers/ToastProvider";
import { fetchPhotoBookmarkStatus } from "@/frontend/services/photo.service";
import { bookmarkPhoto } from "@/frontend/services/photo-post.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";

interface UseBookmarkToggleParams {
	initialBookmarks?: number;
	photoId: string;
}

export function useBookmarkToggle({
	photoId,
	initialBookmarks = 0,
}: UseBookmarkToggleParams) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { showToast } = useToast();
	const { user } = useAuthStore();
	const [bookmarks, setBookmarks] = useState(initialBookmarks);
	const bookmarkQueryKey = ["isPhotoBookmarked", user?.id, photoId] as const;

	const { data: bookmarkStatus } = useQuery({
		queryKey: bookmarkQueryKey,
		queryFn: () => {
			if (!user?.id) {
				return {
					bookmarkCount: initialBookmarks,
					isBookmarked: false,
				};
			}
			return fetchPhotoBookmarkStatus(photoId);
		},
		enabled: !!user?.id,
	});
	const isBookmarked = bookmarkStatus?.isBookmarked ?? false;

	useEffect(() => {
		if (bookmarkStatus) {
			setBookmarks(bookmarkStatus.bookmarkCount);
		}
	}, [bookmarkStatus]);

	const toggleBookmarkMutation = useMutation({
		mutationFn: ({
			action,
		}: {
			action: "add" | "remove";
			nextBookmarked: boolean;
		}) => bookmarkPhoto(photoId, action),
		onMutate: async ({ nextBookmarked }) => {
			await queryClient.cancelQueries({ queryKey: bookmarkQueryKey });
			const previousStatus = queryClient.getQueryData<{
				bookmarkCount: number;
				isBookmarked: boolean;
			}>(bookmarkQueryKey);
			const previousBookmarks = bookmarks;

			queryClient.setQueryData(bookmarkQueryKey, {
				bookmarkCount: nextBookmarked
					? previousBookmarks + 1
					: Math.max(previousBookmarks - 1, 0),
				isBookmarked: nextBookmarked,
			});
			setBookmarks((prev) =>
				nextBookmarked ? prev + 1 : Math.max(prev - 1, 0)
			);

			return { previousBookmarks, previousStatus };
		},
		onError: (_error, _variables, context) => {
			if (context) {
				queryClient.setQueryData(bookmarkQueryKey, context.previousStatus);
				setBookmarks(context.previousBookmarks);
			}
			showToast("Failed to update bookmark", "error");
		},
		onSuccess: (status) => {
			queryClient.setQueryData(bookmarkQueryKey, status);
			setBookmarks(status.bookmarkCount);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
		},
	});

	const handleToggle = () => {
		if (!user?.id) {
			router.push("/login");
			return;
		}

		const nextBookmarked = !isBookmarked;
		toggleBookmarkMutation.mutate({
			action: nextBookmarked ? "add" : "remove",
			nextBookmarked,
		});
	};

	return {
		bookmarks,
		handleToggle,
		isBookmarked,
	};
}
