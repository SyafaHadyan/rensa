export const env = {
	port: Number.parseInt(process.env.PORT || "3010", 10),
	bullBoardUsername: process.env.BULL_BOARD_USERNAME,
	bullBoardPassword: process.env.BULL_BOARD_PASSWORD,
	notificationsBaseUrl:
		process.env.ELYSIA_BASE_URL || "http://localhost:3002/api",
	nextAuthSecret: process.env.NEXTAUTH_SECRET,
	aiBaseUrl: process.env.FAST_API_BASE_URL || "http://localhost:3001/api",
};
