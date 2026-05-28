import type { OpenApiFragment } from "@/backend/shared/openapi/types";

export const photoBookmarkOpenApiFragment: OpenApiFragment = {
	tags: [{ name: "photos" }],
	paths: {
		"/api/photos/bookmark": {
			get: {
				tags: ["photos"],
				summary: "List bookmarked photos",
				parameters: [
					{
						in: "query",
						name: "userId",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
					{ in: "query", name: "page", schema: { type: "integer" } },
					{ in: "query", name: "limit", schema: { type: "integer" } },
				],
				responses: { 200: { description: "Bookmarks listed" } },
			},
		},
		"/api/photos/[id]/bookmark": {
			get: {
				tags: ["photos"],
				summary: "Get bookmark status",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { 200: { description: "Bookmark status fetched" } },
			},
			put: {
				tags: ["photos"],
				summary: "Add bookmark",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { 200: { description: "Bookmark added" } },
			},
			delete: {
				tags: ["photos"],
				summary: "Remove bookmark",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { 200: { description: "Bookmark removed" } },
			},
		},
	},
	components: {
		schemas: {
			BookmarkStatusDto: {
				type: "object",
				required: ["bookmarkCount", "isBookmarked"],
				properties: {
					bookmarkCount: { type: "integer", minimum: 0 },
					isBookmarked: { type: "boolean" },
				},
			},
		},
	},
};
