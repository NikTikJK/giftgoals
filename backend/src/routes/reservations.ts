import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  notFound,
  forbidden,
  conflict,
  badRequest,
} from "../utils/errors.js";
import { param } from "../utils/params.js";

const router = Router();

// ─── Reserve a gift ────────────────────────────────────

const reserveSchema = z.object({
  giftId: z.string().min(1),
});

router.post(
  "/",
  requireAuth,
  validate(reserveSchema),
  async (req, res, next) => {
    try {
      const { giftId } = req.body as z.infer<typeof reserveSchema>;
      const userId = req.userId!;

      const gift = await prisma.gift.findUnique({
        where: { id: giftId },
        include: {
          wishlist: {
            select: { ownerId: true, expensiveThreshold: true },
          },
          reservation: true,
        },
      });

      if (!gift) throw notFound("Gift");

      const typed = gift as typeof gift & {
        wishlist: { ownerId: string; expensiveThreshold: number };
        reservation: { id: string } | null;
      };

      if (typed.wishlist.ownerId === userId) {
        throw forbidden("Cannot reserve gifts in your own wishlist");
      }
      if (typed.price !== null && typed.price >= typed.wishlist.expensiveThreshold) {
        throw badRequest(
          "This is an expensive gift — use group collection instead",
        );
      }
      if (typed.reservation) {
        throw conflict("This gift is already reserved");
      }

      const reservation = await prisma.reservation.create({
        data: { giftId, userId },
      });

      await prisma.notification.create({
        data: {
          userId: typed.wishlist.ownerId,
          type: "RESERVATION_MADE",
          title: "Gift reserved",
          body: `Someone reserved "${typed.title}"`,
          metadata: { giftId, wishlistId: typed.wishlistId },
        },
      });

      res.status(201).json({ reservation });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Cancel reservation ────────────────────────────────

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = param(req, "id");
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        gift: {
          include: {
            wishlist: { select: { ownerId: true, eventDate: true } },
          },
        },
      },
    });

    if (!reservation) throw notFound("Reservation");

    const typed = reservation as typeof reservation & {
      gift: {
        title: string;
        wishlistId: string;
        wishlist: { ownerId: string; eventDate: Date | null };
      };
    };

    if (typed.userId !== req.userId!) throw forbidden();

    const eventDate = typed.gift.wishlist.eventDate;
    if (eventDate && new Date() > eventDate) {
      throw badRequest("Cannot cancel reservation after the event date");
    }

    await prisma.reservation.delete({ where: { id } });

    await prisma.notification.create({
      data: {
        userId: typed.gift.wishlist.ownerId,
        type: "RESERVATION_CANCELLED",
        title: "Reservation cancelled",
        body: `Reservation for "${typed.gift.title}" was cancelled`,
        metadata: {
          giftId: typed.giftId,
          wishlistId: typed.gift.wishlistId,
        },
      },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
