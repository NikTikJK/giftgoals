import { useState, type FormEvent } from "react";
import Button from "../ui/Button.tsx";
import Input from "../ui/Input.tsx";
import type { Wishlist } from "../../api/wishlists.ts";

interface WishlistFormProps {
  initial?: Partial<Wishlist>;
  onSubmit: (data: {
    title: string;
    description?: string;
    eventDate?: string;
    expensiveThreshold?: number;
    isPublic?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const WishlistForm = ({ initial, onSubmit, onCancel, submitLabel }: WishlistFormProps) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [eventDate, setEventDate] = useState(
    initial?.eventDate ? initial.eventDate.slice(0, 10) : "",
  );
  const [threshold, setThreshold] = useState(
    String((initial?.expensiveThreshold ?? 500000) / 100),
  );
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
        expensiveThreshold: Math.round(Number(threshold) * 100) || 500000,
        isPublic,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Название"
        required
        maxLength={200}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-700">Описание</label>
        <textarea
          className="rounded-sm border border-neutral-200 px-3 py-2 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          rows={3}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Input
        label="Дата события"
        type="date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
      />
      <Input
        label="Порог «дорогого» подарка (₽)"
        type="number"
        min={0}
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded accent-primary"
        />
        Публичная ссылка включена
      </label>
      <div className="flex gap-3">
        <Button type="submit" isLoading={loading} className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default WishlistForm;
