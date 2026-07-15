import { prisma } from "../db";

import type {
 CatalogBrand,
 CatalogIngredient,
 CatalogListing,
 CatalogProduct,
} from "./types";

function decimalToNumber(
 value: { toNumber(): number } | null | undefined
) {
 return value ? value.toNumber() : null;
}

export async function getAllProducts(): Promise<
 CatalogProduct[]
> {
 const products =
   await prisma.product.findMany({
     include: {
       brand: true,

       ingredients: {
         include: {
           supplement: true,
         },
       },

       listings: {
         include: {
           retailer: true,
           reviewSnapshots: {
             orderBy: {
               capturedAt: "desc",
             },
             take: 1,
           },
         },
       },
     },
   });

 return products.map((product) => ({
   id: product.id,

   canonicalTitle:
     product.canonicalTitle,

   manufacturerSku:
     product.manufacturerSku,

   upc: product.upc,

   form: product.form,

   unitsPerContainer:
     product.unitsPerContainer,

   servingSize:
     decimalToNumber(
       product.servingSize
     ),

   servingsPerContainer:
     decimalToNumber(
       product.servingsPerContainer
     ),

   productUrl:
     product.productUrl,

   active:
     product.active,

   brand: {
     id: product.brand.id,

     canonicalName:
       product.brand.canonicalName,

     practitionerGrade:
       product.brand.practitionerGrade,

     thirdPartyTestingProgram:
       product.brand
         .thirdPartyTestingProgram,

     cgmpCertified:
       product.brand
         .cgmpCertified,

     veganOptions:
       product.brand
         .veganOptions,

     hypoallergenic:
       product.brand
         .hypoallergenic,

     priceTier:
       product.brand
         .priceTier,

     availability:
       product.brand
         .availability,
   } satisfies CatalogBrand,

   ingredients:
     product.ingredients.map(
       (ingredient) =>
         ({
           supplementId:
             ingredient.supplement.id,

           canonicalName:
             ingredient.supplement
               .canonicalName,

           amount:
             decimalToNumber(
               ingredient.amount
             ),

           unit:
             ingredient.unit,

           amountBasis:
             ingredient.amountBasis,

           isPrimary:
             ingredient.isPrimary,
         }) satisfies CatalogIngredient
     ),

   listings:
     product.listings.map(
       (listing) => ({
         id: listing.id,

         retailerId:
           listing.retailer.id,

         retailerName:
           listing.retailer
             .canonicalName,

         listingTitle:
           listing.listingTitle,

         url:
           listing.url,

         bottlePrice:
           decimalToNumber(
             listing.currentBottlePrice
           ),

         shipping:
           decimalToNumber(
             listing.currentShipping
           ),

         currency:
           listing.currency,

         inStock:
           listing.inStock,

         sellerName:
           listing.sellerName,

         sellerVerified:
           listing.sellerVerified,

         lastSeenAt:
           listing.lastSeenAt.toISOString(),

         averageRating:
           listing.reviewSnapshots[0]
             ? decimalToNumber(
                 listing
                   .reviewSnapshots[0]
                   .averageRating
               )
             : null,

         reviewCount:
           listing.reviewSnapshots[0]
             ?.reviewCount ??
           null,
       }) satisfies CatalogListing
     ),
 }));
}
