"use client";

import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import ProfileRollFilterDropdown from "@/frontend/components/dropdowns/profile/ProfileRollFilterDropdown";
import RollList from "@/frontend/components/lists/RollList";
import ExploreTabs from "@/frontend/components/tabs/ExploreTabs";
import ExploreGalleryView from "@/frontend/features/explore/components/ExploreGalleryView";
import EditProfileModal from "@/frontend/features/profile/components/EditProfileModal";
import ProfileHeaderView from "@/frontend/features/profile/components/ProfileHeaderView";
import { useEditProfile } from "@/frontend/features/profile/hooks/use-edit-profile";
import type { EditableProfile } from "@/frontend/features/profile/types";
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
		user: EditableProfile;
		rolls: Roll[];
	};
}

const profileTabs = [
	{ id: "rolls", label: "Rolls" },
	{ id: "created", label: "Created" },
];

export default function ProfilePageClient({
	profileData,
}: ProfilePageClientProps) {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [profile, setProfile] = useState(profileData.user);
	const [filter, setFilter] = useState<SortOption>("latest");
	const [activeTabId, setActiveTabId] = useState("rolls");
	const { ref, inView } = useInView({ threshold: 0.5 });
	const isOwner = user?.id === profile.id;
	const handleProfileUpdate = useCallback((nextProfile: EditableProfile) => {
		setProfile(nextProfile);
	}, []);
	const editProfile = useEditProfile({
		initialProfile: profile,
		onProfileUpdate: handleProfileUpdate,
	});

	const { data: rolls } = useQuery({
		queryKey: ["profileRolls", profile.id, filter],
		queryFn: () => fetchRollsByUserId(profile.id, filter),
		enabled: !!profile?.username,
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
		queryKey: ["profileCreatedPhotos", profile.id, filter],
		queryFn: ({ pageParam }) =>
			fetchCreatedPhotosByUserId(
				profile.id,
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
			["profileRolls", profile.id, filter],
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
			["profileRolls", profile.id, filter],
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
			["profileRolls", profile.id, filter],
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
					<ProfileHeaderView
						isOwner={isOwner}
						onEditProfile={editProfile.open}
						profile={profile}
					/>
					{editProfile.isOpen && (
						<EditProfileModal
							avatarPreviewUrl={editProfile.avatarPreviewUrl}
							error={editProfile.error}
							isSubmitting={editProfile.isSubmitting}
							onAvatarChange={editProfile.selectAvatar}
							onClose={editProfile.close}
							onSubmit={editProfile.submit}
							onUsernameChange={editProfile.setUsername}
							username={editProfile.username}
						/>
					)}
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
