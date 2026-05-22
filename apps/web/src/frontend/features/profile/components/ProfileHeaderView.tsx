import Image from "next/image";
import type React from "react";
import AccentButton from "@/frontend/components/buttons/AccentButton";
import ShareButton from "@/frontend/components/buttons/ShareButton";
import Heading from "@/frontend/components/Heading";
import type { EditableProfile } from "../types";

interface ProfileHeaderViewProps {
	isOwner: boolean;
	onEditProfile: () => void;
	profile: EditableProfile;
}

const ProfileHeaderView: React.FC<ProfileHeaderViewProps> = ({
	isOwner,
	onEditProfile,
	profile,
}) => (
	<header className="flex flex-col items-center">
		<div className="relative h-32.75 w-32.75 overflow-hidden rounded-full bg-gray-100">
			<Image
				alt={profile.username || "User Avatar"}
				className="h-full w-full object-cover"
				fill
				sizes="131px"
				src={profile.avatarUrl || "/profile.jpg"}
			/>
		</div>
		<Heading className="mt-4 text-black" size="l">
			@{profile.username || "User Name"}
		</Heading>
		<div className="mt-4 flex flex-row items-center justify-center gap-4">
			<ShareButton userId={profile.id} />
			{isOwner && (
				<AccentButton onClick={onEditProfile} type="button">
					Edit Profile
				</AccentButton>
			)}
		</div>
	</header>
);

export default ProfileHeaderView;
