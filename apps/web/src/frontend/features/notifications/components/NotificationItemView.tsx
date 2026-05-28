"use client";

import type React from "react";
import DropdownItem from "@/frontend/components/dropdowns/DropdownItem";
import ProfileAvatar from "@/frontend/components/ProfileAvatar";
import Text from "@/frontend/components/Text";
import type { NotificationData } from "@/frontend/types/notification";
import { cn } from "@/utils/cn";

interface NotificationItemViewProps {
	isLast: boolean;
	itemRef: React.Ref<HTMLLIElement>;
	notification: NotificationData;
}

const NotificationItemView = ({
	notification,
	isLast,
	itemRef,
}: NotificationItemViewProps) => (
	<DropdownItem
		className={cn("w-full", isLast && "rounded-b-2xl")}
		href={`/photo/${notification.photoId}`}
		key={notification.notificationId}
		ref={itemRef}
	>
		<ProfileAvatar
			alt="profile"
			className="mr-3 inline-flex h-12 w-12 rounded-2xl"
			sizes="48px"
			src={notification.actor.avatarUrl}
		/>
		<Text className="inline" size="xs">
			<span className="inline font-bold">{notification.actor.username}</span>{" "}
			{notification.type === "photo-saved"
				? "saved your photo."
				: notification.type === "photo-commented"
					? "commented on your photo."
					: "bookmarked your photo."}
		</Text>
	</DropdownItem>
);

export default NotificationItemView;
