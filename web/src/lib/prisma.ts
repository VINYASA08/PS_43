import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return baseClient.$extends({
    query: {
      user: {
        async findMany({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }: any) {
          return baseClient.user.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }: any) {
          return baseClient.user.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      challenge: {
        async findMany({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }: any) {
          return baseClient.challenge.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }: any) {
          return baseClient.challenge.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      proposal: {
        async findMany({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }: any) {
          return baseClient.proposal.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }: any) {
          return baseClient.proposal.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      fundingCommitment: {
        async findMany({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ args }: any) {
          return baseClient.fundingCommitment.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }: any) {
          return baseClient.fundingCommitment.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
