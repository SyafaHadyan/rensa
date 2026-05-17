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
            name: "recipient_id",
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
                recipient_id: "0f2d8f3e-1dd7-4a52-9dd7-8cbffa4fd89f",
                type: "comment",
                message: "Someone commented on your photo.",
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
          recipient_id: { type: "string", format: "uuid" },
          actor_id: { type: "string", format: "uuid" },
          photo_id: { type: "string", format: "uuid" },
          type: { type: "string" },
          message: { type: "string" },
        },
        required: ["recipient_id"],
      },
    },
  },
};
