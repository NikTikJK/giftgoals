import { useState } from "react";
import { ExternalLink, User } from "lucide-react";
import Badge from "../ui/Badge.tsx";
import Button from "../ui/Button.tsx";
import Input from "../ui/Input.tsx";
import ProgressBar from "../ui/ProgressBar.tsx";
import { formatPrice } from "../../utils/format.ts";
import type { PublicGift } from "../../api/public.ts";

interface PublicGiftCardProps {
  gift: PublicGift;
  role: "guest" | "friend" | "owner";
  onReserve: (giftId: string) => Promise<void>;
  onCancelReservation: (reservationId: string) => Promise<void>;
  onContribute: (giftId: string, amount: number) => Promise<void>;
  onAuthRequired: () => void;
}

const PublicGiftCard = ({
  gift,
  role,
  onReserve,
  onCancelReservation,
  onContribute,
  onAuthRequired,
}: PublicGiftCardProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    if (role === "guest") return onAuthRequired();
    setLoading(true);
    try {
      await onReserve(gift.id);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (role === "guest") return onAuthRequired();
    const kopecks = Math.round(Number(amount) * 100);
    if (kopecks <= 0) return;
    setLoading(true);
    try {
      await onContribute(gift.id, kopecks);
      setAmount("");
    } finally {
      setLoading(false);
    }
  };

  const remaining = gift.target != null ? gift.target - (gift.totalCollected ?? 0) : 0;
  const maxRubles = remaining / 100;

  const statusBadge = () => {
    switch (gift.status) {
      case "free":
        return <Badge variant="free">Свободен</Badge>;
      case "reserved":
        return <Badge variant="reserved">Зарезервирован</Badge>;
      case "collection_open":
        return <Badge variant="collecting">Сбор открыт</Badge>;
      case "collection_complete":
        return <Badge variant="complete">Сбор завершён</Badge>;
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        {gift.imageUrl && (
          <img
            src={gift.imageUrl}
            alt={gift.title}
            className="h-24 w-24 flex-shrink-0 rounded-sm object-cover"
          />
        )}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-neutral-900">{gift.title}</h4>
            {statusBadge()}
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            {gift.price !== null && <span>{formatPrice(gift.price)} ₽</span>}
            {gift.productUrl && (
              <a
                href={gift.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                <ExternalLink size={12} /> Ссылка
              </a>
            )}
          </div>
          {gift.comment && <p className="text-xs text-neutral-500">{gift.comment}</p>}

          {/* Reserved by info (friends only) */}
          {gift.status === "reserved" && gift.reservedBy && role === "friend" && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <User size={12} />
              <span>{gift.reservedBy.displayName}</span>
            </div>
          )}

          {/* Expensive gift progress */}
          {gift.isExpensive && gift.target != null && (
            <ProgressBar
              current={gift.totalCollected ?? 0}
              target={gift.target}
              complete={gift.status === "collection_complete"}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      {role !== "owner" && (
        <div className="mt-3 flex items-center gap-2">
          {!gift.isExpensive && gift.status === "free" && (
            <Button
              variant="primary"
              className="text-sm"
              isLoading={loading}
              onClick={handleReserve}
            >
              Зарезервировать
            </Button>
          )}
          {!gift.isExpensive && gift.reservationId && role === "friend" && (
            <Button
              variant="secondary"
              className="text-sm"
              isLoading={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  await onCancelReservation(gift.reservationId!);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Отменить резерв
            </Button>
          )}
          {gift.isExpensive && gift.canContribute && (
            <div className="flex items-end gap-2">
              <Input
                type="number"
                min={1}
                max={maxRubles}
                placeholder={`до ${formatPrice(remaining)} ₽`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-40"
              />
              <Button
                variant="primary"
                className="text-sm"
                isLoading={loading}
                onClick={handleContribute}
                disabled={!amount || Number(amount) <= 0}
              >
                Вложить
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicGiftCard;
