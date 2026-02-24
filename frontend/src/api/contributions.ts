import { api } from "./client.ts";

export interface ContributionResult {
  contribution: {
    id: string;
    giftId: string;
    userId: string;
    amount: number;
    createdAt: string;
  };
  totalCollected: number;
  target: number;
}

export const contributionsApi = {
  create: (giftId: string, amount: number) =>
    api.post<ContributionResult>("/contributions", { giftId, amount }),
};
