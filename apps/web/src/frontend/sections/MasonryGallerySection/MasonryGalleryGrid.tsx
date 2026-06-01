import { AnimatePresence } from "motion/react";
import { type CSSProperties, useState } from "react";
import Masonry from "react-masonry-css";
import { useResponsiveMasonryColumns } from "@/frontend/components/MasonryGallery/useResponsiveMasonryColumns";
import PhotoCard from "@/frontend/components/PhotoCard";
import type { Photo } from "@/frontend/types/photo";

interface MasonryGalleryGridProps {
	photos: Photo[];
	photosId?: string[];
}

const MasonryGalleryGrid: React.FC<MasonryGalleryGridProps> = ({ photos }) => {
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleToggleDropdown = (photoId: string | null) => {
		setActiveDropdownId((prev) => (prev === photoId ? null : photoId));
	};

	const { columns, containerRef } = useResponsiveMasonryColumns({
		maxColumns: Math.max(photos.length, 1),
	});

	return (
		<AnimatePresence mode="popLayout">
			<div className="w-full" ref={containerRef}>
				<Masonry
					breakpointCols={columns}
					className={"my-masonry-grid max-w-auto"}
					columnClassName="my-masonry-grid_column"
					style={
						{
							"--masonry-column-count": columns,
						} as CSSProperties
					}
				>
					{photos.map((photo: Photo) => {
						const photoId = photo.photoId.toString();
						return (
							<PhotoCard
								closeAllDropdowns={() => setActiveDropdownId(null)}
								id={photoId}
								isDropdownOpen={activeDropdownId === photoId}
								key={photoId}
								onToggleDropdown={() => handleToggleDropdown(photoId)}
								photo={photo}
							/>
						);
					})}
				</Masonry>
			</div>
		</AnimatePresence>
	);
};

export default MasonryGalleryGrid;
