import type { OpenApiFragment } from "@/backend/shared/openapi/types";

export const notificationsOpenApiFragment: OpenApiFragment = {
	tags: [{ name: "notifications" }],
	paths: {
		"/api/notifications": {
			get: {
				tags: ["notifications"],
				summary: "List notifications",
				parameters: [
					{
						in: "query",
						name: "recipientId",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
					{ in: "query", name: "page", schema: { type: "integer" } },
					{ in: "query", name: "limit", schema: { type: "integer" } },
				],
				responses: { 200: { description: "Notifications listed" } },
			},
			post: {
				tags: ["notifications"],
				summary: "Create notification",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateNotificationDto" },
							example: {
								actorId: "484cc46a-3ed4-4272-9a6b-7abd03c97c44",
								photoId: "3ad70607-9f8b-4adc-884c-c3b9e15b71f3",
								recipientId: "0f2d8f3e-1dd7-4a52-9dd7-8cbffa4fd89f",
								type: "photo-bookmarked",
							},
						},
					},
				},
				responses: { 201: { description: "Notification created" } },
			},
		},
	},
	components: {
		schemas: {
			CreateNotificationDto: {
				type: "object",
				properties: {
					recipientId: { type: "string", format: "uuid" },
					actorId: { type: "string", format: "uuid" },
					photoId: { type: "string", format: "uuid" },
					type: { type: "string" },
				},
				required: ["actorId", "photoId", "recipientId", "type"],
			},
		},
	},
};
