import axios from "axios";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

const expressApi = axios.create({
	baseURL: process.env.EXPRESS_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});
const elysiaApi = axios.create({
	baseURL: process.env.ELYSIA_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

const maskUrl = (url?: string): string =>
	url ? url.replace(/\/\/([^:@/]+):([^@/]+)@/, "//$1:***@") : "not configured";

const fastApi = axios.create({
	baseURL: process.env.FAST_API_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});
elysiaApi.interceptors.request.use(
	async (config) => {
		try {
			console.info("[notifications-api] request", {
				baseURL: maskUrl(config.baseURL),
				method: config.method,
				url: config.url,
			});
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

elysiaApi.interceptors.response.use(
	(response) => {
		console.info("[notifications-api] response", {
			status: response.status,
			url: response.config.url,
		});
		return response;
	},
	(error) => {
		if (axios.isAxiosError(error)) {
			console.error("[notifications-api] failed", {
				baseURL: maskUrl(error.config?.baseURL),
				code: error.code,
				message: error.message,
				status: error.response?.status,
				url: error.config?.url,
			});
		}
		return Promise.reject(error);
	}
);

export { elysiaApi, expressApi, fastApi };
