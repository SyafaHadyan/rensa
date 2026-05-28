import type { OpenApiFragment } from "@/backend/shared/openapi/types";

export const usersByIdOpenApiFragment: OpenApiFragment = {
	tags: [{ name: "users" }],
	paths: {
		"/api/users/[id]": {
			get: {
				tags: ["users"],
				summary: "Get user by id",
				parameters: [
					{
						in: "path",
						name: "id",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					200: {
						description: "User found",
						content: {
							"application/json": {
								example: {
									success: true,
									data: {
										user: {
											userId: "0f2d8f3e-1dd7-4a52-9dd7-8cbffa4fd89f",
											username: "rensa-user",
											email: "user@rensa.site",
											role: "user",
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
};
