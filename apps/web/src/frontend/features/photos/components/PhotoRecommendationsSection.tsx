"use client";

import { useEffect } from "react";
import "@/frontend/components/MasonryGallery.css";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import MasonryGalleryGrid from "@/frontend/sections/MasonryGallerySection/MasonryGalleryGrid";
import { fetchExplorePhotos } from "@/frontend/services/photo.service";
import type { FetchPhotosResponse, Photo } from "@/frontend/types/photo";
import { PhotoRecommendationsFallback } from "./fallbacks/PhotoPageFallbacks";

const PhotoRecommendationsSection: React.FC = () => {
	const { ref, inView } = useInView({ threshold: 0.5 });
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery<FetchPhotosResponse>({
			queryKey: ["photo-page-recommendations"],
			queryFn: ({ pageParam }) =>
				fetchExplorePhotos(pageParam as number, undefined, "recent"),
			getNextPageParam: (lastPage) => lastPage.nextPage,
			initialPageParam: 1,
			staleTime: 1000 * 60 * 5,
			gcTime: 1000 * 60 * 30,
		});

	const photos: Photo[] =
		data.pages.flatMap((page) => page.data as Photo[]) ?? [];

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage().catch(() => undefined);
		}
	}, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

	return (
		<div className="flex w-full flex-col items-start justify-start">
			{photos.length > 0 ? (
				<MasonryGalleryGrid photos={photos} />
			) : (
				<PhotoRecommendationsFallback />
			)}
			<div
				aria-live="polite"
				className="flex w-full flex-col items-center justify-center py-20"
				ref={ref}
				role="status"
			>
				{isFetchingNextPage && <PhotoRecommendationsFallback />}
				{!hasNextPage && photos.length === 0 && (
					<p className="text-gray-500">No photos available.</p>
				)}
			</div>
		</div>
	);
};

export default PhotoRecommendationsSection;
