import { api } from "./client.ts";

export interface PublicGift {
  id: string;
  title: string;
  price: number | null;
  productUrl?: string | null;
  imageUrl?: string | null;
  comment?: string | null;
  isExpensive: boolean;
  createdAt: string;
  status: "free" | "reserved" | "collection_open" | "collection_complete";
  reservedBy?: { displayName: string; avatarUrl: string | null } | null;
  reservationId?: string | null;
  canReserve?: boolean;
  totalCollected?: number;
  target?: number | null;
  contributionCount?: number;
  canContribute?: boolean;
}

export interface PublicWishlist {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  slug: string;
  expensiveThreshold: number;
  owner: { displayName: string; avatarUrl: string | null };
}

interface PublicWishlistResponse {
  wishlist: PublicWishlist;
  gifts: PublicGift[];
  role: "guest" | "friend" | "owner";
}

export const publicApi = {
  getBySlug: (slug: string) =>
    api.get<PublicWishlistResponse>(`/w/${slug}`),
};
