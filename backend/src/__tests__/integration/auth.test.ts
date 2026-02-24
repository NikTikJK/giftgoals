import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { TEST_USER, authCookie } from "../helpers.js";

const mockPrisma = vi.mocked(prisma);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  it("registers a new user and sets auth cookie", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      ...TEST_USER,
      id: "new-user",
      email: "new@example.com",
      displayName: "new",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "new@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("new@example.com");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/token=/);
  });

  it("returns 409 if email already taken", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(TEST_USER as any);

    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("returns 400 for invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "short@example.com",
      password: "123",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials", async () => {
    const hash = await bcrypt.hash("correctpass", 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...TEST_USER,
      passwordHash: hash,
    } as any);

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "correctpass",
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.headers["set-cookie"][0]).toMatch(/token=/);
  });

  it("returns 401 for wrong password", async () => {
    const hash = await bcrypt.hash("correctpass", 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...TEST_USER,
      passwordHash: hash,
    } as any);

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpass",
    });

    expect(res.status).toBe(401);
  });

  it("returns 401 for non-existent user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("returns current user with valid cookie", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER.id,
      email: TEST_USER.email,
      displayName: TEST_USER.displayName,
      avatarUrl: null,
      createdAt: TEST_USER.createdAt,
    } as any);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", authCookie(TEST_USER.id));

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(TEST_USER.id);
  });

  it("returns 401 without cookie", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the token cookie", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toMatch(/token=;/);
  });
});
