"use client";

import { useEffect } from "react";
import "@/frontend/components/MasonryGallery.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { fetchExplorePhotos } from "@/frontend/services/photo.service";
import type {
	ExplorePhotoSource,
	FetchPhotosResponse,
	Photo,
} from "@/frontend/types/photo";
import ExploreGalleryView from "../components/ExploreGalleryView";

interface ExploreGalleryContainerProps {
	filters: string[];
	sort: "popular" | "recent";
}

const ExploreGalleryContainer: React.FC<ExploreGalleryContainerProps> = ({
	filters,
	sort,
}) => {
	const { ref, inView } = useInView({ threshold: 0.5 });
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending,
		isError,
		error,
	} = useInfiniteQuery<FetchPhotosResponse>({
		queryKey: ["explore-photos", filters, sort],
		queryFn: ({ pageParam }) => {
			const page = pageParam as number;
			const result = fetchExplorePhotos(page, filters, sort);
			return result;
		},
		getNextPageParam: (lastPage) => lastPage.nextPage,
		initialPageParam: 1,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
	});

	const photos: Photo[] =
		data?.pages.flatMap((page) => page.data as Photo[]) ?? [];
	const source: ExplorePhotoSource = data?.pages?.[0]?.source ?? "db";

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage().catch(() => undefined);
		}
	}, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

	return (
		<ExploreGalleryView
			allowPhotoPageNavigation={source === "db"}
			errorMessage={
				isError
					? error instanceof Error
						? error.message
						: "Unknown error"
					: null
			}
			isFetchingNextPage={isFetchingNextPage}
			isPending={isPending}
			photos={photos}
			ref={ref}
		/>
	);
};

export default ExploreGalleryContainer;
