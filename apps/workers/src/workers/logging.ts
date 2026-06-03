import type { Worker } from "bullmq";

export const registerWorkerFailureLogging = (workers: Worker[]) => {
	for (const worker of workers) {
		worker.on("failed", (job, error) => {
			console.error(`[workers] ${worker.name} job failed`, {
				error,
				jobId: job?.id,
				name: job?.name,
			});
		});
	}
};
