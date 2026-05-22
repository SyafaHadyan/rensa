import { UserIcon } from "@phosphor-icons/react";
import Image from "next/image";
import type React from "react";
import { cn } from "@/utils/cn";

interface ProfileAvatarProps {
	alt: string;
	className?: string;
	iconClassName?: string;
	sizes?: string;
	src?: string | null;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
	alt,
	className,
	iconClassName,
	sizes,
	src,
}) => (
	<div
		className={cn(
			"relative flex aspect-square items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-500",
			className
		)}
	>
		{src ? (
			<Image
				alt={alt}
				className="h-full w-full object-cover"
				fill
				sizes={sizes}
				src={src}
			/>
		) : (
			<UserIcon
				aria-hidden="true"
				className={cn("h-1/2 w-1/2", iconClassName)}
				weight="regular"
			/>
		)}
	</div>
);

export default ProfileAvatar;
