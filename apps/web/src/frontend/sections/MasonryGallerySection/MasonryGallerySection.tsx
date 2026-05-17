"use client";

import type React from "react";
import { useEffect } from "react";
import "@/frontend/components/MasonryGallery.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import {
	type FetchPhotosResponse,
	fetchBookmarkedPhotosFromDB,
	fetchPhotosFromDB,
	fetchPhotosFromRoll,
	type Photo,
} from "@/frontend/services/photo.service";
import MasonryGalleryGrid from "./MasonryGalleryGrid";

interface MasonryGallerySectionProps {
	activeTab?: string;
	filters?: string[];
	onPhotoClick?: (photo: Photo | string, index: number) => void;
	rollId?: string;
	type: "explore" | "roll" | "bookmarks";
	useDatabase?: boolean;
	userId?: string;
}

const TAB_POPULAR = "tab2";
const MasonryGallerySection: React.FC<MasonryGallerySectionProps> = ({
	activeTab,
	filters,
	useDatabase = true,
	rollId,
	userId,
	type,
}) => {
	const { ref, inView } = useInView({ threshold: 0.5 });
	const sort = activeTab === TAB_POPULAR ? "popular" : "recent";
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		error,
	} = useInfiniteQuery<FetchPhotosResponse>({
		queryKey: [
			"photos",
			filters,
			activeTab,
			useDatabase ? "db" : "picsum",
			rollId,
			userId,
		],
		queryFn: ({ pageParam }): Promise<FetchPhotosResponse> => {
			const page = pageParam as number;
			if (rollId) {
				return fetchPhotosFromRoll(rollId, page, filters, sort);
			}
			if (useDatabase) {
				return fetchPhotosFromDB(page, filters, sort);
			}
			if (userId) {
				return fetchBookmarkedPhotosFromDB(userId, page);
			}
			return Promise.reject(new Error("Invalid query parameters"));
		},
		getNextPageParam: (lastPage) => lastPage.nextPage,
		initialPageParam: 1,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
	});

	const photos: Photo[] =
		data?.pages.flatMap((page) => page.data as Photo[]) ?? [];

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (status === "error") {
		return (
			<div className="flex items-center justify-center py-20 text-red-500">
				Error loading images:{" "}
				{error instanceof Error ? error.message : "Unknown error"}
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col items-start justify-start">
			<MasonryGalleryGrid photos={photos} />

			<div
				aria-live="polite"
				className="flex w-full flex-col items-center justify-center py-20"
				ref={ref}
				role="status"
			>
				{status === "pending" && (
					<div className="loading loading-spinner loading-xl text-black" />
				)}
				{isFetchingNextPage && (
					<div className="loading loading-spinner loading-lg text-black" />
				)}
				{status === "success" &&
					!hasNextPage &&
					photos.length === 0 &&
					type === "bookmarks" && (
						<p className="text-gray-500">You have no bookmarked photos.</p>
					)}
			</div>
		</div>
	);
};

export default MasonryGallerySection;
