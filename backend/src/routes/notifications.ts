import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { notFound, forbidden } from "../utils/errors.js";
import { param } from "../utils/params.js";

const router = Router();

// ─── List notifications ────────────────────────────────

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId!, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

// ─── Mark single notification as read ──────────────────

router.patch("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const id = param(req, "id");
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw notFound("Notification");
    if (notification.userId !== req.userId!) throw forbidden();

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ─── Mark all notifications as read ────────────────────

router.post("/read-all", requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId!, isRead: false },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
