import { AnimatePresence } from "motion/react";
import { useState } from "react";
import Masonry from "react-masonry-css";
import PhotoCard from "@/frontend/components/PhotoCard";
import type { Photo } from "@/frontend/types/photo";

interface MasonryGalleryGridProps {
	photos: Photo[];
	photosId?: string[];
}

const MasonryGalleryGrid: React.FC<MasonryGalleryGridProps> = ({ photos }) => {
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleToggleDropdown = (photo_id: string | null) => {
		setActiveDropdownId((prev) => (prev === photo_id ? null : photo_id));
	};

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

	return (
		<AnimatePresence mode="popLayout">
			<Masonry
				breakpointCols={breakpointColumnsObj}
				className={"my-masonry-grid max-w-auto"}
				columnClassName="my-masonry-grid_column"
			>
				{photos.map((photo: Photo) => {
					const photo_id = photo.photoId.toString();
					return (
						<PhotoCard
							closeAllDropdowns={() => setActiveDropdownId(null)}
							id={photo_id}
							isDropdownOpen={activeDropdownId === photo_id}
							key={photo_id}
							onToggleDropdown={() => handleToggleDropdown(photo_id)}
							photo={photo}
						/>
					);
				})}
			</Masonry>
		</AnimatePresence>
	);
};

export default MasonryGalleryGrid;
