import type { OpenApiFragment } from "@/backend/shared/openapi/types";
import { ROLL_NAME_MAX_LENGTH } from "@/shared/configs/content-limits.config";

export const rollsOpenApiSchemaFragment: OpenApiFragment = {
	components: {
		schemas: {
			CreateRollDto: {
				type: "object",
				required: ["name"],
				properties: {
					name: {
						type: "string",
						minLength: 1,
						maxLength: ROLL_NAME_MAX_LENGTH,
					},
					description: { type: "string" },
					imageUrl: { type: "string" },
				},
			},
		},
	},
};
