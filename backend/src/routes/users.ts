import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { badRequest, notFound } from "../utils/errors.js";

const router = Router();

// ─── Get profile ───────────────────────────────────────

router.get("/profile", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        googleId: true,
        createdAt: true,
      },
    });
    if (!user) throw notFound("User");
    res.json({ user: { ...user, hasGoogle: !!user.googleId, googleId: undefined } });
  } catch (err) {
    next(err);
  }
});

// ─── Update profile ────────────────────────────────────

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
});

router.patch(
  "/profile",
  requireAuth,
  validate(updateProfileSchema),
  async (req, res, next) => {
    try {
      const data = req.body as z.infer<typeof updateProfileSchema>;
      const user = await prisma.user.update({
        where: { id: req.userId! },
        data,
        select: { id: true, email: true, displayName: true, avatarUrl: true },
      });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Change password ───────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(128),
});

router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body as z.infer<
        typeof changePasswordSchema
      >;

      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
      });
      if (!user?.passwordHash) {
        throw badRequest(
          "Cannot change password for account without password",
        );
      }

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) throw badRequest("Current password is incorrect");

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: req.userId! },
        data: { passwordHash },
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
