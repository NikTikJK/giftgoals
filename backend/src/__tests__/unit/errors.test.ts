import { describe, it, expect } from "vitest";
import {
  AppError,
  notFound,
  forbidden,
  conflict,
  badRequest,
  unauthorized,
  limitReached,
} from "../../utils/errors.js";

describe("AppError", () => {
  it("creates error with statusCode, code and message", () => {
    const err = new AppError(400, "BAD_REQUEST", "Something wrong");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Something wrong");
    expect(err.name).toBe("AppError");
  });
});

describe("error factory functions", () => {
  it("notFound — 404", () => {
    const err = notFound("Gift");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Gift not found");
  });

  it("forbidden — 403 with default message", () => {
    const err = forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Forbidden");
  });

  it("forbidden — 403 with custom message", () => {
    const err = forbidden("Custom msg");
    expect(err.message).toBe("Custom msg");
  });

  it("conflict — 409", () => {
    const err = conflict("Already exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("badRequest — 400", () => {
    const err = badRequest("Bad input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
  });

  it("unauthorized — 401", () => {
    const err = unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });

  it("limitReached — 403 LIMIT_REACHED", () => {
    const err = limitReached("Max 50");
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("LIMIT_REACHED");
  });
});
