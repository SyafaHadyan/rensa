import { AnimatePresence } from "motion/react";
import Masonry from "react-masonry-css";
import RollPagePhotoCard from "@/frontend/components/RollPagePhotoCard";
import type { Photo } from "@/frontend/types/photo";
import { cn } from "@/utils/cn";

interface RollPageMasonryGalleryGridProps {
	isOwner: boolean;
	onPhotoRemoved?: (photo_id: string) => void;
	photos: Photo[];
	rollId: string;
}

const RollPageMasonryGalleryGrid: React.FC<RollPageMasonryGalleryGridProps> = ({
	photos,
	rollId,
	onPhotoRemoved,
	isOwner,
}) => {
	const getDynamicColumns = (photoCount: number) => {
		if (photoCount <= 1) {
			return 1;
		}
		if (photoCount === 2) {
			return 2;
		}
		if (photoCount === 3) {
			return 3;
		}
		if (photoCount === 4) {
			return 4;
		}
		return 5;
	};

	const breakpointColumnsObj = {
		default: getDynamicColumns(photos.length),
		1920: Math.min(getDynamicColumns(photos.length), 5),
		1600: Math.min(getDynamicColumns(photos.length), 4),
		1280: Math.min(getDynamicColumns(photos.length), 3),
		900: Math.min(getDynamicColumns(photos.length), 2),
		640: 2,
	};
	const masonryWidthClass = photos.length > 5 ? "w-full" : "w-auto";

	return (
		<AnimatePresence mode="popLayout">
			<Masonry
				breakpointCols={breakpointColumnsObj}
				className={cn(masonryWidthClass, "my-masonry-grid")}
				columnClassName="my-masonry-grid_column"
			>
				{photos.map((photo) => {
					const photo_id = photo.photoId.toString();
					return (
						<RollPagePhotoCard
							id={photo_id}
							isOwner={isOwner}
							key={photo_id}
							onPhotoRemoved={onPhotoRemoved}
							photo={photo}
							rollId={rollId}
						/>
					);
				})}
			</Masonry>
		</AnimatePresence>
	);
};

export default RollPageMasonryGalleryGrid;
