import "dotenv/config";

import { prisma } from "../../lib/db";

import { seedBrands } from "./brands";
import { seedSupplements } from "./supplements";
import { seedProducts } from "./products";

async function main() {
 await seedBrands();
 await seedSupplements();
 await seedProducts();

 const products = await prisma.product.findMany({
   include: {
     brand: true,

     ingredients: {
       include: {
         supplement: true,
       },
     },
   },

   orderBy: {
     canonicalTitle: "asc",
   },
 });

 console.log("========== PRODUCTS ==========");
 console.dir(products, {
   depth: null,
 });
}

main()
 .catch((error) => {
   console.error(error);
   process.exitCode = 1;
 })
 .finally(async () => {
   await prisma.$disconnect();
 });