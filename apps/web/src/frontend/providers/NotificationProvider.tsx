"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import type { NotificationData } from "@/frontend/types/notification";
import { api } from "@/lib/axios-client";

interface NotificationContextType {
	clearNotifications: () => void;
	markNotificationAsRead: (id: string) => void;
	notifications: NotificationData[];
	refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);
const MAX_NOTIFICATIONS = 10;
const RECONNECT_BASE_DELAY_MS = 500;
const RECONNECT_MAX_DELAY_MS = 10_000;

const fetchNotifications = async (
	recipientId: string,
	page = 1,
	limit = MAX_NOTIFICATIONS
): Promise<NotificationData[]> => {
	const response = await api.get("/notifications", {
		params: { recipientId, page, limit },
	});
	return response.data?.data ?? [];
};

const clearUserNotifications = async (userId: string): Promise<boolean> => {
	const response = await api.delete(`/notifications/${userId}/read`);
	return response.data?.success ?? false;
};

const markUserNotificationAsRead = async (
	notificationId: string
): Promise<boolean> => {
	const response = await api.put(`/notifications/${notificationId}/read`);
	return response.data?.success ?? false;
};

export function NotificationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const wsRef = useRef<WebSocket | null>(null);
	const { user, accessToken } = useAuthStore();
	const queryClient = useQueryClient();
	const reconnectAttempts = useRef(0);
	const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
	const notifAudioRef = useRef<HTMLAudioElement | null>(null);
	const shouldReconnectRef = useRef(true);

	useEffect(() => {
		if (typeof window !== "undefined") {
			notifAudioRef.current = new Audio("/audios/notification2.mp3");
			notifAudioRef.current.volume = 0.8;
		}
	}, []);

	const playNotification = useCallback(async () => {
		try {
			await notifAudioRef.current?.play();
		} catch (err) {
			console.warn("Audio blocked by browser", err);
		}
	}, []);
	const { data: notifications = [], refetch } = useQuery<NotificationData[]>({
		queryKey: ["notifications", user?.id],
		queryFn: () => {
			if (!user?.id) {
				return [];
			}
			return fetchNotifications(user.id);
		},
		enabled: !!accessToken && !!user?.id,
		initialData: [],
	});

	const connectWebSocket = useCallback(() => {
		if (!accessToken) {
			return;
		}

		const ws = new WebSocket(`wss://rensa.site/api/ws?token=${accessToken}`);
		wsRef.current = ws;

		ws.onopen = () => {
			reconnectAttempts.current = 0;
		};

		ws.onerror = (err) => {
			console.error("WS Error:", err);
		};

		ws.onclose = () => {
			if (!shouldReconnectRef.current) {
				return;
			}

			const delay = Math.min(
				RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempts.current,
				RECONNECT_MAX_DELAY_MS
			);
			reconnectAttempts.current += 1;

			if (reconnectTimeout.current) {
				clearTimeout(reconnectTimeout.current);
			}

			reconnectTimeout.current = setTimeout(() => {
				if (shouldReconnectRef.current) {
					connectWebSocket();
				}
			}, delay);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (!(data.id && data.recipient_id && data.type)) {
					console.warn("Invalid notification data received:", data);
					return;
				}
				queryClient.setQueryData<NotificationData[]>(
					["notifications", user?.id],
					(oldNotifications = []) => {
						const newList = [data, ...oldNotifications];
						return newList.slice(0, MAX_NOTIFICATIONS);
					}
				);
				playNotification();
			} catch (err) {
				console.error("Invalid WS message:", err);
			}
		};
	}, [accessToken, queryClient, user?.id, playNotification]);

	useEffect(() => {
		if (!(user?.id && accessToken)) {
			return;
		}
		shouldReconnectRef.current = true;
		connectWebSocket();

		return () => {
			shouldReconnectRef.current = false;
			if (wsRef.current) {
				wsRef.current.close();
			}
			if (reconnectTimeout.current) {
				clearTimeout(reconnectTimeout.current);
			}
		};
	}, [user?.id, accessToken, connectWebSocket]);

	const clearNotifications = useCallback(async () => {
		if (!user?.id) {
			return;
		}

		const key = ["notifications", user.id];
		const current = queryClient.getQueryData<NotificationData[]>(key) || [];

		// Optimistic update
		queryClient.setQueryData<NotificationData[]>(key, []);

		try {
			await clearUserNotifications(user.id);
		} catch (err) {
			console.error("Failed to clear notifications", err);
			// Rollback on failure
			queryClient.setQueryData<NotificationData[]>(key, current);
		}
	}, [queryClient, user?.id]);

	const markNotificationAsRead = useCallback(
		async (id: string) => {
			if (!user?.id) {
				return;
			}

			const key = ["notifications", user.id];

			const current = queryClient.getQueryData<NotificationData[]>(key) || [];

			const target = current.find((n) => n.id === id);

			// already read → skip
			if (!target || target.read) {
				return;
			}

			// 🔥 optimistic update
			queryClient.setQueryData<NotificationData[]>(key, (old = []) =>
				old.map((n) => (n.id === id ? { ...n, read: true } : n))
			);

			try {
				await markUserNotificationAsRead(id);
			} catch (err) {
				console.error("Failed to mark notification as read", err);

				// rollback on failure
				queryClient.setQueryData<NotificationData[]>(key, current);
			}
		},
		[queryClient, user?.id]
	);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				clearNotifications,
				markNotificationAsRead,
				refetch,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
}

export const useNotificationContext = () => {
	const ctx = useContext(NotificationContext);
	if (!ctx) {
		throw new Error("NotificationProvider not found");
	}
	return ctx;
};
