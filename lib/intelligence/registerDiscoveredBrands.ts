import { prisma } from "@/lib/db";

import type {
 RetailProduct,
} from "@/lib/pricing/types";

function normalize(value: string) {
 return value
   .toLowerCase()
   .replace(/['’]/g, "")
   .replace(/[^a-z0-9]+/g, " ")
   .trim();
}

function cleanBrandName(
 value: string
) {
 return value
   .replace(/\s+/g, " ")
   .trim();
}

function isUsableBrandName(
 value: string
) {
 const normalized =
   normalize(value);

 if (!normalized) {
   return false;
 }

 if (
   normalized === "unknown brand" ||
   normalized === "unknown" ||
   normalized === "the" ||
   normalized === "a" ||
   normalized === "an"
 ) {
   return false;
 }

 /*
  * Extremely long extracted values are
  * probably product titles rather than
  * legitimate brand names.
  */
 if (value.length > 80) {
   return false;
 }

 return true;
}

async function findExistingBrand(
 brandName: string
) {
 const normalizedBrandName =
   normalize(brandName);

 const aliasMatch =
   await prisma.brandAlias.findUnique({
     where: {
       normalizedAlias:
         normalizedBrandName,
     },

     include: {
       brand: true,
     },
   });

 if (aliasMatch) {
   return aliasMatch.brand;
 }

 return prisma.brand.findFirst({
   where: {
     canonicalName: {
       equals:
         brandName.trim(),

       mode: "insensitive",
     },
   },
 });
}

async function ensureBrandAlias({
 brandId,
 alias,
}: {
 brandId: string;
 alias: string;
}) {
 const normalizedAlias =
   normalize(alias);

 const existingAlias =
   await prisma.brandAlias.findUnique({
     where: {
       normalizedAlias,
     },
   });

 if (existingAlias) {
   return;
 }

 await prisma.brandAlias.create({
   data: {
     brandId,

     alias,

     normalizedAlias,

     source:
       "SerpApi Google Shopping",

     confidence:
       "INFERRED",
   },
 });
}

async function ensureBrandResearchJob(
 brandId: string
) {
 const existingJob =
   await prisma.knowledgeRefreshJob.findFirst({
     where: {
       jobType:
         "VERIFY_BRAND",

       entityType:
         "Brand",

       entityId:
         brandId,

       status: {
         in: [
           "PENDING",
           "RUNNING",
         ],
       },
     },
   });

 if (existingJob) {
   return;
 }

 await prisma.knowledgeRefreshJob.create({
   data: {
     jobType:
       "VERIFY_BRAND",

     entityType:
       "Brand",

     entityId:
       brandId,

     status:
       "PENDING",

     priority:
       100,

     scheduledFor:
       new Date(),
   },
 });
}

async function registerDiscoveredBrand(
 rawBrandName: string
) {
 const brandName =
   cleanBrandName(
     rawBrandName
   );

 if (
   !isUsableBrandName(
     brandName
   )
 ) {
   console.log(
     "Skipped invalid discovered brand:",
     rawBrandName
   );

   return null;
 }

 let brand =
   await findExistingBrand(
     brandName
   );

 if (!brand) {
   brand =
     await prisma.brand.create({
       data: {
         canonicalName:
           brandName,

         profileConfidence:
           "UNKNOWN",
       },
     });

   console.log(
     "Created provisional brand:",
     brand.canonicalName
   );
 }

 await ensureBrandAlias({
   brandId:
     brand.id,

   alias:
     brandName,
 });

 /*
  * Only unknown or incomplete brands
  * should be sent for research.
  */
 if (
   brand.profileConfidence ===
   "UNKNOWN"
 ) {
   await ensureBrandResearchJob(
     brand.id
   );
 }

 return brand;
}

export async function registerDiscoveredBrands(
 products: RetailProduct[]
) {

  console.log("========== REGISTER DISCOVERED BRANDS ==========");
console.log(products.map(p => p.brand));


 const uniqueBrandNames =
   Array.from(
     new Map(
       products
         .map((product) =>
           cleanBrandName(
             product.brand
           )
         )
         .filter(
           isUsableBrandName
         )
         .map((brandName) => [
           normalize(brandName),
           brandName,
         ])
     ).values()
   );

 const results =
   await Promise.allSettled(
     uniqueBrandNames.map(
       (brandName) =>
         registerDiscoveredBrand(
           brandName
         )
     )
   );

 results.forEach(
   (result, index) => {
     if (
       result.status ===
       "rejected"
     ) {
       console.error(
         "Unable to register discovered brand:",
         uniqueBrandNames[index],
         result.reason
       );
     }
   }
 );
}