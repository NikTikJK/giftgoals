import { signToken } from "../utils/jwt.js";

export const TEST_USER = {
  id: "user-1",
  email: "test@example.com",
  passwordHash: "$2b$10$somehash",
  displayName: "Test User",
  avatarUrl: null,
  googleId: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const OTHER_USER = {
  id: "user-2",
  email: "other@example.com",
  passwordHash: "$2b$10$otherhash",
  displayName: "Other User",
  avatarUrl: null,
  googleId: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const authCookie = (userId: string): string => {
  const token = signToken(userId);
  return `token=${token}`;
};

export const TEST_WISHLIST = {
  id: "wl-1",
  ownerId: TEST_USER.id,
  title: "Birthday wishlist",
  description: "My birthday gifts",
  eventDate: new Date("2026-06-01"),
  slug: "birthday-wishlist-abc12345",
  isPublic: true,
  expensiveThreshold: 500000,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const TEST_GIFT_REGULAR = {
  id: "gift-1",
  wishlistId: TEST_WISHLIST.id,
  title: "Book",
  price: 150000,
  productUrl: null,
  imageUrl: null,
  comment: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const TEST_GIFT_EXPENSIVE = {
  id: "gift-2",
  wishlistId: TEST_WISHLIST.id,
  title: "Laptop",
  price: 7000000,
  productUrl: null,
  imageUrl: null,
  comment: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};
