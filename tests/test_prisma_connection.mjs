import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  try {
    const userCount = await prisma.user.count();
    console.log("Prisma connection successful! User count:", userCount);
    const challengeCount = await prisma.challenge.count();
    console.log("Challenge count:", challengeCount);
    await prisma.$disconnect();
  } catch (err) {
    console.error("Prisma error:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

test();
