import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, ArrowLeft, ExternalLink } from "lucide-react";
import { wishlistsApi, type Wishlist, type WishlistGift } from "../api/wishlists.ts";
import { giftsApi } from "../api/gifts.ts";
import { useToast } from "../hooks/useToast.tsx";
import { usePolling } from "../hooks/usePolling.ts";
import Button from "../components/ui/Button.tsx";
import Modal from "../components/ui/Modal.tsx";
import GiftForm from "../components/gifts/GiftForm.tsx";
import OwnerGiftCard from "../components/gifts/OwnerGiftCard.tsx";
import { formatDate } from "../utils/format.ts";

const WishlistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();

  const [wishlist, setWishlist] = useState<(Wishlist & { gifts: WishlistGift[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddGift, setShowAddGift] = useState(false);
  const [editingGift, setEditingGift] = useState<WishlistGift | null>(null);
  const [deletingGiftId, setDeletingGiftId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const { wishlist } = await wishlistsApi.get(id);
      setWishlist(wishlist);
    } catch {
      if (loading) addToast("error", "Не удалось загрузить вишлист");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, loading]);

  usePolling(fetchData, { intervalMs: 10_000, enabled: !!id });

  const handleAddGift = async (data: {
    title: string;
    price?: number | null;
    productUrl?: string;
    imageUrl?: string;
    comment?: string;
  }) => {
    if (!wishlist) return;
    await giftsApi.create({ ...data, wishlistId: wishlist.id });
    addToast("success", "Подарок добавлен");
    setShowAddGift(false);
    fetchData();
  };

  const handleEditGift = async (data: {
    title?: string;
    price?: number | null;
    productUrl?: string;
    imageUrl?: string;
    comment?: string;
  }) => {
    if (!editingGift) return;
    await giftsApi.update(editingGift.id, data);
    addToast("success", "Подарок обновлён");
    setEditingGift(null);
    fetchData();
  };

  const handleDeleteGift = async () => {
    if (!deletingGiftId) return;
    try {
      await giftsApi.remove(deletingGiftId);
      addToast("success", "Подарок удалён");
      setDeletingGiftId(null);
      fetchData();
    } catch {
      addToast("error", "Не удалось удалить");
    }
  };

  if (loading) {
    return <p className="mt-12 text-center text-neutral-500">Загрузка...</p>;
  }
  if (!wishlist) {
    return <p className="mt-12 text-center text-neutral-500">Вишлист не найден</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/app/wishlists"
          className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary"
        >
          <ArrowLeft size={14} /> Назад к вишлистам
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{wishlist.title}</h1>
            {wishlist.description && (
              <p className="mt-1 text-sm text-neutral-500">{wishlist.description}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
              {wishlist.eventDate && <span>Событие: {formatDate(wishlist.eventDate)}</span>}
              <span>Порог: {wishlist.expensiveThreshold / 100} ₽</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/w/${wishlist.slug}`)}
              className="inline-flex items-center gap-1 rounded-sm px-3 py-1.5 text-sm text-primary hover:bg-primary-soft"
              title="Копировать публичную ссылку"
            >
              <ExternalLink size={14} /> Ссылка
            </button>
            <Button onClick={() => setShowAddGift(true)}>
              <Plus size={16} /> Подарок
            </Button>
          </div>
        </div>
      </div>

      {wishlist.gifts.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-neutral-500">Желанные подарки появятся здесь</p>
          <Button className="mt-4" onClick={() => setShowAddGift(true)}>
            Добавить первый подарок
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {wishlist.gifts.map((g) => (
            <OwnerGiftCard
              key={g.id}
              gift={g}
              onEdit={() => setEditingGift(g)}
              onDelete={() => setDeletingGiftId(g.id)}
            />
          ))}
        </div>
      )}

      <Modal open={showAddGift} onClose={() => setShowAddGift(false)} title="Добавить подарок">
        <GiftForm
          threshold={wishlist.expensiveThreshold}
          onSubmit={handleAddGift}
          onCancel={() => setShowAddGift(false)}
          submitLabel="Добавить"
        />
      </Modal>

      <Modal open={!!editingGift} onClose={() => setEditingGift(null)} title="Редактировать подарок">
        {editingGift && (
          <GiftForm
            initial={editingGift}
            threshold={wishlist.expensiveThreshold}
            onSubmit={handleEditGift}
            onCancel={() => setEditingGift(null)}
            submitLabel="Сохранить"
          />
        )}
      </Modal>

      <Modal open={!!deletingGiftId} onClose={() => setDeletingGiftId(null)} title="Удалить подарок?">
        <p className="mb-4 text-sm text-neutral-700">
          Резервы и вклады по этому подарку будут отменены.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={handleDeleteGift}>
            Удалить
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setDeletingGiftId(null)}>
            Отмена
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default WishlistDetail;
