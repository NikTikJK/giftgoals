import { useState, useCallback } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { notificationsApi, type Notification } from "../api/notifications.ts";
import { useToast } from "../hooks/useToast.tsx";
import { usePolling } from "../hooks/usePolling.ts";
import Button from "../components/ui/Button.tsx";

const Notifications = () => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { notifications } = await notificationsApi.list();
      setNotifications(notifications);
    } catch {
      if (loading) addToast("error", "Не удалось загрузить уведомления");
    } finally {
      setLoading(false);
    }
  }, [addToast, loading]);

  usePolling(fetchData, { intervalMs: 10_000 });

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (loading) {
    return <p className="mt-12 text-center text-neutral-400">Загрузка...</p>;
  }

  return (
    <div className="mx-auto max-w-lg text-neutral-100">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-50">Уведомления</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="ghost" className="text-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} /> Прочитать все
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-neutral-400">
          <Bell size={40} className="mb-3 text-neutral-600" />
          <p>Уведомлений пока нет</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                n.isRead
                  ? "border-neutral-800 bg-neutral-900/60"
                  : "border-primary-soft/50 bg-primary-soft/20"
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-100">{n.title}</p>
                <p className="text-sm text-neutral-400">{n.body}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(n.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="rounded p-1 text-primary hover:bg-primary-soft/40"
                  aria-label="Отметить как прочитанное"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
