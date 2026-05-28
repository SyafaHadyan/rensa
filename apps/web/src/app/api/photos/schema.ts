import type { OpenApiFragment } from "@/backend/shared/openapi/types";

export const photosOpenApiFragment: OpenApiFragment = {
	tags: [{ name: "photos" }],
	paths: {
		"/api/photos": {
			get: {
				tags: ["photos"],
				summary: "List photos",
				parameters: [
					{ in: "query", name: "page", schema: { type: "integer" } },
					{ in: "query", name: "limit", schema: { type: "integer" } },
					{ in: "query", name: "filters", schema: { type: "string" } },
					{ in: "query", name: "sort", schema: { type: "string" } },
				],
				responses: {
					200: {
						description: "Photos listed",
						content: {
							"application/json": {
								example: {
									photos: [
										{
											photoId: "e6172de2-3f1f-430d-8d8f-b0b3248c6f23",
											title: "Sunset",
											bookmarks: 4,
										},
									],
									currentPage: 1,
								},
							},
						},
					},
				},
			},
		},
		"/api/photos/exifread": {
			post: {
				tags: ["photos"],
				summary: "Extract EXIF metadata",
				responses: { 200: { description: "EXIF extracted" } },
			},
		},
		"/api/photos/upload": {
			post: {
				tags: ["photos"],
				summary: "Upload photo",
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: { $ref: "#/components/schemas/UploadPhotoDto" },
						},
					},
				},
				responses: { 200: { description: "Uploaded" } },
			},
		},
	},
	components: {
		schemas: {
			UploadPhotoDto: {
				type: "object",
				required: ["file", "title"],
				properties: {
					file: { type: "string", format: "binary" },
					title: { type: "string" },
					description: { type: "string" },
					category: { type: "string" },
					style: { type: "string" },
					color: { type: "string" },
					tags: { type: "string", description: "JSON string array" },
					exif: { type: "string", description: "JSON string object" },
				},
			},
		},
	},
};
