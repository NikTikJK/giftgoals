import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { notFound, forbidden, limitReached } from "../utils/errors.js";
import { generateSlug } from "../utils/slug.js";
import { param } from "../utils/params.js";

const router = Router();

const MAX_WISHLISTS_PER_USER = 50;

// ─── List own wishlists ────────────────────────────────

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const wishlists = await prisma.wishlist.findMany({
      where: { ownerId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { gifts: true } },
      },
    });
    res.json({ wishlists });
  } catch (err) {
    next(err);
  }
});

// ─── Get single wishlist (owner) ───────────────────────

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = param(req, "id");
    const wishlist = await prisma.wishlist.findUnique({
      where: { id },
      include: {
        gifts: {
          orderBy: { createdAt: "asc" },
          include: {
            reservation: { select: { id: true, createdAt: true } },
            contributions: { select: { id: true, amount: true } },
          },
        },
        _count: { select: { gifts: true } },
      },
    });
    if (!wishlist) throw notFound("Wishlist");
    if (wishlist.ownerId !== req.userId!) throw forbidden();

    const wl = wishlist as typeof wishlist & {
      gifts: Array<
        (typeof wishlist)["gifts"][number] & {
          reservation: { id: string; createdAt: Date } | null;
          contributions: Array<{ id: string; amount: number }>;
        }
      >;
      _count: { gifts: number };
    };

    const giftsWithStats = wl.gifts.map((g) => ({
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

    res.json({
      wishlist: {
        id: wl.id,
        ownerId: wl.ownerId,
        title: wl.title,
        description: wl.description,
        eventDate: wl.eventDate,
        slug: wl.slug,
        isPublic: wl.isPublic,
        expensiveThreshold: wl.expensiveThreshold,
        createdAt: wl.createdAt,
        updatedAt: wl.updatedAt,
        gifts: giftsWithStats,
      },
      giftCount: wl._count.gifts,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Create wishlist ───────────────────────────────────

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  eventDate: z.string().datetime().optional(),
  expensiveThreshold: z.number().int().min(0).optional(),
  isPublic: z.boolean().optional(),
});

router.post("/", requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const count = await prisma.wishlist.count({
      where: { ownerId: req.userId! },
    });
    if (count >= MAX_WISHLISTS_PER_USER) {
      throw limitReached(
        `Maximum ${MAX_WISHLISTS_PER_USER} wishlists per account`,
      );
    }

    const data = req.body as z.infer<typeof createSchema>;
    const slug = generateSlug(data.title);

    const wishlist = await prisma.wishlist.create({
      data: {
        ownerId: req.userId!,
        title: data.title,
        description: data.description,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        expensiveThreshold: data.expensiveThreshold ?? 500000,
        isPublic: data.isPublic ?? true,
        slug,
      },
    });

    res.status(201).json({ wishlist });
  } catch (err) {
    next(err);
  }
});

// ─── Update wishlist ───────────────────────────────────

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  eventDate: z.string().datetime().nullable().optional(),
  expensiveThreshold: z.number().int().min(0).optional(),
  isPublic: z.boolean().optional(),
});

router.patch(
  "/:id",
  requireAuth,
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const id = param(req, "id");
      const wishlist = await prisma.wishlist.findUnique({ where: { id } });
      if (!wishlist) throw notFound("Wishlist");
      if (wishlist.ownerId !== req.userId!) throw forbidden();

      const data = req.body as z.infer<typeof updateSchema>;
      const updated = await prisma.wishlist.update({
        where: { id },
        data: {
          ...data,
          eventDate:
            data.eventDate === null
              ? null
              : data.eventDate
                ? new Date(data.eventDate)
                : undefined,
        },
      });

      res.json({ wishlist: updated });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Delete wishlist ───────────────────────────────────

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = param(req, "id");
    const wishlist = await prisma.wishlist.findUnique({ where: { id } });
    if (!wishlist) throw notFound("Wishlist");
    if (wishlist.ownerId !== req.userId!) throw forbidden();

    await prisma.wishlist.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
