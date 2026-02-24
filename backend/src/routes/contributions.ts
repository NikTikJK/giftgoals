import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  notFound,
  forbidden,
  badRequest,
  conflict,
} from "../utils/errors.js";

const router = Router();

// ─── Contribute to an expensive gift ───────────────────

const contributeSchema = z.object({
  giftId: z.string().min(1),
  amount: z.number().int().min(1),
});

router.post(
  "/",
  requireAuth,
  validate(contributeSchema),
  async (req, res, next) => {
    try {
      const { giftId, amount } = req.body as z.infer<typeof contributeSchema>;
      const userId = req.userId!;

      const result = await prisma.$transaction(async (tx) => {
        const gift = await tx.gift.findUnique({
          where: { id: giftId },
          include: {
            wishlist: {
              select: { ownerId: true, expensiveThreshold: true },
            },
            contributions: { select: { amount: true } },
          },
        });

        if (!gift) throw notFound("Gift");

        const typed = gift as typeof gift & {
          wishlist: { ownerId: string; expensiveThreshold: number };
          contributions: Array<{ amount: number }>;
        };

        if (typed.wishlist.ownerId === userId) {
          throw forbidden("Cannot contribute to gifts in your own wishlist");
        }
        if (typed.price === null) {
          throw badRequest("Gift has no price — collection is not available");
        }
        if (typed.price < typed.wishlist.expensiveThreshold) {
          throw badRequest(
            "This is a regular gift — use reservation instead",
          );
        }

        const totalCollected = typed.contributions.reduce(
          (s: number, c: { amount: number }) => s + c.amount,
          0,
        );
        const remaining = typed.price - totalCollected;

        if (remaining <= 0) {
          throw conflict("Collection goal already reached");
        }
        if (amount > remaining) {
          throw badRequest(
            `Amount exceeds remaining goal. Maximum allowed: ${remaining}`,
          );
        }

        const contribution = await tx.contribution.create({
          data: { giftId, userId, amount },
        });

        const newTotal = totalCollected + amount;
        if (newTotal >= typed.price!) {
          await tx.notification.create({
            data: {
              userId: typed.wishlist.ownerId,
              type: "COLLECTION_COMPLETE",
              title: "Collection complete",
              body: `Collection for "${typed.title}" has reached its goal!`,
              metadata: { giftId, wishlistId: typed.wishlistId },
            },
          });
        } else {
          await tx.notification.create({
            data: {
              userId: typed.wishlist.ownerId,
              type: "CONTRIBUTION_MADE",
              title: "New contribution",
              body: `Someone contributed to "${typed.title}"`,
              metadata: { giftId, wishlistId: typed.wishlistId },
            },
          });
        }

        return { contribution, totalCollected: newTotal, target: typed.price };
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
