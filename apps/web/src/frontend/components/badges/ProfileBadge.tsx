import type React from "react";
import { cn } from "@/utils/cn";
import ProfileIconButton from "../buttons/ProfileIconButton";

interface ProfileBadgeProps {
	alt?: string;
	avatarUrl?: string;
	className?: string;
	href?: string;
	size?: "8" | "10" | "12" | "16" | "20";
	username?: string;
}

const ProfileBadge: React.FC<ProfileBadgeProps> = ({
	alt = "profile picture",
	size = "8",
	className,
	avatarUrl,
	username,
	href,
}) => (
	<span className={cn("inline-flex items-center gap-3", className)}>
		<ProfileIconButton alt={alt} href={href} size={size} src={avatarUrl} />
		<h2 className="font-figtree text-[13px] text-black-200">@{username}</h2>
	</span>
);

export default ProfileBadge;
