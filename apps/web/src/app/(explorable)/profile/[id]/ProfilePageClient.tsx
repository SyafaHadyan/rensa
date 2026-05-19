"use client";

import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import AccentButton from "@/frontend/components/buttons/AccentButton";
import ShareButton from "@/frontend/components/buttons/ShareButton";
import ProfileRollFilterDropdown from "@/frontend/components/dropdowns/profile/ProfileRollFilterDropdown";
import Heading from "@/frontend/components/Heading";
import RollList from "@/frontend/components/lists/RollList";
import ExploreTabs from "@/frontend/components/tabs/ExploreTabs";
import ExploreGalleryView from "@/frontend/features/explore/components/ExploreGalleryView";
import { CreateRollProvider } from "@/frontend/providers/CreateRollProvider";
import { EditRollProvider } from "@/frontend/providers/EditRollProvider";
import { fetchCreatedPhotosByUserId } from "@/frontend/services/photo.service";
import {
	fetchRollsByUserId,
	type SortOption,
} from "@/frontend/services/roll.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import type { FetchPhotosResponse, Photo } from "@/frontend/types/photo";
import type { Roll, SelectedRoll } from "@/frontend/types/roll";

interface ProfilePageClientProps {
	profileData: {
		user: { avatarUrl?: string; id: string; username: string };
		rolls: Roll[];
	};
}

const profileTabs = [
	{ id: "created", label: "Created" },
	{ id: "rolls", label: "Rolls" },
];

export default function ProfilePageClient({
	profileData,
}: ProfilePageClientProps) {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState<SortOption>("latest");
	const [activeTabId, setActiveTabId] = useState("created");
	const { ref, inView } = useInView({ threshold: 0.5 });
	const isOwner = user?.id === profileData.user.id;

	const { data: rolls } = useQuery({
		queryKey: ["profileRolls", profileData.user.id, filter],
		queryFn: () => fetchRollsByUserId(profileData.user.id, filter),
		enabled: !!profileData.user?.username,
		initialData: filter === "latest" ? profileData.rolls : undefined,
	});
	const {
		data: createdPhotosData,
		error: createdPhotosError,
		fetchNextPage,
		hasNextPage,
		isError: isCreatedPhotosError,
		isFetchingNextPage,
		isPending: isCreatedPhotosPending,
	} = useInfiniteQuery<FetchPhotosResponse>({
		queryKey: ["profileCreatedPhotos", profileData.user.id, filter],
		queryFn: ({ pageParam }) =>
			fetchCreatedPhotosByUserId(
				profileData.user.id,
				pageParam as number,
				filter === "oldest" ? "oldest" : "recent"
			),
		enabled: activeTabId === "created",
		getNextPageParam: (lastPage) => lastPage.nextPage,
		initialPageParam: 1,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
	});

	const createdPhotos: Photo[] =
		createdPhotosData?.pages.flatMap((page) => page.data) ?? [];

	useEffect(() => {
		if (
			activeTabId === "created" &&
			inView &&
			hasNextPage &&
			!isFetchingNextPage
		) {
			fetchNextPage().catch(() => undefined);
		}
	}, [activeTabId, fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

	const handleRollUpdate = (roll: SelectedRoll) => {
		queryClient.setQueryData<Roll[]>(
			["profileRolls", profileData.user.id, filter],
			(oldRolls) => {
				if (!oldRolls) {
					return [];
				}
				return oldRolls.map((r) =>
					r.rollId === roll.rollId ? { ...r, name: roll.name } : r
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
				return oldRolls.filter((r) => r.rollId !== rollId);
			}
		);
	};

	const handleRollCreate = (roll: SelectedRoll) => {
		queryClient.setQueryData<Roll[]>(
			["profileRolls", profileData.user.id, filter],
			(oldRolls) => {
				if (!oldRolls) {
					return [];
				}
				return [
					{
						rollId: roll.rollId,
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
				<div className="flex min-h-screen w-full flex-col items-center justify-start bg-white py-16">
					<div className="relative h-32.75 w-32.75 overflow-hidden rounded-full">
						<Image
							alt={profileData.user?.username || "User Avatar"}
							className="h-full w-full object-cover"
							fill
							src={profileData.user?.avatarUrl || "/profile.jpg"}
						/>
					</div>
					<Heading className="mt-4 text-black" size="l">
						@{profileData.user?.username || "User Name"}
					</Heading>
					<div className="mt-4 flex flex-row items-center justify-center gap-4">
						<ShareButton userId={profileData.user.id} />

						{isOwner && <AccentButton>Edit Profile</AccentButton>}
					</div>
					<div className="mt-10 flex w-full flex-col gap-8 px-6 md:px-12 lg:px-30 xl:mt-0">
						<div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between">
							<ExploreTabs
								activeTabId={activeTabId}
								name="profile_tabs"
								onTabChange={setActiveTabId}
								tabs={profileTabs}
							/>
							<div className="flex w-full justify-start md:w-auto md:justify-end">
								<ProfileRollFilterDropdown
									setFilter={(value) => setFilter(value as SortOption)}
								/>
							</div>
						</div>
						{activeTabId === "created" ? (
							<ExploreGalleryView
								allowPhotoPageNavigation
								errorMessage={
									isCreatedPhotosError
										? createdPhotosError instanceof Error
											? createdPhotosError.message
											: "Unknown error"
										: null
								}
								isFetchingNextPage={isFetchingNextPage}
								isPending={isCreatedPhotosPending}
								photos={createdPhotos}
								ref={ref}
							/>
						) : (
							<RollList isOwner={isOwner} rolls={rolls} />
						)}
					</div>
				</div>
			</EditRollProvider>
		</CreateRollProvider>
	);
}
