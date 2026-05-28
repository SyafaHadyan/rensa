import type { OpenApiFragment } from "@/backend/shared/openapi/types";

export const photoByIdOpenApiFragment: OpenApiFragment = {
	tags: [{ name: "photos" }],
	paths: {
		"/api/photos/[id]": {
			get: {
				tags: ["photos"],
				summary: "Get photo by id",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { 200: { description: "Photo found" } },
			},
			delete: {
				tags: ["photos"],
				summary: "Delete photo",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { 200: { description: "Deleted" } },
			},
		},
		"/api/photos/[id]/owner": {
			get: {
				tags: ["photos"],
				summary: "Get photo owner",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { 200: { description: "Owner found" } },
			},
		},
		"/api/photos/[id]/comments": {
			post: {
				tags: ["photos"],
				summary: "Create comment",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateCommentDto" },
							example: {
								text: "Great photo!",
							},
						},
					},
				},
				responses: { 201: { description: "Comment created" } },
			},
			get: {
				tags: ["photos"],
				summary: "List comments",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
					{ in: "query", name: "offset", schema: { type: "integer" } },
					{ in: "query", name: "limit", schema: { type: "integer" } },
				],
				responses: { 200: { description: "Comments listed" } },
			},
		},
	},
	components: {
		schemas: {
			CreateCommentDto: {
				type: "object",
				required: ["text"],
				properties: {
					text: { type: "string", minLength: 1, maxLength: 500 },
				},
			},
		},
	},
};
