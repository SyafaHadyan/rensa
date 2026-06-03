import { closeRensaQueues } from "@rensa/queue";
import type { Worker } from "bullmq";

export const createShutdownHandler =
	(params: { app: { stop: () => void }; workers: Worker[] }) => async () => {
		await Promise.all(params.workers.map((worker) => worker.close()));
		await closeRensaQueues();
		params.app.stop();
	};

export const registerShutdownSignals = (shutdown: () => Promise<void>) => {
	const handleShutdown = () => {
		shutdown()
			.then(() => process.exit(0))
			.catch((error) => {
				console.error("Failed to shut down workers:", error);
				process.exit(1);
			});
	};

	process.on("SIGTERM", handleShutdown);
	process.on("SIGINT", handleShutdown);
};
