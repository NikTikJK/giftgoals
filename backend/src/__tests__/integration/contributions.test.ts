import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import {
  TEST_USER,
  OTHER_USER,
  TEST_WISHLIST,
  TEST_GIFT_EXPENSIVE,
  TEST_GIFT_REGULAR,
  authCookie,
} from "../helpers.js";

const mockPrisma = vi.mocked(prisma);

beforeEach(() => {
  vi.clearAllMocks();
});

const makeTxMock = (giftData: any) => {
  return (cb: (tx: any) => Promise<any>) => {
    const tx = {
      gift: { findUnique: vi.fn().mockResolvedValue(giftData) },
      contribution: { create: vi.fn().mockResolvedValue({ id: "contrib-1", giftId: giftData?.id, userId: OTHER_USER.id, amount: 100000, createdAt: new Date() }) },
      notification: { create: vi.fn().mockResolvedValue({}) },
    };
    return cb(tx);
  };
};

describe("POST /api/contributions", () => {
  it("contributes to an expensive gift", async () => {
    const giftData = {
      ...TEST_GIFT_EXPENSIVE,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      contributions: [],
    };

    mockPrisma.$transaction.mockImplementation(makeTxMock(giftData) as any);

    const res = await request(app)
      .post("/api/contributions")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: TEST_GIFT_EXPENSIVE.id, amount: 100000 });

    expect(res.status).toBe(201);
    expect(res.body.contribution).toBeDefined();
  });

  it("prevents contribution to own gift", async () => {
    const giftData = {
      ...TEST_GIFT_EXPENSIVE,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      contributions: [],
    };

    mockPrisma.$transaction.mockImplementation(makeTxMock(giftData) as any);

    const res = await request(app)
      .post("/api/contributions")
      .set("Cookie", authCookie(TEST_USER.id))
      .send({ giftId: TEST_GIFT_EXPENSIVE.id, amount: 100000 });

    expect(res.status).toBe(403);
  });

  it("prevents contribution to a regular (non-expensive) gift", async () => {
    const giftData = {
      ...TEST_GIFT_REGULAR,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      contributions: [],
    };

    mockPrisma.$transaction.mockImplementation(makeTxMock(giftData) as any);

    const res = await request(app)
      .post("/api/contributions")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: TEST_GIFT_REGULAR.id, amount: 50000 });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/regular/i);
  });

  it("prevents overfunding", async () => {
    const giftData = {
      ...TEST_GIFT_EXPENSIVE,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      contributions: [{ amount: 6900000 }],
    };

    mockPrisma.$transaction.mockImplementation(makeTxMock(giftData) as any);

    const res = await request(app)
      .post("/api/contributions")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: TEST_GIFT_EXPENSIVE.id, amount: 200000 });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/remaining/i);
  });

  it("prevents contribution when goal already reached", async () => {
    const giftData = {
      ...TEST_GIFT_EXPENSIVE,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      contributions: [{ amount: 7000000 }],
    };

    mockPrisma.$transaction.mockImplementation(makeTxMock(giftData) as any);

    const res = await request(app)
      .post("/api/contributions")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: TEST_GIFT_EXPENSIVE.id, amount: 100000 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("returns 404 for non-existent gift", async () => {
    mockPrisma.$transaction.mockImplementation(makeTxMock(null) as any);

    const res = await request(app)
      .post("/api/contributions")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: "nonexistent", amount: 100000 });

    expect(res.status).toBe(404);
  });

  it("returns 400 for zero amount", async () => {
    const res = await request(app)
      .post("/api/contributions")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: TEST_GIFT_EXPENSIVE.id, amount: 0 });

    expect(res.status).toBe(400);
  });
});
