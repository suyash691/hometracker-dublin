import { PrismaClient } from "@prisma/client";

const prisma = {
  house: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  bidHistory: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
  actionItem: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  mortgageTracker: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  mortgageDocument: { findMany: jest.fn() },
  renovationEstimate: { findMany: jest.fn(), create: jest.fn() },
  viewingChecklist: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  checklistTemplate: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
} as unknown as PrismaClient;

jest.mock("@/lib/db", () => ({ prisma }));

export { prisma };
