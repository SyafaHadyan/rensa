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

export interface BackendPhotosResponse {
	currentPage: number;
	hasMore: boolean;
	photos: Photo[];
	total: number;
	totalPages: number;
}

export type ExplorePhotoSource = "db" | "picsum";

export interface FetchPhotosResponse {
	data: Photo[];
	nextPage: number | undefined;
	source?: ExplorePhotoSource;
}

export interface PicsumPhotosResponse {
	hasMore: boolean;
	photos: Photo[];
}
