import { getRensaQueues } from "@rensa/queue";
import Elysia from "elysia";
import { env } from "./env";
import {
	createBullBoardAdapter,
	isBullBoardAuthorized,
	isBullBoardRoute,
} from "./queues/bull-board";
import { createWorkers } from "./workers/create-workers";
import { registerWorkerFailureLogging } from "./workers/logging";
import {
	createShutdownHandler,
	registerShutdownSignals,
} from "./workers/shutdown";

const queues = getRensaQueues();
const serverAdapter = createBullBoardAdapter(queues);
const workers = createWorkers();
registerWorkerFailureLogging(workers);

const app = new Elysia()
	.get("/health", () => ({ status: "ok" }))
	.onBeforeHandle(({ request, set }) => {
		if (!isBullBoardRoute(request)) {
			return;
		}

		if (isBullBoardAuthorized(request)) {
			return;
		}

		set.status = 401;
		set.headers["www-authenticate"] = "Basic";
		return "Unauthorized";
	})
	.use(await serverAdapter.registerPlugin())
	.listen({ hostname: "0.0.0.0", port: env.port }, () => {
		console.log(`Workers listening on http://localhost:${env.port}`);
	});

registerShutdownSignals(createShutdownHandler({ app, workers }));
