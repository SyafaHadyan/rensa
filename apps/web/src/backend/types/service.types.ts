export interface PaginatedPhotoListResult {
	currentPage: number;
	hasMore: boolean;
	photos: unknown[];
	total: number;
	totalPages: number;
}

export interface CommentListResult {
	comments: unknown[];
	hasMore: boolean;
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
