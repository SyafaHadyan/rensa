import { UserRepository } from "@rensa/db/queries/user.repository";
import type {
	UserRegisterDto,
	UserRepositoryInterface,
	UserResponseDto,
	UserWithPasswordResponseDto,
} from "@rensa/db/schema";
import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "@/backend/common/backend.error";

const isUniqueConstraintError = (error: unknown): boolean => {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const maybeError = error as { code?: unknown; constraint?: unknown };
	return (
		maybeError.code === "23505" ||
		(typeof maybeError.constraint === "string" &&
			maybeError.constraint.includes("username"))
	);
};

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
		const existingUsername = await this.userRepository.getByUsername(
			payload.username
		);
		if (existingUsername) {
			throw new ConflictError("Username already exists");
		}

		try {
			const user = await this.userRepository.create(payload);
			return user;
		} catch (error) {
			if (isUniqueConstraintError(error)) {
				throw new ConflictError("Username already exists");
			}
			throw error;
		}
	}
}

export const userService = new UserService(new UserRepository());
