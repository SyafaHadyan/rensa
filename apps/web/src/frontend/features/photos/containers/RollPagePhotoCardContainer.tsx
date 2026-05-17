import type React from "react";
import { useState } from "react";
import { useToast } from "@/frontend/providers/ToastProvider";
import type { Photo } from "@/frontend/services/photo.service";
import { removePhotoFromRoll } from "@/frontend/services/roll.service";
import RollPagePhotoCardView from "../components/RollPagePhotoCardView";

export interface RollPagePhotoCardContainerProps {
	id: string;
	isOwner: boolean;
	onPhotoRemoved?: (photoId: string) => void;
	photo: Photo;
	rollId: string;
}

const RollPagePhotoCardContainer: React.FC<RollPagePhotoCardContainerProps> = ({
	id,
	photo,
	rollId,
	onPhotoRemoved,
	isOwner,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const { showToast } = useToast();

	const handleUnsaveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			setIsLoading(true);
			await removePhotoFromRoll(rollId, id);
			onPhotoRemoved?.(id);
			showToast("Photo removed from roll successfully", "success");
		} catch (error) {
			console.error("Failed to remove photo from roll:", error);
			showToast("Failed to remove photo from roll", "error");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<RollPagePhotoCardView
			handleUnsaveClick={handleUnsaveClick}
			id={id}
			isLoading={isLoading}
			isOwner={isOwner}
			photo={photo}
		/>
	);
};

export default RollPagePhotoCardContainer;
