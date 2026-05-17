import RollCard from "@/frontend/components/cards/RollCard";
import CreateNewRollCard from "../cards/CreateNewRollCard";

export interface Roll {
	createdAt: string;
	imageUrl?: string;
	name: string;
	photos?: string[];
	previewPhotos?: string[];
	roll_id: string;
	user_id?: string;
	userId?: string;
}

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
						roll.previewPhotos ?? (roll.imageUrl ? [roll.imageUrl] : []);
					return (
						<RollCard
							createdAt={roll.createdAt}
							id={roll.roll_id}
							imageUrls={imageUrls}
							key={roll.roll_id}
							name={roll.name}
							userId={roll.userId ?? roll.user_id}
						/>
					);
				})}
		</div>
	);
}
