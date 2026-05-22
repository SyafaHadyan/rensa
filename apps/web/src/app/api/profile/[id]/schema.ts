import type { OpenApiFragment } from "@/backend/shared/openapi/types";

export const profileByIdOpenApiFragment: OpenApiFragment = {
	tags: [{ name: "profile" }],
	paths: {
		"/api/profile/[id]": {
			get: {
				tags: ["profile"],
				summary: "Get profile by id",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { 200: { description: "Profile found" } },
			},
			patch: {
				tags: ["profile"],
				summary: "Update profile",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				requestBody: {
					content: {
						"multipart/form-data": {
							schema: { $ref: "#/components/schemas/UpdateProfileDto" },
						},
						"application/json": {
							schema: { $ref: "#/components/schemas/UpdateProfileDto" },
							example: {
								username: "updated-user",
							},
						},
					},
				},
				responses: { 200: { description: "Profile updated" } },
			},
			post: {
				tags: ["profile"],
				summary: "Update profile (compatibility alias)",
				responses: { 200: { description: "Profile updated" } },
			},
		},
	},
	components: {
		schemas: {
			UpdateProfileDto: {
				type: "object",
				required: ["username"],
				properties: {
					username: { type: "string" },
					avatar: { type: "string", format: "binary" },
				},
			},
		},
	},
};
