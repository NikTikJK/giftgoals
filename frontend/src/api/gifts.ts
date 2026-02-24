import { api } from "./client.ts";

export interface Gift {
  id: string;
  wishlistId: string;
  title: string;
  price: number | null;
  productUrl?: string | null;
  imageUrl?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GiftMutationResponse {
  gift: Gift;
}

export const giftsApi = {
  create: (data: {
    wishlistId: string;
    title: string;
    price?: number | null;
    productUrl?: string;
    imageUrl?: string;
    comment?: string;
  }) => api.post<GiftMutationResponse>("/gifts", data),

  update: (
    id: string,
    data: {
      title?: string;
      price?: number | null;
      productUrl?: string | null;
      imageUrl?: string | null;
      comment?: string | null;
    },
  ) => api.patch<GiftMutationResponse>(`/gifts/${id}`, data),

  remove: (id: string) => api.delete<{ ok: boolean }>(`/gifts/${id}`),
};
