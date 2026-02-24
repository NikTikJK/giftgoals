import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import {
  TEST_USER,
  OTHER_USER,
  TEST_WISHLIST,
  TEST_GIFT_REGULAR,
  TEST_GIFT_EXPENSIVE,
  authCookie,
} from "../helpers.js";

const mockPrisma = vi.mocked(prisma);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/reservations", () => {
  it("reserves a regular gift as friend", async () => {
    mockPrisma.gift.findUnique.mockResolvedValue({
      ...TEST_GIFT_REGULAR,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      reservation: null,
    } as any);
    mockPrisma.reservation.create.mockResolvedValue({
      id: "res-1",
      giftId: TEST_GIFT_REGULAR.id,
      userId: OTHER_USER.id,
      createdAt: new Date(),
    } as any);
    mockPrisma.notification.create.mockResolvedValue({} as any);

    const res = await request(app)
      .post("/api/reservations")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: TEST_GIFT_REGULAR.id });

    expect(res.status).toBe(201);
    expect(res.body.reservation.id).toBe("res-1");
  });

  it("prevents owner from reserving own gift", async () => {
    mockPrisma.gift.findUnique.mockResolvedValue({
      ...TEST_GIFT_REGULAR,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      reservation: null,
    } as any);

    const res = await request(app)
      .post("/api/reservations")
      .set("Cookie", authCookie(TEST_USER.id))
      .send({ giftId: TEST_GIFT_REGULAR.id });

    expect(res.status).toBe(403);
  });

  it("prevents reserving an expensive gift", async () => {
    mockPrisma.gift.findUnique.mockResolvedValue({
      ...TEST_GIFT_EXPENSIVE,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      reservation: null,
    } as any);

    const res = await request(app)
      .post("/api/reservations")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: TEST_GIFT_EXPENSIVE.id });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/expensive/i);
  });

  it("prevents double reservation (conflict)", async () => {
    mockPrisma.gift.findUnique.mockResolvedValue({
      ...TEST_GIFT_REGULAR,
      wishlist: {
        ownerId: TEST_USER.id,
        expensiveThreshold: TEST_WISHLIST.expensiveThreshold,
      },
      reservation: { id: "existing-res" },
    } as any);

    const res = await request(app)
      .post("/api/reservations")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: TEST_GIFT_REGULAR.id });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("returns 404 for non-existent gift", async () => {
    mockPrisma.gift.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/reservations")
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ giftId: "nonexistent" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/reservations/:id", () => {
  it("cancels own reservation", async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res-1",
      giftId: TEST_GIFT_REGULAR.id,
      userId: OTHER_USER.id,
      createdAt: new Date(),
      gift: {
        title: "Book",
        wishlistId: TEST_WISHLIST.id,
        wishlist: { ownerId: TEST_USER.id, eventDate: null },
      },
    } as any);
    mockPrisma.reservation.delete.mockResolvedValue({} as any);
    mockPrisma.notification.create.mockResolvedValue({} as any);

    const res = await request(app)
      .delete("/api/reservations/res-1")
      .set("Cookie", authCookie(OTHER_USER.id));

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("prevents cancelling someone else's reservation", async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res-1",
      giftId: TEST_GIFT_REGULAR.id,
      userId: OTHER_USER.id,
      createdAt: new Date(),
      gift: {
        title: "Book",
        wishlistId: TEST_WISHLIST.id,
        wishlist: { ownerId: TEST_USER.id, eventDate: null },
      },
    } as any);

    const res = await request(app)
      .delete("/api/reservations/res-1")
      .set("Cookie", authCookie(TEST_USER.id));

    expect(res.status).toBe(403);
  });

  it("prevents cancellation after event date", async () => {
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: "res-1",
      giftId: TEST_GIFT_REGULAR.id,
      userId: OTHER_USER.id,
      createdAt: new Date(),
      gift: {
        title: "Book",
        wishlistId: TEST_WISHLIST.id,
        wishlist: {
          ownerId: TEST_USER.id,
          eventDate: new Date("2020-01-01"),
        },
      },
    } as any);

    const res = await request(app)
      .delete("/api/reservations/res-1")
      .set("Cookie", authCookie(OTHER_USER.id));

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/event date/i);
  });
});
