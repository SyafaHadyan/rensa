export interface NotificationActor {
  avatar?: string;
  id: string;
  username: string;
}

export interface NotificationData {
  actorId: NotificationActor;
  createdAt?: Date | string;
  id: string;
  message?: string;
  photoId: string;
  read: boolean;
  recipientId: string;
  type: string;
  updatedAt?: Date | string;
}
