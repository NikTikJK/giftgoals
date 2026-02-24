import { api } from "./client.ts";

export interface Reservation {
  id: string;
  giftId: string;
  userId: string;
  createdAt: string;
}

export const reservationsApi = {
  create: (giftId: string) =>
    api.post<{ reservation: Reservation }>("/reservations", { giftId }),

  cancel: (id: string) =>
    api.delete<{ ok: boolean }>(`/reservations/${id}`),
};
