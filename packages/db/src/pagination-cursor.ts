export interface TimestampCursor {
	id: string;
	timestamp: Date;
}

export const encodeTimestampCursor = (
	timestamp: Date | null,
	id: string
): string | undefined => {
	if (!timestamp) {
		return;
	}

	return Buffer.from(
		JSON.stringify({ id, timestamp: timestamp.toISOString() })
	).toString("base64url");
};

export const decodeTimestampCursor = (
	cursor?: string
): TimestampCursor | undefined => {
	if (!cursor) {
		return;
	}

	try {
		const parsed = JSON.parse(
			Buffer.from(cursor, "base64url").toString("utf8")
		) as { id?: unknown; timestamp?: unknown };

		if (typeof parsed.id !== "string" || typeof parsed.timestamp !== "string") {
			return;
		}

		const timestamp = new Date(parsed.timestamp);
		if (Number.isNaN(timestamp.getTime())) {
			return;
		}

		return {
			id: parsed.id,
			timestamp,
		};
	} catch {
		return;
	}
};
