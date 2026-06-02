import type {
	BackendPhotosResponse,
	FetchPhotosResponse,
	PhotoUploadStatus,
} from "@/frontend/types/photo";
import { api } from "@/lib/axios-client";

export const fetchPhotosFromDB = async (
	page: number | string,
	filters: string[] | undefined,
	sort: "oldest" | "popular" | "recent" = "recent",
	userId?: string
): Promise<FetchPhotosResponse> => {
	const isCursor = typeof page === "string";
	const params: Record<string, number | string | undefined> = {
		cursor: isCursor ? page : undefined,
		page: isCursor ? undefined : page,
		limit: 10,
		sort,
		filters: filters?.join(","),
		userId,
	};

	const res = await api.get<BackendPhotosResponse>("/photos", { params });

	return {
		data: res.data.photos,
		nextPage:
			res.data.nextCursor ??
			(res.data.hasMore && !isCursor ? page + 1 : undefined),
	};
};

export const fetchBookmarkedPhotosFromDB = async (
	userId: string,
	page: number | string
): Promise<FetchPhotosResponse> => {
	const isCursor = typeof page === "string";
	const params: Record<string, number | string | undefined> = {
		userId,
		cursor: isCursor ? page : undefined,
		page: isCursor ? undefined : page,
		limit: 10,
	};

	const res = await api.get<BackendPhotosResponse>("/photos/bookmark", {
		params,
	});

	return {
		data: res.data.photos,
		nextPage:
			res.data.nextCursor ??
			(res.data.hasMore && !isCursor ? page + 1 : undefined),
	};
};

export const fetchPhotosFromRoll = async (
	rollId: string,
	page: number,
	filters?: string[],
	sort: "popular" | "recent" = "recent"
): Promise<FetchPhotosResponse> => {
	const params: Record<string, number | string | undefined> = {
		page,
		limit: 10,
		sort,
		filters: filters?.join(","),
	};

	const res = await api.get(`/rolls/${rollId}/photos`, { params });

	return {
		data: res.data.data.photos,
		nextPage: res.data.data.hasMore ? page + 1 : undefined,
	};
};

export const fetchExplorePhotos = async (
	page: number | string,
	filters: string[] | undefined,
	sort: "popular" | "recent" = "recent"
): Promise<FetchPhotosResponse> => {
	const response = await fetchPhotosFromDB(page, filters, sort);
	return { ...response, source: "db" };
};

export const fetchCreatedPhotosByUserId = async (
	userId: string,
	page: number | string,
	sort: "oldest" | "recent" = "recent"
): Promise<FetchPhotosResponse> => {
	const response = await fetchPhotosFromDB(page, undefined, sort, userId);
	return { ...response, source: "db" };
};

export const fetchPhotoById = async (photoId: string) => {
	const res = await api.get(`/photos/${photoId}`);
	return res.data.data;
};

export const fetchPhotoUploadStatus = async (
	photoId: string
): Promise<PhotoUploadStatus> => {
	const res = await api.get(`/photos/uploads/${photoId}/status`);
	return res.data.data;
};

export const fetchPhotoBookmarkStatus = async (photoId: string) => {
	const res = await api.get("/photos/bookmark", {
		params: { photoId },
	});
	return res.data.data as {
		bookmarkCount: number;
		isBookmarked: boolean;
	};
};
