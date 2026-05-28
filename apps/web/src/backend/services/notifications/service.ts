import { NotificationRepository } from "@rensa/db/queries/notification.repository";
import type {
	CreateNotificationDto,
	ListNotificationsQueryDto,
	NotificationRepositoryInterface,
	NotificationResponseDto,
} from "@rensa/db/schema";
import { elysiaApi } from "@/lib/axios-server";

export class NotificationService {
	readonly notificationRepository: NotificationRepositoryInterface;

	constructor(notificationRepository: NotificationRepositoryInterface) {
		this.notificationRepository = notificationRepository;
	}

	list(query: ListNotificationsQueryDto): Promise<NotificationResponseDto[]> {
		return this.notificationRepository.list(query);
	}

	create(payload: CreateNotificationDto): Promise<unknown> {
		return this.notificationRepository.create(payload);
	}

	async markAsRead(notificationId: string): Promise<void> {
		await this.notificationRepository.markAsRead(notificationId);
	}

	async clearByUserId(userId: string): Promise<void> {
		await this.notificationRepository.clearByUserId(userId);
	}
}

const notificationRepository = new NotificationRepository(elysiaApi);

export const notificationService = new NotificationService(
	notificationRepository
);
