"use client";
import { useState } from "react";
import RollPageDropdown from "@/frontend/components/dropdowns/rolls/RollPageDropdown";
import Heading from "@/frontend/components/Heading";
import { EditRollProvider } from "@/frontend/providers/EditRollProvider";
import RollPageMasonryGallerySection from "@/frontend/sections/RollPageMasonryGallerySection/RollPageMasonryGallerySection";
import { useAuthStore } from "@/frontend/stores/useAuthStore";

interface RollPageClientProps {
	id: string;
	name: string;
	ownerId: string;
}

export default function RollPageClient({
	id,
	ownerId,
	name,
}: RollPageClientProps) {
	const { user } = useAuthStore();
	const isOwner = user?.id === ownerId;
	const [rollName, setRollName] = useState(name);
	const handleOnRollUpdate = (roll: SelectedRoll) => {
		setRollName(roll.name);
	};

	return (
		<EditRollProvider onRollUpdate={handleOnRollUpdate}>
			<div className="min-h-screen w-full bg-white">
				<span className="mt-30 flex flex-row items-center justify-center space-x-2">
					<Heading className="text-black">{rollName}</Heading>
					<RollPageDropdown
						isOwner={isOwner}
						name={rollName}
						ownerId={ownerId}
						rollId={id}
					/>
				</span>
				<RollPageMasonryGallerySection isOwner={isOwner} rollId={id} />
			</div>
		</EditRollProvider>
	);
}
