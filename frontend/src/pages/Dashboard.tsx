import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { wishlistsApi, type Wishlist } from "../api/wishlists.ts";
import { useToast } from "../hooks/useToast.tsx";
import { usePolling } from "../hooks/usePolling.ts";
import Button from "../components/ui/Button.tsx";
import Modal from "../components/ui/Modal.tsx";
import WishlistCard from "../components/wishlists/WishlistCard.tsx";
import WishlistForm from "../components/wishlists/WishlistForm.tsx";

const Dashboard = () => {
  const { addToast } = useToast();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Wishlist | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchWishlists = useCallback(async () => {
    try {
      const { wishlists } = await wishlistsApi.list();
      setWishlists(wishlists);
    } catch {
      if (loading) addToast("error", "Не удалось загрузить вишлисты");
    } finally {
      setLoading(false);
    }
  }, [addToast, loading]);

  usePolling(fetchWishlists, { intervalMs: 15_000 });

  const handleCreate = async (data: Parameters<typeof wishlistsApi.create>[0]) => {
    await wishlistsApi.create(data);
    addToast("success", "Вишлист создан");
    setShowCreate(false);
    fetchWishlists();
  };

  const handleUpdate = async (data: Parameters<typeof wishlistsApi.create>[0]) => {
    if (!editing) return;
    await wishlistsApi.update(editing.id, data);
    addToast("success", "Вишлист обновлён");
    setEditing(null);
    fetchWishlists();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await wishlistsApi.remove(deleteId);
      addToast("success", "Вишлист удалён");
      setDeleteId(null);
      fetchWishlists();
    } catch {
      addToast("error", "Не удалось удалить");
    }
  };

  if (loading) {
    return <p className="mt-12 text-center text-neutral-400">Загрузка...</p>;
  }

  return (
    <div className="text-neutral-100">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-50">Мои вишлисты</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Создать
        </Button>
      </div>

      {wishlists.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-neutral-400">У вас пока нет вишлистов</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            Создать первый вишлист
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {wishlists.map((w) => (
            <WishlistCard
              key={w.id}
              wishlist={w}
              onDelete={setDeleteId}
              onEdit={setEditing}
            />
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Новый вишлист">
        <WishlistForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Создать"
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Редактировать вишлист">
        {editing && (
          <WishlistForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Сохранить"
          />
        )}
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Удалить вишлист?">
        <p className="mb-4 text-sm text-neutral-300">
          Все подарки, резервы и вклады будут удалены безвозвратно.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={handleDelete}>
            Удалить
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>
            Отмена
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
