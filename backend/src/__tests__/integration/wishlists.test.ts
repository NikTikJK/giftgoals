import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import {
  TEST_USER,
  OTHER_USER,
  TEST_WISHLIST,
  authCookie,
} from "../helpers.js";

const mockPrisma = vi.mocked(prisma);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/wishlists", () => {
  it("returns user wishlists", async () => {
    mockPrisma.wishlist.findMany.mockResolvedValue([
      { ...TEST_WISHLIST, _count: { gifts: 3 } },
    ] as any);

    const res = await request(app)
      .get("/api/wishlists")
      .set("Cookie", authCookie(TEST_USER.id));

    expect(res.status).toBe(200);
    expect(res.body.wishlists).toHaveLength(1);
    expect(res.body.wishlists[0].title).toBe("Birthday wishlist");
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/wishlists");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/wishlists", () => {
  it("creates a wishlist", async () => {
    mockPrisma.wishlist.count.mockResolvedValue(0);
    mockPrisma.wishlist.create.mockResolvedValue(TEST_WISHLIST as any);

    const res = await request(app)
      .post("/api/wishlists")
      .set("Cookie", authCookie(TEST_USER.id))
      .send({ title: "Birthday wishlist" });

    expect(res.status).toBe(201);
    expect(res.body.wishlist.title).toBe("Birthday wishlist");
  });

  it("returns 403 when limit reached", async () => {
    mockPrisma.wishlist.count.mockResolvedValue(50);

    const res = await request(app)
      .post("/api/wishlists")
      .set("Cookie", authCookie(TEST_USER.id))
      .send({ title: "One more" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("LIMIT_REACHED");
  });

  it("returns 400 for empty title", async () => {
    const res = await request(app)
      .post("/api/wishlists")
      .set("Cookie", authCookie(TEST_USER.id))
      .send({ title: "" });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/wishlists/:id", () => {
  it("updates own wishlist", async () => {
    mockPrisma.wishlist.findUnique.mockResolvedValue(TEST_WISHLIST as any);
    mockPrisma.wishlist.update.mockResolvedValue({
      ...TEST_WISHLIST,
      title: "Updated",
    } as any);

    const res = await request(app)
      .patch(`/api/wishlists/${TEST_WISHLIST.id}`)
      .set("Cookie", authCookie(TEST_USER.id))
      .send({ title: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.wishlist.title).toBe("Updated");
  });

  it("returns 403 for non-owner", async () => {
    mockPrisma.wishlist.findUnique.mockResolvedValue(TEST_WISHLIST as any);

    const res = await request(app)
      .patch(`/api/wishlists/${TEST_WISHLIST.id}`)
      .set("Cookie", authCookie(OTHER_USER.id))
      .send({ title: "Hacked" });

    expect(res.status).toBe(403);
  });

  it("returns 404 for non-existent wishlist", async () => {
    mockPrisma.wishlist.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/wishlists/nonexistent")
      .set("Cookie", authCookie(TEST_USER.id))
      .send({ title: "New title" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/wishlists/:id", () => {
  it("deletes own wishlist", async () => {
    mockPrisma.wishlist.findUnique.mockResolvedValue(TEST_WISHLIST as any);
    mockPrisma.wishlist.delete.mockResolvedValue(TEST_WISHLIST as any);

    const res = await request(app)
      .delete(`/api/wishlists/${TEST_WISHLIST.id}`)
      .set("Cookie", authCookie(TEST_USER.id));

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("returns 403 for non-owner", async () => {
    mockPrisma.wishlist.findUnique.mockResolvedValue(TEST_WISHLIST as any);

    const res = await request(app)
      .delete(`/api/wishlists/${TEST_WISHLIST.id}`)
      .set("Cookie", authCookie(OTHER_USER.id));

    expect(res.status).toBe(403);
  });
});
