import "dotenv/config";

import { prisma } from "../lib/db";

async function main() {
 const brands =
   await prisma.brand.findMany();

 console.log(
   "Brands in database:"
 );

 console.log(brands);
}

main()
 .catch((error) => {
   console.error(error);
   process.exitCode = 1;
 })
 .finally(async () => {
   await prisma.$disconnect();
 });
