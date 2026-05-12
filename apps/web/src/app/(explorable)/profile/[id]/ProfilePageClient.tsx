"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import AccentButton from "@/frontend/components/buttons/AccentButton";
import ShareButton from "@/frontend/components/buttons/ShareButton";
import ProfileRollFilterDropdown from "@/frontend/components/dropdowns/profile/ProfileRollFilterDropdown";
import Heading from "@/frontend/components/Heading";
import RollList, { type Roll } from "@/frontend/components/lists/RollList";
import { CreateRollProvider } from "@/frontend/providers/CreateRollProvider";
import { EditRollProvider } from "@/frontend/providers/EditRollProvider";
import {
	fetchRollsByUserId,
	type SortOption,
} from "@/frontend/services/roll.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";

interface ProfilePageClientProps {
	profileData: {
		user: { id: string; username: string; avatar?: string };
		rolls: Roll[];
	};
}

export default function ProfilePageClient({
	profileData,
}: ProfilePageClientProps) {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState<SortOption>("latest");
	const isOwner = user?.name === profileData.user?.username;

	const { data: rolls } = useQuery({
		queryKey: ["profileRolls", profileData.user.id, filter],
		queryFn: () => fetchRollsByUserId(profileData.user.id, filter),
		enabled: !!profileData.user?.username,
	});

	const handleRollUpdate = (roll: { rollId: string; name: string }) => {
		queryClient.setQueryData<Roll[]>(
			["profileRolls", profileData.user.id, filter],
			(oldRolls) => {
				if (!oldRolls) {
					return [];
				}
				return oldRolls.map((r) =>
					r.roll_id === roll.rollId ? { ...r, name: roll.name } : r
				);
			}
		);
	};
	const handleRollDelete = (rollId: string) => {
		queryClient.setQueryData<Roll[]>(
			["profileRolls", profileData.user.id, filter],
			(oldRolls) => {
				if (!oldRolls) {
					return [];
				}
				return oldRolls.filter((r) => r.roll_id !== rollId);
			}
		);
	};

	const handleRollCreate = (roll: { roll_id: string; name: string }) => {
		queryClient.setQueryData<Roll[]>(
			["profileRolls", profileData.user.id, filter],
			(oldRolls) => {
				if (!oldRolls) {
					return [];
				}
				return [
					{
						roll_id: roll.roll_id,
						userId: user?.id || "",
						name: roll.name,
						previewPhotos: [],
						createdAt: new Date().toISOString(),
					},
					...oldRolls,
				];
			}
		);
	};
	return (
		<CreateRollProvider onRollCreate={handleRollCreate}>
			<EditRollProvider
				onRollDelete={handleRollDelete}
				onRollUpdate={handleRollUpdate}
			>
				<div className="flex min-h-screen w-full flex-col items-center justify-center bg-white">
					<div className="relative h-32.75 w-32.75 overflow-hidden rounded-full">
						<Image
							alt={profileData.user?.username || "User Avatar"}
							className="h-full w-full object-cover"
							fill
							src={profileData.user?.avatar || "/profile.jpg"}
						/>
					</div>
					<Heading className="mt-4 text-black" size="l">
						@{profileData.user?.username || "User Name"}
					</Heading>
					<div className="mt-4 flex flex-row items-center justify-center gap-4">
						<ShareButton userId={user?.id || ""} />

						{isOwner && <AccentButton>Edit Profile</AccentButton>}
					</div>
					<div className="mt-10 flex w-full flex-col items-start justify-center gap-6 px-30 xl:mt-0">
						<ProfileRollFilterDropdown
							setFilter={(value) => setFilter(value as SortOption)}
						/>
						<RollList isOwner={isOwner} rolls={rolls} />
					</div>
				</div>
			</EditRollProvider>
		</CreateRollProvider>
	);
}
