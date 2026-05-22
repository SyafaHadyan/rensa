"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type React from "react";
import { Suspense, useState } from "react";
import ProfileBadge from "@/frontend/components/badges/ProfileBadge";
import { ProfileBadgeFallback } from "@/frontend/features/photos/components/fallbacks/PhotoPageFallbacks";
import usePhotoRoll from "@/frontend/features/photos/hooks/use-photo-roll";
import { fetchProfile } from "@/frontend/services/profile.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import type { PhotoMetadata } from "@/frontend/types/photo";
import PhotoInfoCardView from "../components/PhotoInfoCardView";

export interface PhotoInfoCardContainerProps {
	bookmarks?: number;
	children?: React.ReactNode;
	className?: string;
	description?: string;
	id: string;
	initialBookmarks?: number;
	metadata?: PhotoMetadata;
	ownerId: string;
	title?: string;
}

const PhotoInfoCardContainer: React.FC<PhotoInfoCardContainerProps> = ({
	id,
	className,
	title,
	initialBookmarks,
	description,
	metadata,
	ownerId,
}) => {
	const { user } = useAuthStore();
	const {
		selectedRoll,
		isLoading,
		isSaved,
		setSelectedRoll,
		savedToRolls,
		saveToRoll,
		removeFromRoll,
	} = usePhotoRoll(id || null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	return (
		<PhotoInfoCardView
			className={className}
			description={description}
			id={id}
			initialBookmarks={initialBookmarks}
			isDropdownOpen={isDropdownOpen}
			isLoading={isLoading}
			isOwner={user?.id === ownerId}
			isSaved={isSaved}
			metadata={metadata}
			onSaveToggle={isSaved ? removeFromRoll : saveToRoll}
			profileBadge={
				<Suspense fallback={<ProfileBadgeFallback className="mb-5" />}>
					<OwnerProfileBadge ownerId={ownerId} />
				</Suspense>
			}
			savedToRolls={savedToRolls}
			selectedRoll={selectedRoll}
			setIsDropdownOpen={setIsDropdownOpen}
			setSelectedRoll={setSelectedRoll}
			title={title}
			userId={user?.id}
		/>
	);
};

const OwnerProfileBadge: React.FC<{ ownerId: string }> = ({ ownerId }) => {
	const { data: profile } = useSuspenseQuery({
		queryKey: ["profile", ownerId],
		queryFn: () => fetchProfile(ownerId),
		staleTime: 5 * 60 * 1000,
	});

	return (
		<ProfileBadge
			alt={profile?.username}
			avatarUrl={profile?.avatarUrl}
			className="mb-5"
			href={`/profile/${ownerId}`}
			username={profile?.username}
		/>
	);
};

export default PhotoInfoCardContainer;
