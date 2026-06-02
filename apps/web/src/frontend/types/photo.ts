export interface PhotoMetadata {
	exif?: Record<string, string>;
	format?: "jpg" | "jpeg" | string;
	height?: number;
	size?: number;
	uploadedAt?: Date | string;
	width?: number;
}

export interface PhotoUser {
	avatarUrl?: string;
	userId: string;
	username: string;
}

export interface Photo {
	bookmarks?: number;
	camera?: string;
	category?: string;
	color?: string;
	createdAt?: string;
	description: string;
	metadata?: PhotoMetadata;
	photoId: string;
	style?: string;
	tags?: string[];
	title: string;
	updatedAt?: string;
	url: string;
	user: PhotoUser;
}

export type PhotoProcessingStatus = "pending" | "ready" | "failed";

export interface UploadedPhoto extends Photo {
	processingError?: string | null;
	processingStatus?: PhotoProcessingStatus;
}

export interface PhotoUploadStatus {
	metadata?: PhotoMetadata;
	photoId: string;
	processingError: string | null;
	processingStatus: PhotoProcessingStatus;
	url?: string;
}

export interface BackendPhotosResponse {
	currentPage: number;
	hasMore: boolean;
	nextCursor?: string;
	photos: Photo[];
	total: number;
	totalPages: number;
}

export type ExplorePhotoSource = "db";

export interface FetchPhotosResponse {
	data: Photo[];
	nextPage: number | string | undefined;
	source?: ExplorePhotoSource;
}
