import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { notFound, forbidden, limitReached } from "../utils/errors.js";
import { param } from "../utils/params.js";

const router = Router();

const MAX_GIFTS_PER_WISHLIST = 200;

const ensureOwner = async (wishlistId: string, userId: string) => {
  const wl = await prisma.wishlist.findUnique({
    where: { id: wishlistId },
    select: { ownerId: true, expensiveThreshold: true },
  });
  if (!wl) throw notFound("Wishlist");
  if (wl.ownerId !== userId) throw forbidden();
  return wl;
};

// ─── List gifts for a wishlist (owner) ─────────────────

router.get(
  "/wishlist/:wishlistId",
  requireAuth,
  async (req, res, next) => {
    try {
      const wishlistId = param(req, "wishlistId");
      const wl = await ensureOwner(wishlistId, req.userId!);

      const gifts = await prisma.gift.findMany({
        where: { wishlistId },
        orderBy: { createdAt: "asc" },
        include: {
          reservation: { select: { id: true, createdAt: true } },
          contributions: { select: { id: true, amount: true } },
        },
      });

      const typed = gifts as Array<
        (typeof gifts)[number] & {
          reservation: { id: string; createdAt: Date } | null;
          contributions: Array<{ id: string; amount: number }>;
        }
      >;

      const result = typed.map((g) => ({
        id: g.id,
        wishlistId: g.wishlistId,
        title: g.title,
        price: g.price,
        productUrl: g.productUrl,
        imageUrl: g.imageUrl,
        comment: g.comment,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        isExpensive: g.price !== null && g.price >= wl.expensiveThreshold,
        isReserved: !!g.reservation,
        totalCollected: g.contributions.reduce((s: number, c: { amount: number }) => s + c.amount, 0),
        contributionCount: g.contributions.length,
        reservation: g.reservation
          ? { id: g.reservation.id, createdAt: g.reservation.createdAt }
          : null,
      }));

      res.json({ gifts: result });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Create gift ───────────────────────────────────────

const createSchema = z.object({
  wishlistId: z.string().min(1),
  title: z.string().min(1).max(300),
  price: z.number().int().min(0).nullable().optional(),
  productUrl: z.string().url().max(2048).optional(),
  imageUrl: z.string().url().max(2048).optional(),
  comment: z.string().max(1000).optional(),
});

router.post("/", requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createSchema>;
    await ensureOwner(data.wishlistId, req.userId!);

    const count = await prisma.gift.count({
      where: { wishlistId: data.wishlistId },
    });
    if (count >= MAX_GIFTS_PER_WISHLIST) {
      throw limitReached(
        `Maximum ${MAX_GIFTS_PER_WISHLIST} gifts per wishlist`,
      );
    }

    const gift = await prisma.gift.create({ data });
    res.status(201).json({ gift });
  } catch (err) {
    next(err);
  }
});

// ─── Update gift ───────────────────────────────────────

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  price: z.number().int().min(0).nullable().optional(),
  productUrl: z.string().url().max(2048).nullable().optional(),
  imageUrl: z.string().url().max(2048).nullable().optional(),
  comment: z.string().max(1000).nullable().optional(),
});

router.patch(
  "/:id",
  requireAuth,
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const id = param(req, "id");
      const gift = await prisma.gift.findUnique({
        where: { id },
        include: { wishlist: { select: { ownerId: true } } },
      });
      if (!gift) throw notFound("Gift");

      const typed = gift as typeof gift & {
        wishlist: { ownerId: string };
      };
      if (typed.wishlist.ownerId !== req.userId!) throw forbidden();

      const updated = await prisma.gift.update({
        where: { id },
        data: req.body as z.infer<typeof updateSchema>,
      });
      res.json({ gift: updated });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Delete gift ───────────────────────────────────────

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = param(req, "id");
    const gift = await prisma.gift.findUnique({
      where: { id },
      include: { wishlist: { select: { ownerId: true } } },
    });
    if (!gift) throw notFound("Gift");

    const typed = gift as typeof gift & {
      wishlist: { ownerId: string };
    };
    if (typed.wishlist.ownerId !== req.userId!) throw forbidden();

    await prisma.gift.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
