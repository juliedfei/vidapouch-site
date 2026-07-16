import { prisma } from "@/lib/db";

import type { ProductResearch } from "./productResearchTypes";

export async function saveProductResearch(
 productId: string,
 research: ProductResearch
) {
 await prisma.product.update({

   where: {
     id: productId,
   },

   data: {
     lastVerifiedAt: new Date(),
   },

 });
}
