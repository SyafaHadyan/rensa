export function logUploadStage(
	uploadId: string,
	stage: string,
	startedAt: number,
	extra?: Record<string, unknown>
) {
	console.info("[photo-upload]", {
		...extra,
		durationMs: Math.round(performance.now() - startedAt),
		stage,
		uploadId,
	});
}
