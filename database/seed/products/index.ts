import { prisma } from "../../../lib/db";

import { products } from "./data";

export async function seedProducts() {
 console.log("Seeding products...");

 for (const product of products) {
   const brand =
     await prisma.brand.findUniqueOrThrow({
       where: {
         canonicalName: product.brand,
       },
     });

   const savedProduct =
     await prisma.product.upsert({
       where: {
         canonicalTitle_brandId: {
           canonicalTitle: product.canonicalTitle,
           brandId: brand.id,
         },
       },

       update: {
         form: product.form,
         unitsPerContainer:
           product.unitsPerContainer,
         servingSize:
           product.servingSize,
       },

       create: {
         canonicalTitle:
           product.canonicalTitle,

         brand: {
           connect: {
             id: brand.id,
           },
         },

         form: product.form,

         unitsPerContainer:
           product.unitsPerContainer,

         servingSize:
           product.servingSize,
       },
     });

   await prisma.productIngredient.deleteMany({
     where: {
       productId: savedProduct.id,
     },
   });

   for (const ingredient of product.ingredients) {
     const supplement =
       await prisma.supplement.findUniqueOrThrow({
         where: {
           canonicalName:
             ingredient.supplement,
         },
       });

     await prisma.productIngredient.create({
       data: {
         product: {
           connect: {
             id: savedProduct.id,
           },
         },

         supplement: {
           connect: {
             id: supplement.id,
           },
         },

         amount: ingredient.amount,

         unit: ingredient.unit,

         amountBasis:
           ingredient.amountBasis,

         isPrimary:
           ingredient.isPrimary ?? false,
       },
     });
   }
 }

 console.log("Finished seeding products.");
}
