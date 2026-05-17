import RollCard from "@/frontend/components/cards/RollCard";
import type { Roll } from "@/frontend/types/roll";
import CreateNewRollCard from "../cards/CreateNewRollCard";

interface RollListProps {
	isOwner: boolean;
	rolls: Roll[];
}

export default function RollList({ rolls, isOwner }: RollListProps) {
	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
			{isOwner && <CreateNewRollCard key="create-new-roll" />}
			{rolls?.length > 0 &&
				rolls.map((roll) => {
					const imageUrls =
						roll.previewPhotos ??
						(roll.image_url || roll.imageUrl
							? [roll.image_url ?? roll.imageUrl ?? ""]
							: []);
					return (
						<RollCard
							created_at={roll.created_at}
							id={roll.roll_id}
							imageUrls={imageUrls}
							key={roll.roll_id}
							name={roll.name}
							userId={roll.user_id}
						/>
					);
				})}
		</div>
	);
}
