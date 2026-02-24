import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      passwordHash: "$2b$10$placeholder_hash_alice",
      displayName: "Alice",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      passwordHash: "$2b$10$placeholder_hash_bob",
      displayName: "Bob",
    },
  });

  const wishlist = await prisma.wishlist.upsert({
    where: { slug: "alice-birthday-2026" },
    update: {},
    create: {
      ownerId: alice.id,
      title: "День рождения 2026",
      description: "Мой вишлист на ДР!",
      eventDate: new Date("2026-06-15"),
      slug: "alice-birthday-2026",
      isPublic: true,
      expensiveThreshold: 500000,
    },
  });

  const regularGift = await prisma.gift.upsert({
    where: { id: "seed-gift-regular" },
    update: {},
    create: {
      id: "seed-gift-regular",
      wishlistId: wishlist.id,
      title: "Книга «Clean Code»",
      price: 150000,
      productUrl: "https://example.com/clean-code",
    },
  });

  const expensiveGift = await prisma.gift.upsert({
    where: { id: "seed-gift-expensive" },
    update: {},
    create: {
      id: "seed-gift-expensive",
      wishlistId: wishlist.id,
      title: "Беспроводные наушники",
      price: 1200000,
      productUrl: "https://example.com/headphones",
      comment: "Любой цвет, кроме белого",
    },
  });

  await prisma.reservation.upsert({
    where: { giftId: regularGift.id },
    update: {},
    create: {
      giftId: regularGift.id,
      userId: bob.id,
    },
  });

  await prisma.contribution.upsert({
    where: { id: "seed-contribution-1" },
    update: {},
    create: {
      id: "seed-contribution-1",
      giftId: expensiveGift.id,
      userId: bob.id,
      amount: 300000,
    },
  });

  console.log("Seed complete:", { alice: alice.id, bob: bob.id, wishlist: wishlist.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
