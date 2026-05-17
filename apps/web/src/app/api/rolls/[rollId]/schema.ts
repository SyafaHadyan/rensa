import type { OpenApiFragment } from "@/backend/shared/openapi/types";

export const rollByIdOpenApiFragment: OpenApiFragment = {
  tags: [{ name: "rolls" }],
  paths: {
    "/api/rolls/[rollId]": {
      get: {
        tags: ["rolls"],
        summary: "Get roll by id",
        parameters: [
          {
            in: "path",
            name: "rollId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "Roll found" } },
      },
      patch: {
        tags: ["rolls"],
        summary: "Update roll",
        parameters: [
          {
            in: "path",
            name: "rollId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRollDto" },
              example: {
                name: "Updated Roll Name",
                description: "Updated description",
              },
            },
          },
        },
        responses: { 200: { description: "Roll updated" } },
      },
      delete: {
        tags: ["rolls"],
        summary: "Delete roll",
        parameters: [
          {
            in: "path",
            name: "rollId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "Roll deleted" } },
      },
    },
    "/api/rolls/[rollId]/owner": {
      get: {
        tags: ["rolls"],
        summary: "Get roll owner",
        parameters: [
          {
            in: "path",
            name: "rollId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "Owner found" } },
      },
    },
    "/api/rolls/[rollId]/photos": {
      get: {
        tags: ["rolls"],
        summary: "List photos in roll",
        parameters: [
          {
            in: "path",
            name: "rollId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Roll photos listed" } },
      },
    },
    "/api/rolls/[rollId]/photos/[photo_id]": {
      post: {
        tags: ["rolls"],
        summary: "Add photo to roll",
        parameters: [
          {
            in: "path",
            name: "rollId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            in: "path",
            name: "photo_id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "Photo added to roll" } },
      },
      delete: {
        tags: ["rolls"],
        summary: "Remove photo from roll",
        parameters: [
          {
            in: "path",
            name: "rollId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            in: "path",
            name: "photo_id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "Photo removed from roll" } },
      },
    },
  },
  components: {
    schemas: {
      UpdateRollDto: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          imageUrl: { type: "string" },
        },
      },
    },
  },
};
