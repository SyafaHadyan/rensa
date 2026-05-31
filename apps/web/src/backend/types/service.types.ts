export interface PaginatedPhotoListResult {
	currentPage: number;
	hasMore: boolean;
	nextCursor?: string;
	photos: unknown[];
	total: number;
	totalPages: number;
}

export interface CommentListResult {
	comments: unknown[];
	hasMore: boolean;
	nextCursor?: string;
	total: number;
}

export interface PaginationMeta {
	limit: number;
	page: number;
	pages: number;
	total: number;
}

export interface ContactListResult {
	contacts: unknown[];
	pagination: PaginationMeta;
}

export interface ContactSubmitResult {
	id: string;
}
