import RollPagePhotoCardContainer, {
	type RollPagePhotoCardContainerProps,
} from "@/frontend/features/photos/containers/RollPagePhotoCardContainer";
import type { Photo } from "@/frontend/services/photo.service";

export interface RollPagePhotoCardProps
	extends RollPagePhotoCardContainerProps {
	id: string;
	isOwner: boolean;
	onPhotoRemoved?: (photoId: string) => void;
	photo: Photo;
	rollId: string;
}

const RollPagePhotoCard: React.FC<RollPagePhotoCardProps> = (props) => (
	<RollPagePhotoCardContainer {...props} />
);

export default RollPagePhotoCard;
