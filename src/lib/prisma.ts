import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Declare a global variable to extend the NodeJS global object
const prismaClientSingleton = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Check if a Prisma instance already exists globally. 
// If it does, use it. If not, create a new one.
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// If we are not in production, save the instance to the global object 
// so it is reused across Next.js hot-reloads.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}