"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PhotoPageFallback } from "@/frontend/features/photos/components/fallbacks";
import PhotoPageView from "@/frontend/features/photos/components/PhotoPageView";
import { fetchPhotoById } from "@/frontend/services/photo.service";
import type { Photo } from "@/frontend/types/photo";

interface PhotoPageContainerProps {
	photoId: string;
}

const PhotoPageContainer: React.FC<PhotoPageContainerProps> = ({ photoId }) => {
	const router = useRouter();
	const {
		data: photo,
		isError,
		isPending,
	} = useQuery<Photo>({
		queryKey: ["photo", photoId],
		queryFn: () => fetchPhotoById(photoId),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
	});

	useEffect(() => {
		if (isError) {
			router.replace("/not-found");
		}
	}, [isError, router]);

	if (isPending || isError) {
		return <PhotoPageFallback />;
	}

	return <PhotoPageView photo={photo} photoId={photoId} />;
};

export default PhotoPageContainer;
