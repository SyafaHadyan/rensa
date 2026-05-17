import { PhotoRepository } from "@rensa/db/queries/photo.repository";
import { UserRepository } from "@rensa/db/queries/user.repository";
import type { ListPhotosQueryDto } from "@rensa/db/schema";
import { PhotoService } from "./service";

export class PhotosController {
	private readonly photoService: PhotoService;

	constructor(photoService: PhotoService) {
		this.photoService = photoService;
	}

	deleteById(photoId: string, actorId: string): Promise<void> {
		return this.photoService.deleteById(photoId, actorId);
	}

	getById(photoId: string): Promise<unknown> {
		
		return this.photoService.getById(photoId);
	}

	getOwnerId(photoId: string): Promise<string> {
		return this.photoService.getOwnerId(photoId);
	}

	list(query: ListPhotosQueryDto): Promise<unknown> {
		return this.photoService.list(query);
	}

	listBookmarkedByUser(
		userId: string,
		page: number,
		limit: number
	): Promise<unknown> {
		return this.photoService.listBookmarkedByUser(userId, page, limit);
	}
}

const photoRepository = new PhotoRepository();
const userRepository = new UserRepository();
const photoService = new PhotoService(photoRepository, userRepository);

export const photoController = new PhotosController(photoService);
