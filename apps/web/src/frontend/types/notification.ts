export interface NotificationActor {
	avatarUrl?: string;
	userId: string;
	username: string;
}

export interface NotificationData {
	actor: NotificationActor;
	createdAt?: Date | string;
	message?: string;
	notificationId: string;
	photoId: string;
	read: boolean;
	recipientId: string;
	type: string;
	updatedAt?: Date | string;
}
