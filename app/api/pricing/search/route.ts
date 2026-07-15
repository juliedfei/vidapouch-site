import { NextResponse } from "next/server";

import { findProducts } from "@/lib/pricing/findProducts";
import { estimateSupplementPrice } from "@/lib/pricing/estimateSupplementPrice";

export async function POST(req: Request) {
 try {
   const {
     supplement,
     brand,
     dosage,
   } = await req.json();

   if (!supplement?.trim()) {
     return NextResponse.json(
       {
         error: "Supplement is required.",
       },
       {
         status: 400,
       }
     );
   }

   const products = await findProducts({
     supplement,
     brand,
     dosage,
   });

   /*
    * Temporary:
    *
    * The recommendation engine has already
    * been migrated to BrandOption[].
    *
    * This API route still returns raw
    * RetailProducts until the new
    * Brand Comparison Builder is wired in.
    */
   const recommendation = null;

   const monthlyEstimate = estimateSupplementPrice({
     name: supplement,
     dosage: dosage || "1 capsule",
     brand,
     monthlyPrice: undefined,
   });

   return NextResponse.json({
     products,
     recommendation,
     monthlyEstimate,
   });
 } catch (error) {
   console.error(error);

   return NextResponse.json(
     {
       error:
         error instanceof Error
           ? error.message
           : String(error),
     },
     {
       status: 500,
     }
   );
 }
}
