"use client";

import Text from "@/frontend/components/Text";
import { useNotificationContext } from "@/frontend/providers/NotificationProvider";
import NotificationDropdownView from "../components/NotificationDropdownView";
import NotificationItemContainer from "./NotificationItemContainer";

const NotificationDropdownContainer = () => {
	const { notifications, clearNotifications } = useNotificationContext();
	const unreadCount = notifications.filter(
		(notification) => !notification.read
	).length;

	const handleClearAllNotifications = () => {
		clearNotifications();
	};

	return (
		<NotificationDropdownView
			hasNotifications={notifications.length > 0}
			onClearAllNotifications={handleClearAllNotifications}
			unreadCount={unreadCount}
		>
			{notifications.length > 0 ? (
				notifications.map((notification, idx) => (
					<NotificationItemContainer
						isLast={idx === notifications.length - 1}
						key={notification.notificationId}
						notification={notification}
					/>
				))
			) : (
				<Text className="mb-10 text-gray-400" size="s">
					No notifications
				</Text>
			)}
		</NotificationDropdownView>
	);
};

export default NotificationDropdownContainer;
