import { api } from "./client.ts";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, string> | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationsApi = {
  list: () => api.get<NotificationsResponse>("/notifications"),

  markRead: (id: string) =>
    api.patch<{ ok: boolean }>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.post<{ ok: boolean }>("/notifications/read-all"),
};
