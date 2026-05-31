export class BackendError extends Error {
	readonly statusCode: number;
	readonly code: string;

	constructor(message: string, statusCode: number, code: string) {
		super(message);
		this.name = "BackendError";
		this.statusCode = statusCode;
		this.code = code;
	}
}

export class ValidationError extends BackendError {
	constructor(message: string) {
		super(message, 400, "VALIDATION_ERROR");
		this.name = "ValidationError";
	}
}

export class ConflictError extends BackendError {
	constructor(message = "Resource already exists") {
		super(message, 409, "CONFLICT");
		this.name = "ConflictError";
	}
}

export class UnauthorizedError extends BackendError {
	constructor(message = "Unauthorized") {
		super(message, 401, "UNAUTHORIZED");
		this.name = "UnauthorizedError";
	}
}

export class ForbiddenError extends BackendError {
	constructor(message = "Forbidden") {
		super(message, 403, "FORBIDDEN");
		this.name = "ForbiddenError";
	}
}

export class NotFoundError extends BackendError {
	constructor(message = "Resource not found") {
		super(message, 404, "NOT_FOUND");
		this.name = "NotFoundError";
	}
}

export class TooManyRequestsError extends BackendError {
	constructor(message = "Too many requests") {
		super(message, 429, "TOO_MANY_REQUESTS");
		this.name = "TooManyRequestsError";
	}
}
