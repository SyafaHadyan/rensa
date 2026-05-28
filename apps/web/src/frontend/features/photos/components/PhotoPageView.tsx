import { Suspense } from "react";
import PhotoInfoCard from "@/frontend/components/cards/PhotoInfoCard";
import Heading from "@/frontend/components/Heading";
import ImagePreview from "@/frontend/components/ImagePreview";
import { PhotoRecommendationsFallback } from "@/frontend/features/photos/components/fallbacks";
import PhotoRecommendationsSection from "@/frontend/features/photos/components/PhotoRecommendationsSection";
import type { Photo } from "@/frontend/types/photo";

interface PhotoPageViewProps {
	photo: Photo;
	photoId: string;
}

const PhotoPageView: React.FC<PhotoPageViewProps> = ({ photo, photoId }) => (
	<div className="flex w-full flex-col items-center justify-center gap-10 bg-white-500 px-6.25 md:px-7.5 lg:px-17.5 xl:px-22.5 2xl:px-65">
		<div className="flex flex-col items-start justify-center gap-16.75 pt-35 lg:flex-row">
			<div className="flex flex-col items-center justify-center gap-2 md:items-start md:justify-start">
				<ImagePreview
					alt={photo.title ?? "Photo"}
					height={photo.metadata?.height}
					src={photo.url ?? ""}
					width={photo.metadata?.width}
				/>
			</div>
			<PhotoInfoCard
				description={photo.description}
				id={photoId}
				initialBookmarks={photo.bookmarks}
				metadata={photo.metadata}
				ownerId={photo.user.userId}
				title={photo.title}
			/>
		</div>
		<Heading className="text-primary" size="s">
			We thought you will like this
		</Heading>
		<Suspense fallback={<PhotoRecommendationsFallback />}>
			<PhotoRecommendationsSection />
		</Suspense>
	</div>
);

export default PhotoPageView;
