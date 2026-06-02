import { BackendError } from "@/backend/common/backend.error";

export class PhotoModerationUnavailableError extends BackendError {
	constructor() {
		super(
			"Image safety check is temporarily unavailable. Please try again.",
			503,
			"PHOTO_MODERATION_UNAVAILABLE"
		);
		this.name = "PhotoModerationUnavailableError";
	}
}

export class PhotoUploadStorageError extends BackendError {
	constructor() {
		super(
			"Image upload failed. Please try again.",
			502,
			"PHOTO_UPLOAD_STORAGE"
		);
		this.name = "PhotoUploadStorageError";
	}
}

export class PhotoPersistenceError extends BackendError {
	constructor() {
		super("Failed to persist photo", 500, "PHOTO_PERSISTENCE_ERROR");
		this.name = "PhotoPersistenceError";
	}
}
