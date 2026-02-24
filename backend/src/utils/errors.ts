export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (resource: string) =>
  new AppError(404, "NOT_FOUND", `${resource} not found`);

export const forbidden = (message = "Forbidden") =>
  new AppError(403, "FORBIDDEN", message);

export const conflict = (message: string) =>
  new AppError(409, "CONFLICT", message);

export const badRequest = (message: string) =>
  new AppError(400, "BAD_REQUEST", message);

export const unauthorized = (message = "Unauthorized") =>
  new AppError(401, "UNAUTHORIZED", message);

export const limitReached = (message: string) =>
  new AppError(403, "LIMIT_REACHED", message);
