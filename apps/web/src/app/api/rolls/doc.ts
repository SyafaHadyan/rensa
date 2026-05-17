import type { OpenApiFragment } from "@/backend/shared/openapi/types";

export const rollsOpenApiDocFragment: OpenApiFragment = {
	tags: [{ name: "rolls" }],
	paths: {
		"/api/rolls": {
			get: {
				tags: ["rolls"],
				summary: "List user rolls",
				parameters: [
					{
						in: "query",
						name: "userId",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
					{
						in: "query",
						name: "sort",
						schema: { type: "string", enum: ["latest", "oldest"] },
					},
				],
				responses: { 200: { description: "Rolls listed" } },
			},
			post: {
				tags: ["rolls"],
				summary: "Create roll",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateRollDto" },
							example: {
								name: "My Travel Roll",
								description: "Trip photos",
							},
						},
					},
				},
				responses: { 201: { description: "Roll created" } },
			},
		},
		"/api/rolls/default": {
			get: {
				tags: ["rolls"],
				summary: "Get default roll",
				responses: { 200: { description: "Default roll found" } },
			},
		},
		"/api/rolls/is-saved": {
			get: {
				tags: ["rolls"],
				summary: "List rolls containing a photo",
				parameters: [
					{
						in: "query",
						name: "photoId",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { 200: { description: "Saved status listed" } },
			},
		},
	},
};
