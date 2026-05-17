import type { InViewHookResponse } from "react-intersection-observer";
import type { Photo } from "@/frontend/services/photo.service";
import ExploreGalleryGrid from "./ExploreGalleryGrid";

interface ExploreGalleryViewProps {
	allowPhotoPageNavigation: boolean;
	errorMessage: string | null;
	isFetchingNextPage: boolean;
	isPending: boolean;
	photos: Photo[];
	ref: InViewHookResponse["ref"];
}

const ExploreGalleryView: React.FC<ExploreGalleryViewProps> = ({
	allowPhotoPageNavigation,
	errorMessage,
	isFetchingNextPage,
	isPending,
	photos,
	ref,
}) => {
	if (errorMessage) {
		return (
			<section
				aria-live="polite"
				className="w-full py-20 text-red-500"
				role="status"
			>
				<p className="text-center">Error loading images: {errorMessage}</p>
			</section>
		);
	}

	return (
		<section
			aria-label="Explore photo gallery"
			className="flex w-full flex-col items-start justify-start"
		>
			<ExploreGalleryGrid
				allowPhotoPageNavigation={allowPhotoPageNavigation}
				photos={photos}
			/>
			<div
				aria-live="polite"
				className="flex w-full flex-col items-center justify-center py-20"
				ref={ref}
				role="status"
			>
				{isPending && (
					<div className="loading loading-spinner loading-xl text-black" />
				)}
				{isFetchingNextPage && (
					<div className="loading loading-spinner loading-lg text-black" />
				)}
				{!(isPending || isFetchingNextPage) && photos.length === 0 && (
					<p className="text-gray-500">No photos available.</p>
				)}
			</div>
		</section>
	);
};

export default ExploreGalleryView;
