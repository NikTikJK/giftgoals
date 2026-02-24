import { Link, useNavigate } from "react-router-dom";
import { Gift, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.tsx";
import { useState } from "react";
import { notificationsApi } from "../../api/notifications.ts";
import { usePolling } from "../../hooks/usePolling.ts";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  usePolling(
    async () => {
      if (!user) return;
      try {
        const { unreadCount } = await notificationsApi.list();
        setUnread(unreadCount);
      } catch {
        /* ignore */
      }
    },
    { intervalMs: 15_000, enabled: !!user },
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          to={user ? "/app/wishlists" : "/"}
          className="flex items-center gap-2 font-semibold text-primary"
        >
          <Gift size={22} />
          <span>GiftGoals</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/app/wishlists"
                className="rounded-sm px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Вишлисты
              </Link>
              <Link
                to="/app/notifications"
                className="relative rounded-sm p-1.5 text-neutral-300 hover:bg-neutral-800"
                aria-label="Уведомления"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <Link
                to="/app/profile"
                className="rounded-sm p-1.5 text-neutral-300 hover:bg-neutral-800"
                aria-label="Профиль"
              >
                <User size={18} />
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-sm p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-danger"
                aria-label="Выйти"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="rounded-sm px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Войти
              </Link>
              <Link
                to="/auth/register"
                className="rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-primary-dark"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
