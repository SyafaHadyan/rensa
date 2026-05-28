"use client";

import { BellIcon } from "@phosphor-icons/react";
import type React from "react";
import IconDropdown from "@/frontend/components/dropdowns/IconDropdown";
import Heading from "@/frontend/components/Heading";
import Text from "@/frontend/components/Text";

interface NotificationDropdownViewProps {
	children: React.ReactNode;
	hasNotifications: boolean;
	onClearAllNotifications: () => void;
	unreadCount: number;
}

const NotificationDropdownView = ({
	unreadCount,
	hasNotifications,
	onClearAllNotifications,
	children,
}: NotificationDropdownViewProps) => (
	<div className="relative z-50 w-full">
		{unreadCount > 0 && (
			<div className="absolute top-0 right-0 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white-500">
				{unreadCount}
			</div>
		)}
		<IconDropdown className="h-100" closeOnItemClick={false} Tag={BellIcon}>
			<div className="relative w-full">
				<Heading alignment="center" className="py-6" size="m">
					Notifications
				</Heading>
				{hasNotifications && (
					<button
						className="absolute right-3 bottom-4 cursor-pointer text-gray-700 transition-colors duration-300 hover:text-gray-600"
						onClick={onClearAllNotifications}
					>
						<Text size="xs">Clear all</Text>
					</button>
				)}
			</div>
			<ul className="no-scrollbar flex w-full flex-col items-center overflow-y-auto">
				{children}
			</ul>
		</IconDropdown>
	</div>
);

export default NotificationDropdownView;
