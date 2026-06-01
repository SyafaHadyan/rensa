import { AnimatePresence } from "motion/react";
import { type CSSProperties, useState } from "react";
import Masonry from "react-masonry-css";
import "@/frontend/components/MasonryGallery/MasonryGallery.css";
import { useResponsiveMasonryColumns } from "@/frontend/components/MasonryGallery/useResponsiveMasonryColumns";
import PhotoCard from "@/frontend/components/PhotoCard";
import type { Photo } from "@/frontend/types/photo";

interface ExploreGalleryGridProps {
	allowPhotoPageNavigation: boolean;
	photos: Photo[];
}

const ExploreGalleryGrid: React.FC<ExploreGalleryGridProps> = ({
	allowPhotoPageNavigation,
	photos,
}) => {
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const { columns, containerRef } = useResponsiveMasonryColumns({
		maxColumns: Math.max(photos.length, 1),
	});

	return (
		<AnimatePresence mode="popLayout">
			<div className="w-full" ref={containerRef}>
				<Masonry
					breakpointCols={columns}
					className="my-masonry-grid max-w-auto"
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
							<PhotoCard
								closeAllDropdowns={() => setActiveDropdownId(null)}
								id={allowPhotoPageNavigation ? photoId : null}
								isDropdownOpen={activeDropdownId === photoId}
								key={photoId}
								onToggleDropdown={() =>
									setActiveDropdownId((previousId) =>
										previousId === photoId ? null : photoId
									)
								}
								photo={photo}
							/>
						);
					})}
				</Masonry>
			</div>
		</AnimatePresence>
	);
};

export default ExploreGalleryGrid;
