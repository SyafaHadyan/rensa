"use client";

import type React from "react";
import { useEffect } from "react";
import "@/frontend/components/MasonryGallery.css";
import {
	type InfiniteData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { fetchPhotosFromRoll } from "@/frontend/services/photo.service";
import type { FetchPhotosResponse, Photo } from "@/frontend/types/photo";
import RollPageMasonryGalleryGrid from "./RollPageMasonryGalleryGrid";

interface RollPageMasonryGallerySectionProps {
	activeTab?: string;
	isOwner: boolean;
	onPhotoClick?: (photo: Photo | string, index: number) => void;
	rollId: string;
}

const RollPageMasonryGallerySection: React.FC<
	RollPageMasonryGallerySectionProps
> = ({ rollId, isOwner }) => {
	const { ref, inView } = useInView({ threshold: 0.5 });
	const queryClient = useQueryClient();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		error,
	} = useInfiniteQuery<FetchPhotosResponse>({
		queryKey: ["photos", rollId],
		queryFn: ({ pageParam }) => {
			const page = pageParam as number;
			return fetchPhotosFromRoll(rollId, page);
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
	const handlePhotoRemoved = (photoId: string) => {
		queryClient.setQueryData(
			["photos", rollId],
			(oldData: InfiniteData<FetchPhotosResponse> | undefined) => {
				if (!oldData) {
					return oldData;
				}

				return {
					...oldData,
					pages: oldData.pages.map((page: FetchPhotosResponse) => ({
						...page,
						data: page.data.filter(
							(photo) => photo.photoId.toString() !== photoId
						),
					})),
				};
			}
		);
	};
	return (
		<div className="flex flex-col items-center justify-center">
			<RollPageMasonryGalleryGrid
				isOwner={isOwner}
				onPhotoRemoved={handlePhotoRemoved}
				photos={photos}
				rollId={rollId}
			/>

			<div
				aria-live="polite"
				className="flex w-full items-center justify-center py-20"
				ref={ref}
				role="status"
			>
				{status === "pending" && (
					<div className="loading loading-spinner loading-xl text-black" />
				)}
				{isFetchingNextPage && (
					<div className="loading loading-spinner loading-lg text-black" />
				)}
				{status === "success" && !hasNextPage && photos.length === 0 && (
					<p className="text-gray-500">No more images to load</p>
				)}
			</div>
		</div>
	);
};

export default RollPageMasonryGallerySection;
