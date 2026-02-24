import { api } from "./client.ts";

export interface Wishlist {
  id: string;
  ownerId: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  slug: string;
  isPublic: boolean;
  expensiveThreshold: number;
  createdAt: string;
  updatedAt: string;
  _count?: { gifts: number };
}

export interface WishlistGift {
  id: string;
  wishlistId: string;
  title: string;
  price: number | null;
  productUrl?: string | null;
  imageUrl?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  isExpensive: boolean;
  isReserved: boolean;
  totalCollected: number;
  contributionCount: number;
  reservation: { id: string; createdAt: string } | null;
}

interface WishlistListResponse {
  wishlists: Wishlist[];
}

interface WishlistDetailResponse {
  wishlist: Wishlist & { gifts: WishlistGift[] };
  giftCount: number;
}

interface WishlistMutationResponse {
  wishlist: Wishlist;
}

export const wishlistsApi = {
  list: () => api.get<WishlistListResponse>("/wishlists"),

  get: (id: string) => api.get<WishlistDetailResponse>(`/wishlists/${id}`),

  create: (data: {
    title: string;
    description?: string;
    eventDate?: string;
    expensiveThreshold?: number;
    isPublic?: boolean;
  }) => api.post<WishlistMutationResponse>("/wishlists", data),

  update: (
    id: string,
    data: {
      title?: string;
      description?: string | null;
      eventDate?: string | null;
      expensiveThreshold?: number;
      isPublic?: boolean;
    },
  ) => api.patch<WishlistMutationResponse>(`/wishlists/${id}`, data),

  remove: (id: string) => api.delete<{ ok: boolean }>(`/wishlists/${id}`),
};
