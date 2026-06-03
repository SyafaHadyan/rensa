import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ElysiaAdapter } from "@bull-board/elysia";
import type { RensaQueues } from "@rensa/queue";
import { env } from "../env";

const BULL_BOARD_BASE_PATH = "/admin/queues";

export const createBullBoardAdapter = (queues: RensaQueues) => {
	const serverAdapter = new ElysiaAdapter(BULL_BOARD_BASE_PATH);

	createBullBoard({
		queues: [
			new BullMQAdapter(queues.emails),
			new BullMQAdapter(queues.notifications),
			new BullMQAdapter(queues.photos),
		],
		serverAdapter,
	});

	return serverAdapter;
};

export const isBullBoardRoute = (request: Request) =>
	new URL(request.url).pathname.startsWith(BULL_BOARD_BASE_PATH);

export const isBullBoardAuthorized = (request: Request) => {
	if (!(env.bullBoardUsername && env.bullBoardPassword)) {
		return false;
	}

	const header = request.headers.get("authorization");
	if (!header?.startsWith("Basic ")) {
		return false;
	}

	try {
		const decodedCredentials = atob(header.slice("Basic ".length));
		const separatorIndex = decodedCredentials.indexOf(":");

		if (separatorIndex === -1) {
			return false;
		}

		const username = decodedCredentials.slice(0, separatorIndex);
		const password = decodedCredentials.slice(separatorIndex + 1);

		return (
			username === env.bullBoardUsername &&
			password === env.bullBoardPassword
		);
	} catch {
		return false;
	}
};
