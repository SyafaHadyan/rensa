import axios from "axios";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

const isProduction = process.env.NODE_ENV === "production";

const expressBaseUrl =
	process.env.EXPRESS_BASE_URL ||
	(isProduction ? "http://rensa-express:3003" : "http://localhost:3003");

const elysiaBaseUrl =
	process.env.ELYSIA_BASE_URL ||
	(isProduction ? "http://rensa-elysia:3002" : "http://localhost:3002");

const fastApiBaseUrl =
	process.env.FAST_API_BASE_URL ||
	(isProduction ? "http://rensa-fastapi:3001" : "http://localhost:3001");

const expressApi = axios.create({
	baseURL: expressBaseUrl,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});
const elysiaApi = axios.create({
	baseURL: elysiaBaseUrl,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

const fastApi = axios.create({
	baseURL: fastApiBaseUrl,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});
elysiaApi.interceptors.request.use(
	async (config) => {
		try {
			const session = await getServerSession(authOptions);
			if (session?.accessToken) {
				config.headers.Authorization = `Bearer ${session.accessToken}`;
			}
		} catch (error) {
			return Promise.reject(error);
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export { elysiaApi, expressApi, fastApi };
