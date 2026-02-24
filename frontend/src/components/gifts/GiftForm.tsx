import { useState, type FormEvent } from "react";
import Button from "../ui/Button.tsx";
import Input from "../ui/Input.tsx";

interface GiftFormData {
  title: string;
  price?: number | null;
  productUrl?: string;
  imageUrl?: string;
  comment?: string;
}

interface GiftFormInitial {
  title?: string;
  price?: number | null;
  productUrl?: string | null;
  imageUrl?: string | null;
  comment?: string | null;
}

interface GiftFormProps {
  initial?: GiftFormInitial;
  threshold: number;
  onSubmit: (data: GiftFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const GiftForm = ({ initial, threshold, onSubmit, onCancel, submitLabel }: GiftFormProps) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [price, setPrice] = useState(
    initial?.price != null ? String(initial.price / 100) : "",
  );
  const [productUrl, setProductUrl] = useState(initial?.productUrl ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [loading, setLoading] = useState(false);

  const priceKopecks = price ? Math.round(Number(price) * 100) : null;
  const isExpensive = priceKopecks !== null && priceKopecks >= threshold;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        price: priceKopecks,
        productUrl: productUrl || undefined,
        imageUrl: imageUrl || undefined,
        comment: comment || undefined,
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
        maxLength={300}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Примерная цена (₽)"
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      {priceKopecks !== null && (
        <p className="text-xs text-neutral-500">
          Тип:{" "}
          <span className={isExpensive ? "font-medium text-accent" : ""}>
            {isExpensive ? "дорогой (сбор)" : "обычный (резерв)"}
          </span>
          {" · "}Порог: {threshold / 100} ₽
        </p>
      )}
      <Input
        label="Ссылка на товар"
        type="url"
        value={productUrl}
        onChange={(e) => setProductUrl(e.target.value)}
      />
      <Input
        label="Ссылка на изображение"
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-700">Комментарий</label>
        <textarea
          className="rounded-sm border border-neutral-200 px-3 py-2 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          rows={2}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
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

export default GiftForm;
