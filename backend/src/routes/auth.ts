import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";
import { conflict, unauthorized } from "../utils/errors.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../config/env.js";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

// ─── Register ──────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  displayName: z.string().max(100).optional(),
});

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body as z.infer<
      typeof registerSchema
    >;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw conflict("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: displayName ?? email.split("@")[0],
      },
    });

    const token = signToken(user.id);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Login ─────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      throw unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw unauthorized("Invalid email or password");
    }

    const token = signToken(user.id);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Google OAuth ──────────────────────────────────────

const googleSchema = z.object({
  googleId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

router.post(
  "/google",
  validate(googleSchema),
  async (req, res, next) => {
    try {
      const { googleId, email, displayName, avatarUrl } = req.body as z.infer<
        typeof googleSchema
      >;

      let user = await prisma.user.findUnique({ where: { googleId } });

      if (!user) {
        user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId, avatarUrl: avatarUrl ?? user.avatarUrl },
          });
        } else {
          user = await prisma.user.create({
            data: {
              email,
              googleId,
              displayName: displayName ?? email.split("@")[0],
              avatarUrl,
            },
          });
        }
      }

      const token = signToken(user.id);
      res.cookie("token", token, COOKIE_OPTIONS);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Logout ────────────────────────────────────────────

router.post("/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ ok: true });
});

// ─── Current user ──────────────────────────────────────

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw unauthorized("User not found");
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
