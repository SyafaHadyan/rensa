import axios from "axios";
import jwt from "jsonwebtoken";
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

const createNotificationsToken = (userId: string): string | null => {
	const secret = process.env.NEXTAUTH_SECRET;
	if (!secret) {
		console.error("[notifications-api] missing NEXTAUTH_SECRET");
		return null;
	}

	return jwt.sign({ id: userId }, secret, { expiresIn: "5m" });
};

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
			} else if (session?.user?.id) {
				const serviceToken = createNotificationsToken(session.user.id);
				if (serviceToken) {
					config.headers.Authorization = `Bearer ${serviceToken}`;
				}
			}
			console.info("[notifications-api] auth", {
				hasAuthorization: Boolean(config.headers.Authorization),
				hasSessionUser: Boolean(session?.user?.id),
				usesSessionAccessToken: Boolean(session?.accessToken),
			});
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
