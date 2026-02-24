import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { optionalAuth } from "../middleware/auth.js";
import { notFound } from "../utils/errors.js";
import { param } from "../utils/params.js";

const router = Router();

interface ContributionRow {
  id: string;
  amount: number;
  userId: string;
}

interface ReservationRow {
  id: string;
  userId: string;
  user: { id: string; displayName: string; avatarUrl: string | null };
}

interface GiftRow {
  id: string;
  title: string;
  price: number | null;
  productUrl: string | null;
  imageUrl: string | null;
  comment: string | null;
  createdAt: Date;
  reservation: ReservationRow | null;
  contributions: ContributionRow[];
}

interface WishlistRow {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date | null;
  slug: string;
  isPublic: boolean;
  ownerId: string;
  expensiveThreshold: number;
  owner: { id: string; displayName: string; avatarUrl: string | null };
  gifts: GiftRow[];
}

// ─── Get public wishlist by slug ───────────────────────

router.get("/:slug", optionalAuth, async (req, res, next) => {
  try {
    const slug = param(req, "slug");
    const raw = await prisma.wishlist.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, displayName: true, avatarUrl: true } },
        gifts: {
          orderBy: { createdAt: "asc" },
          include: {
            reservation: {
              select: {
                id: true,
                userId: true,
                user: {
                  select: { id: true, displayName: true, avatarUrl: true },
                },
              },
            },
            contributions: {
              select: { id: true, amount: true, userId: true },
            },
          },
        },
      },
    });

    const wishlist = raw as unknown as WishlistRow | null;

    if (!wishlist || !wishlist.isPublic) {
      throw notFound("Wishlist");
    }

    const userId = req.userId;
    const isOwner = userId === wishlist.ownerId;
    const isFriend = !!userId && !isOwner;

    const gifts = wishlist.gifts.map((g) => {
      const isExpensive =
        g.price !== null && g.price >= wishlist.expensiveThreshold;
      const totalCollected = g.contributions.reduce(
        (s, c) => s + c.amount,
        0,
      );

      const base = {
        id: g.id,
        title: g.title,
        price: g.price,
        productUrl: g.productUrl,
        imageUrl: g.imageUrl,
        comment: g.comment,
        isExpensive,
        createdAt: g.createdAt,
      };

      if (isExpensive) {
        return {
          ...base,
          status:
            g.price !== null && totalCollected >= g.price
              ? "collection_complete"
              : "collection_open",
          totalCollected,
          target: g.price,
          contributionCount: g.contributions.length,
          canContribute: isFriend && g.price !== null && totalCollected < g.price,
        };
      }

      const reserved = !!g.reservation;
      return {
        ...base,
        status: reserved ? "reserved" : "free",
        reservedBy:
          isFriend && g.reservation
            ? {
                displayName: g.reservation.user.displayName,
                avatarUrl: g.reservation.user.avatarUrl,
              }
            : null,
        reservationId:
          isFriend && g.reservation?.userId === userId
            ? g.reservation.id
            : null,
        canReserve: isFriend && !reserved,
      };
    });

    res.json({
      wishlist: {
        id: wishlist.id,
        title: wishlist.title,
        description: wishlist.description,
        eventDate: wishlist.eventDate,
        slug: wishlist.slug,
        expensiveThreshold: wishlist.expensiveThreshold,
        owner: {
          displayName: wishlist.owner.displayName,
          avatarUrl: wishlist.owner.avatarUrl,
        },
      },
      gifts,
      role: isOwner ? "owner" : isFriend ? "friend" : "guest",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
