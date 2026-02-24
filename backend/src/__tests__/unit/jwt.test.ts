import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../../utils/jwt.js";

describe("JWT utils", () => {
  const userId = "test-user-123";

  it("signToken returns a string token", () => {
    const token = signToken(userId);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifyToken decodes a valid token", () => {
    const token = signToken(userId);
    const payload = verifyToken(token);
    expect(payload.userId).toBe(userId);
  });

  it("verifyToken throws on invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });

  it("different userIds produce different tokens", () => {
    const t1 = signToken("user-a");
    const t2 = signToken("user-b");
    expect(t1).not.toBe(t2);
  });
});
