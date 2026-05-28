import type {
	BackendPhotosResponse,
	FetchPhotosResponse,
} from "@/frontend/types/photo";
import { api } from "@/lib/axios-client";

export const fetchPhotosFromDB = async (
	page: number,
	filters: string[] | undefined,
	sort: "oldest" | "popular" | "recent" = "recent",
	userId?: string
): Promise<FetchPhotosResponse> => {
	const params: Record<string, number | string | undefined> = {
		page,
		limit: 10,
		sort,
		filters: filters?.join(","),
		userId,
	};

	const res = await api.get<BackendPhotosResponse>("/photos", { params });

	return {
		data: res.data.photos,
		nextPage: res.data.hasMore ? page + 1 : undefined,
	};
};

export const fetchBookmarkedPhotosFromDB = async (
	userId: string,
	page: number
): Promise<FetchPhotosResponse> => {
	const params: Record<string, number | string | undefined> = {
		userId,
		page,
		limit: 10,
	};

	const res = await api.get<BackendPhotosResponse>("/photos/bookmark", {
		params,
	});

	return {
		data: res.data.photos,
		nextPage: res.data.hasMore ? page + 1 : undefined,
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
	page: number,
	filters: string[] | undefined,
	sort: "popular" | "recent" = "recent"
): Promise<FetchPhotosResponse> => {
	const response = await fetchPhotosFromDB(page, filters, sort);
	return { ...response, source: "db" };
};

export const fetchCreatedPhotosByUserId = async (
	userId: string,
	page: number,
	sort: "oldest" | "recent" = "recent"
): Promise<FetchPhotosResponse> => {
	const response = await fetchPhotosFromDB(page, undefined, sort, userId);
	return { ...response, source: "db" };
};

export const fetchPhotoById = async (photoId: string) => {
	const res = await api.get(`/photos/${photoId}`);
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
