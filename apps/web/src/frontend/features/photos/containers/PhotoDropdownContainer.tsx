import type React from "react";
import { useEditPhoto } from "@/frontend/providers/EditPhotoProvider";
import PhotoDropdownView from "../components/PhotoDropdownView";

export interface PhotoDropdownContainerProps {
	isOwner: boolean;
	photoId: string;
}

const PhotoDropdownContainer: React.FC<PhotoDropdownContainerProps> = ({
	photoId,
	isOwner,
}) => {
	const { openEditor, handleShare } = useEditPhoto();

	return (
		<PhotoDropdownView
			isOwner={isOwner}
			onDelete={() => openEditor({ photoId, isOwner })}
			onShare={() => handleShare(photoId)}
		/>
	);
};

export default PhotoDropdownContainer;
