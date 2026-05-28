import Heading from "@/frontend/components/Heading";
import PhotoInfoCardFallback from "./PhotoInfoCardFallback";
import PhotoPreviewFallback from "./PhotoPreviewFallback";
import PhotoRecommendationsFallback from "./PhotoRecommendationsFallback";

const PhotoPageFallback: React.FC = () => (
	<div className="flex w-full flex-col items-center justify-center gap-10 bg-white-500 px-6.25 md:px-7.5 lg:px-17.5 xl:px-22.5 2xl:px-65">
		<div className="flex w-full flex-col items-start justify-center gap-16.75 pt-35 lg:flex-row">
			<div className="flex w-full flex-col items-center justify-center gap-2 md:items-start md:justify-start xl:w-auto">
				<PhotoPreviewFallback />
			</div>
			<PhotoInfoCardFallback />
		</div>
		<Heading className="text-primary" size="s">
			We thought you will like this
		</Heading>
		<PhotoRecommendationsFallback />
	</div>
);

export default PhotoPageFallback;
