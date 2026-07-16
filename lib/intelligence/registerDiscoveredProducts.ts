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

function cleanValue(value: string) {
 return value
   .replace(/\s+/g, " ")
   .trim();
}

function isUsableValue(value: string) {
 const normalized =
   normalize(value);

 return (
   normalized.length > 0 &&
   normalized !== "unknown" &&
   normalized !== "unknown brand"
 );
}

function buildCanonicalTitle(
 product: RetailProduct
) {
 return cleanValue(
   [
     product.brand,
     product.supplement,
     product.dosage,
   ]
     .filter(Boolean)
     .join(" ")
 );
}

async function findBrand(
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

async function findSupplement(
 supplementName: string
) {
 const normalizedSupplementName =
   normalize(supplementName);

 const aliasMatch =
   await prisma.supplementAlias.findUnique({
     where: {
       normalizedAlias:
         normalizedSupplementName,
     },

     include: {
       supplement: true,
     },
   });

 if (aliasMatch) {
   return aliasMatch.supplement;
 }

 return prisma.supplement.findFirst({
   where: {
     canonicalName: {
       equals:
         supplementName.trim(),

       mode: "insensitive",
     },
   },
 });
}

async function ensureProductResearchJob(
 productId: string
) {
 const existingJob =
   await prisma.knowledgeRefreshJob.findFirst({
     where: {
       jobType:
         "VERIFY_PRODUCT",

       entityType:
         "Product",

       entityId:
         productId,

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
       "VERIFY_PRODUCT",

     entityType:
       "Product",

     entityId:
       productId,

     status:
       "PENDING",

     priority:
       100,

     scheduledFor:
       new Date(),
   },
 });
}

async function registerOneProduct(
 retailProduct: RetailProduct
) {
 const brandName =
   cleanValue(
     retailProduct.brand
   );

 const supplementName =
   cleanValue(
     retailProduct.supplement
   );

 if (
   !isUsableValue(brandName) ||
   !isUsableValue(supplementName)
 ) {
   return null;
 }

 const brand =
   await findBrand(
     brandName
   );

 if (!brand) {
   console.log(
     "Skipped product because brand is not registered:",
     {
       brandName,
       supplementName,
     }
   );

   return null;
 }

 const supplement =
   await findSupplement(
     supplementName
   );

 if (!supplement) {
   console.log(
     "Skipped product because supplement is not registered:",
     {
       brandName,
       supplementName,
     }
   );

   return null;
 }

 const canonicalTitle =
   buildCanonicalTitle(
     retailProduct
   );

 let product =
   await prisma.product.findFirst({
     where: {
       brandId:
         brand.id,

       canonicalTitle: {
         equals:
           canonicalTitle,

         mode: "insensitive",
       },
     },
   });

 if (!product) {
   product =
     await prisma.product.create({
       data: {
         canonicalTitle,

         brandId:
           brand.id,

         unitsPerContainer:
           retailProduct
             .capsulesPerBottle,

         servingSize:
           retailProduct
             .servingSize,

         productUrl:
           retailProduct.url,

         active: true,

         lastVerifiedAt:
           new Date(),

         ingredients: {
           create: {
             supplementId:
               supplement.id,

             amountBasis:
               "SERVING",

             isPrimary:
               true,
           },
         },
       },
     });

   console.log(
     "Created provisional product:",
     product.canonicalTitle
   );
 }

 await ensureProductResearchJob(
   product.id
 );

 return product;
}

export async function registerDiscoveredProducts(
 products: RetailProduct[]
) {
 const uniqueProducts =
   Array.from(
     new Map(
       products.map((product) => [
         [
           normalize(product.brand),
           normalize(
             product.supplement
           ),
           normalize(product.dosage),
           product.capsulesPerBottle,
           product.servingSize,
         ].join("|"),

         product,
       ])
     ).values()
   );

 const results =
   await Promise.allSettled(
     uniqueProducts.map(
       registerOneProduct
     )
   );

 results.forEach(
   (result, index) => {
     if (
       result.status ===
       "rejected"
     ) {
       console.error(
         "Unable to register discovered product:",
         uniqueProducts[index],
         result.reason
       );
     }
   }
 );
}