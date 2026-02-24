import { Link } from "react-router-dom";
import { Calendar, ExternalLink, Trash2, Edit } from "lucide-react";
import type { Wishlist } from "../../api/wishlists.ts";
import { formatDate } from "../../utils/format.ts";

interface WishlistCardProps {
  wishlist: Wishlist;
  onDelete: (id: string) => void;
  onEdit: (wishlist: Wishlist) => void;
}

const WishlistCard = ({ wishlist, onDelete, onEdit }: WishlistCardProps) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/w/${wishlist.slug}`);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-md shadow-black/30 transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/app/wishlists/${wishlist.id}`} className="group flex-1">
          <h3 className="text-base font-semibold text-neutral-100 group-hover:text-primary">
            {wishlist.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyLink}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-primary"
            aria-label="Копировать публичную ссылку"
            title="Копировать ссылку"
          >
            <ExternalLink size={16} />
          </button>
          <button
            onClick={() => onEdit(wishlist)}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-primary"
            aria-label="Редактировать"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(wishlist.id)}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-danger"
            aria-label="Удалить"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {wishlist.description && (
        <p className="mt-1 text-sm text-neutral-400 line-clamp-2">{wishlist.description}</p>
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
        {wishlist.eventDate && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(wishlist.eventDate)}
          </span>
        )}
        <span>{wishlist._count?.gifts ?? 0} подарков</span>
      </div>
    </div>
  );
};

export default WishlistCard;
