import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { publicApi, type PublicGift, type PublicWishlist as PublicWishlistType } from "../api/public.ts";
import { reservationsApi } from "../api/reservations.ts";
import { contributionsApi } from "../api/contributions.ts";
import { useToast } from "../hooks/useToast.tsx";
import { useAuth } from "../hooks/useAuth.tsx";
import { formatDate } from "../utils/format.ts";
import PublicGiftCard from "../components/gifts/PublicGiftCard.tsx";
import AuthModal from "../components/auth/AuthModal.tsx";
import Badge from "../components/ui/Badge.tsx";
import { ApiRequestError } from "../api/client.ts";

const PublicWishlist = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [wishlist, setWishlist] = useState<PublicWishlistType | null>(null);
  const [gifts, setGifts] = useState<PublicGift[]>([]);
  const [role, setRole] = useState<"guest" | "friend" | "owner">("guest");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      const data = await publicApi.getBySlug(slug);
      setWishlist(data.wishlist);
      setGifts(data.gifts);
      setRole(data.role);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        setNotFound(true);
      } else {
        addToast("error", "Не удалось загрузить вишлист");
      }
    } finally {
      setLoading(false);
    }
  }, [slug, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData, user]);

  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleReserve = async (giftId: string) => {
    try {
      await reservationsApi.create(giftId);
      addToast("success", "Подарок зарезервирован");
      fetchData();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        addToast("error", err.code === "CONFLICT" ? "Подарок уже зарезервирован" : err.message);
      }
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await reservationsApi.cancel(reservationId);
      addToast("success", "Резерв отменён");
      fetchData();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        addToast("error", err.message);
      }
    }
  };

  const handleContribute = async (giftId: string, amount: number) => {
    try {
      await contributionsApi.create(giftId, amount);
      addToast("success", "Вклад внесён");
      fetchData();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        addToast("error", err.message);
      }
    }
  };

  if (loading) {
    return <p className="mt-12 text-center text-neutral-500">Загрузка...</p>;
  }
  if (notFound || !wishlist) {
    return (
      <div className="mt-16 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">Вишлист не найден</h2>
        <p className="mt-2 text-sm text-neutral-500">Ссылка недействительна или вишлист удалён.</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{wishlist.title}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              от {wishlist.owner.displayName}
            </p>
            {wishlist.description && (
              <p className="mt-2 text-sm text-neutral-700">{wishlist.description}</p>
            )}
            {wishlist.eventDate && (
              <p className="mt-2 flex items-center gap-1 text-sm text-neutral-500">
                <Calendar size={14} />
                {formatDate(wishlist.eventDate)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={role === "owner" ? "reserved" : role === "friend" ? "collecting" : "free"}
            >
              {role === "owner" ? "Владелец" : role === "friend" ? "Друг" : "Гость"}
            </Badge>
            {role === "owner" && (
              <Link
                to={`/app/wishlists/${wishlist.id}`}
                className="rounded-sm px-3 py-1.5 text-sm text-primary hover:bg-primary-soft"
              >
                Управление
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Gifts */}
      {gifts.length === 0 ? (
        <p className="mt-16 text-center text-neutral-500">В этом вишлисте пока нет подарков</p>
      ) : (
        <div className="flex flex-col gap-3">
          {gifts.map((g) => (
            <PublicGiftCard
              key={g.id}
              gift={g}
              role={role}
              onReserve={handleReserve}
              onCancelReservation={handleCancelReservation}
              onContribute={handleContribute}
              onAuthRequired={() => setShowAuth(true)}
            />
          ))}
        </div>
      )}

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default PublicWishlist;
