import { prisma } from "../../../lib/db";

import { supplements } from "./data";

function normalizeAlias(alias: string) {
 return alias
   .toLowerCase()
   .replace(/['’]/g, "")
   .replace(/[^a-z0-9]+/g, " ")
   .trim();
}

export async function seedSupplements() {
 console.log("Seeding supplements...");

 for (const supplement of supplements) {
   await prisma.supplement.upsert({
     where: {
       canonicalName: supplement.canonicalName,
     },

     update: {
       category: supplement.category,
     },

     create: {
       canonicalName: supplement.canonicalName,
       category: supplement.category,
     },
   });

   const savedSupplement =
     await prisma.supplement.findUniqueOrThrow({
       where: {
         canonicalName: supplement.canonicalName,
       },
     });

   await prisma.supplementAlias.deleteMany({
     where: {
       supplementId: savedSupplement.id,
     },
   });

   const uniqueAliases = Array.from(
     new Map(
       supplement.aliases.map((alias) => {
         const normalized = normalizeAlias(alias);

         return [
           normalized,
           {
             supplementId: savedSupplement.id,
             alias,
             normalizedAlias: normalized,
           },
         ];
       })
     ).values()
   );

   await prisma.supplementAlias.createMany({
     data: uniqueAliases,
   });
 }

 console.log("Finished seeding supplements.");
}