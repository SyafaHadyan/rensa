import { AnimatePresence } from "motion/react";
import type { CSSProperties } from "react";
import Masonry from "react-masonry-css";
import { useResponsiveMasonryColumns } from "@/frontend/components/MasonryGallery/useResponsiveMasonryColumns";
import RollPagePhotoCard from "@/frontend/components/RollPagePhotoCard";
import type { Photo } from "@/frontend/types/photo";
import { cn } from "@/utils/cn";

interface RollPageMasonryGalleryGridProps {
	isOwner: boolean;
	onPhotoRemoved?: (photoId: string) => void;
	photos: Photo[];
	rollId: string;
}

const RollPageMasonryGalleryGrid: React.FC<RollPageMasonryGalleryGridProps> = ({
	photos,
	rollId,
	onPhotoRemoved,
	isOwner,
}) => {
	const { columns, containerRef } = useResponsiveMasonryColumns({
		maxColumns: Math.max(photos.length, 1),
	});
	const masonryWidthClass = photos.length > 5 ? "w-full" : "w-auto";

	return (
		<AnimatePresence mode="popLayout">
			<div className="w-full" ref={containerRef}>
				<Masonry
					breakpointCols={columns}
					className={cn(masonryWidthClass, "my-masonry-grid")}
					columnClassName="my-masonry-grid_column"
					style={
						{
							"--masonry-column-count": columns,
						} as CSSProperties
					}
				>
					{photos.map((photo) => {
						const photoId = photo.photoId.toString();
						return (
							<RollPagePhotoCard
								id={photoId}
								isOwner={isOwner}
								key={photoId}
								onPhotoRemoved={onPhotoRemoved}
								photo={photo}
								rollId={rollId}
							/>
						);
					})}
				</Masonry>
			</div>
		</AnimatePresence>
	);
};

export default RollPageMasonryGalleryGrid;
