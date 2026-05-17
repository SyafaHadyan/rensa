import type {
  BackendPhotosResponse,
  ExplorePhotoSource,
  FetchPhotosResponse,
  PicsumPhotosResponse,
} from "@/frontend/types/photo";
import { api } from "@/lib/axios-client";

export const fetchPhotosFromDB = async (
  page: number,
  filters: string[] | undefined,
  sort: "popular" | "recent" = "recent",
): Promise<FetchPhotosResponse> => {
  const params: Record<string, number | string | undefined> = {
    page,
    limit: 10,
    sort,
    filters: filters?.join(","),
  };

  const res = await api.get<BackendPhotosResponse>("/photos", { params });

  return {
    data: res.data.photos,
    nextPage: res.data.hasMore ? page + 1 : undefined,
  };
};

export const fetchBookmarkedPhotosFromDB = async (
  userId: string,
  page: number,
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
  sort: "popular" | "recent" = "recent",
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

const getExplorePhotoSource = (): ExplorePhotoSource => {
  // const requestedSource = process.env.NEXT_PUBLIC_EXPLORE_SOURCE;
  // if (process.env.NODE_ENV === "production") {
  // 	return "db";
  // }
  // if (requestedSource === "picsum") {
  // 	return "picsum";
  // }
  return "db";
};

export const fetchExplorePhotos = async (
  page: number,
  filters: string[] | undefined,
  sort: "popular" | "recent" = "recent",
): Promise<FetchPhotosResponse> => {
  const source = getExplorePhotoSource();
  if (source === "db") {
    const response = await fetchPhotosFromDB(page, filters, sort);
    console.log("response", response);
    return { ...response, source };
  }

  const params: Record<string, number | string | undefined> = {
    page,
    limit: 10,
    sort,
    filters: filters?.join(" "),
  };

  const response = await api.get<PicsumPhotosResponse>("/photos/debug/picsum", {
    params,
  });
  return {
    data: response.data.photos,
    nextPage: response.data.hasMore ? page + 1 : undefined,
    source,
  };
};

export const fetchPhotoOwnerByPhotoId = async (photo_id: string) => {
  const res = await api.get<{ data: { ownerId: string } }>(
    `/photos/${photo_id}/owner`,
  );
  return res.data.data.ownerId;
};

export const fetchPhotoById = async (photo_id: string) => {
  const res = await api.get(`/photos/${photo_id}`);
  return res.data.data;
};

export const fetchUserBookmarkedPhotos = async (userId: string) => {
  const res = await api.get(`/users/${userId}`);
  return res.data.data.user.bookmarks;
};
