import { Edit, Trash2, ExternalLink } from "lucide-react";
import Badge from "../ui/Badge.tsx";
import ProgressBar from "../ui/ProgressBar.tsx";
import { formatPrice } from "../../utils/format.ts";
import type { WishlistGift } from "../../api/wishlists.ts";

interface OwnerGiftCardProps {
  gift: WishlistGift;
  onEdit: () => void;
  onDelete: () => void;
}

const OwnerGiftCard = ({ gift, onEdit, onDelete }: OwnerGiftCardProps) => {
  const statusBadge = () => {
    if (gift.isExpensive) {
      const complete = gift.price !== null && gift.totalCollected >= gift.price;
      return complete ? (
        <Badge variant="complete">Сбор завершён</Badge>
      ) : (
        <Badge variant="collecting">Сбор открыт</Badge>
      );
    }
    return gift.isReserved ? (
      <Badge variant="reserved">Зарезервирован</Badge>
    ) : (
      <Badge variant="free">Свободен</Badge>
    );
  };

  return (
    <div className="flex gap-4 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm shadow-black/30">
      {gift.imageUrl && (
        <img
          src={gift.imageUrl}
          alt={gift.title}
          className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-neutral-100">{gift.title}</h4>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-primary"
              aria-label="Редактировать подарок"
            >
              <Edit size={15} />
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-danger"
              aria-label="Удалить подарок"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
          {gift.price !== null && <span>{formatPrice(gift.price)} ₽</span>}
          {statusBadge()}
        </div>
        {gift.productUrl && (
          <a
            href={gift.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink size={12} /> Ссылка на товар
          </a>
        )}
        {gift.comment && <p className="text-xs text-neutral-400">{gift.comment}</p>}
        {gift.isExpensive && gift.price !== null && (
          <div className="mt-1">
            <ProgressBar
              current={gift.totalCollected}
              target={gift.price}
              complete={gift.totalCollected >= gift.price}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerGiftCard;
