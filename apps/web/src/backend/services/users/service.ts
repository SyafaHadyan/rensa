import { UserRepository } from "@rensa/db/queries/user.repository";
import type {
	UserRegisterDto,
	UserRepositoryInterface,
	UserResponseDto,
	UserWithPasswordResponseDto,
} from "@rensa/db/schema";
import {
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "@/backend/common/backend.error";

export class UserService {
	readonly userRepository: UserRepositoryInterface;
	constructor(userRepository: UserRepositoryInterface) {
		this.userRepository = userRepository;
	}

	async getById(userId: string, actorId?: string): Promise<UserResponseDto> {
		if (!actorId) {
			throw new UnauthorizedError();
		}
		if (actorId !== userId) {
			throw new ForbiddenError("Forbidden");
		}

		const user = await this.userRepository.getById(userId);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		return user;
	}
	async getByEmail(email: string): Promise<UserWithPasswordResponseDto | null> {
		return this.userRepository.getByEmail(email);
	}
	async create(payload: UserRegisterDto): Promise<UserResponseDto> {
		const user = await this.userRepository.create(payload);
		return user;
	}
}

export const userService = new UserService(new UserRepository());
