import { prisma } from "../../../lib/db";

import { brands } from "./data";

export async function seedBrands() {
 console.log("Seeding brands...");

 for (const brand of brands) {
   await prisma.brand.upsert({
     where: {
       canonicalName: brand.canonicalName,
     },

     update: {
       website: brand.website,

       manufacturer: {
         connectOrCreate: {
           where: {
             canonicalName: brand.manufacturer,
           },
           create: {
             canonicalName: brand.manufacturer,
           },
         },
       },

       practitionerGrade: brand.practitionerGrade,
       thirdPartyTestingProgram: brand.thirdPartyTested,
       cgmpCertified: brand.cgmpCertified,
       veganOptions: brand.veganOptions,
       hypoallergenic: brand.hypoallergenic,
       priceTier: brand.priceTier,
       availability: brand.availability,
       profileConfidence: brand.profileConfidence,
     },

     create: {
       canonicalName: brand.canonicalName,

       website: brand.website,

       manufacturer: {
         connectOrCreate: {
           where: {
             canonicalName: brand.manufacturer,
           },
           create: {
             canonicalName: brand.manufacturer,
           },
         },
       },

       practitionerGrade: brand.practitionerGrade,
       thirdPartyTestingProgram: brand.thirdPartyTested,
       cgmpCertified: brand.cgmpCertified,
       veganOptions: brand.veganOptions,
       hypoallergenic: brand.hypoallergenic,
       priceTier: brand.priceTier,
       availability: brand.availability,
       profileConfidence: brand.profileConfidence,
     },
   });

   const savedBrand =
     await prisma.brand.findUniqueOrThrow({
       where: {
         canonicalName: brand.canonicalName,
       },
     });

   await prisma.brandAlias.deleteMany({
     where: {
       brandId: savedBrand.id,
     },
   });

   const uniqueAliases = Array.from(
     new Map(
       brand.aliases.map((alias) => {
         const normalized = alias
           .toLowerCase()
           .replace(/['’]/g, "")
           .replace(/[^a-z0-9]+/g, " ")
           .trim();

         return [
           normalized,
           {
             brandId: savedBrand.id,
             alias,
             normalizedAlias: normalized,
           },
         ];
       })
     ).values()
   );

   await prisma.brandAlias.createMany({
     data: uniqueAliases,
   });
 }

 console.log("Finished seeding brands.");
}
