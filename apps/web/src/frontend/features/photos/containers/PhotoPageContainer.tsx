"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PhotoPageFallback } from "@/frontend/features/photos/components/fallbacks";
import PendingUploadPhotoView from "@/frontend/features/photos/components/PendingUploadPhotoView";
import PhotoPageView from "@/frontend/features/photos/components/PhotoPageView";
import {
	fetchPhotoById,
	fetchPhotoUploadStatus,
} from "@/frontend/services/photo.service";
import {
	clearOptimisticUpload,
	getOptimisticUpload,
} from "@/frontend/services/upload.service";
import type {
	Photo,
	PhotoUploadStatus,
	UploadedPhoto,
} from "@/frontend/types/photo";

interface PhotoPageContainerProps {
	photoId: string;
}

const PhotoPageContainer: React.FC<PhotoPageContainerProps> = ({ photoId }) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [optimisticPhoto, setOptimisticPhoto] = useState<UploadedPhoto | null>(
		() => getOptimisticUpload(photoId)
	);
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
	const { data: uploadStatus, isError: isUploadStatusError } =
		useQuery<PhotoUploadStatus>({
			queryKey: ["photo-upload-status", photoId],
			queryFn: () => fetchPhotoUploadStatus(photoId),
			refetchInterval: (query) =>
				query.state.data?.processingStatus === "pending" ? 2500 : false,
			retry: false,
		});

	useEffect(() => {
		setOptimisticPhoto(getOptimisticUpload(photoId));
	}, [photoId]);

	useEffect(() => {
		if (isError && isUploadStatusError && !optimisticPhoto) {
			router.replace("/not-found");
		}
	}, [isError, isUploadStatusError, optimisticPhoto, router]);

	useEffect(() => {
		if (uploadStatus?.processingStatus !== "ready") {
			return;
		}

		clearOptimisticUpload(photoId);
		setOptimisticPhoto(null);
		queryClient.invalidateQueries({ queryKey: ["photo", photoId] });
	}, [photoId, queryClient, uploadStatus?.processingStatus]);

	if (
		uploadStatus?.processingStatus === "pending" ||
		uploadStatus?.processingStatus === "failed" ||
		optimisticPhoto?.processingStatus === "pending"
	) {
		const pendingViewStatus =
			uploadStatus?.processingStatus === "failed" ? "failed" : "pending";

		return (
			<PendingUploadPhotoView
				photo={optimisticPhoto}
				photoId={photoId}
				processingError={uploadStatus?.processingError}
				status={pendingViewStatus}
			/>
		);
	}

	if (isPending || isError) {
		return <PhotoPageFallback />;
	}

	return <PhotoPageView photo={photo} photoId={photoId} />;
};

export default PhotoPageContainer;
