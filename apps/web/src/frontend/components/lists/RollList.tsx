import RollCard from "@/frontend/components/cards/RollCard";
import type { Roll } from "@/frontend/types/roll";
import CreateNewRollCard from "../cards/CreateNewRollCard";

interface RollListProps {
	isOwner: boolean;
	rolls: Roll[];
}

export default function RollList({ rolls, isOwner }: RollListProps) {
	return (
		<div className="grid w-full grid-cols-2 items-start gap-x-4 gap-y-6 md:flex md:flex-wrap">
			{isOwner && <CreateNewRollCard key="create-new-roll" />}
			{rolls?.length > 0 &&
				rolls.map((roll) => {
					const imageUrls =
						roll.imagePreviewUrls ??
						roll.previewPhotos ??
						(roll.imageUrl ? [roll.imageUrl] : []);
					return (
						<RollCard
							createdAt={roll.createdAt}
							id={roll.rollId}
							imageUrls={imageUrls}
							key={roll.rollId}
							name={roll.name}
							userId={roll.userId}
						/>
					);
				})}
		</div>
	);
}
