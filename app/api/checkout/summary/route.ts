import { NextResponse } from "next/server";

import {
 buildCheckoutSummary,
} from "@/lib/checkout/buildCheckoutSummary";

import type {
 CheckoutPlan,
} from "@/lib/checkout/checkoutTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isCheckoutPlan(
 value: unknown
): value is CheckoutPlan {
 if (
   !value ||
   typeof value !== "object"
 ) {
   return false;
 }

 const plan =
   value as Partial<CheckoutPlan>;

 return (
   Array.isArray(plan.morning) &&
   Array.isArray(plan.evening)
 );
}

export async function POST(
 request: Request
) {
 try {
   const body =
     (await request.json()) as {
       plan?: unknown;
     };

   if (!isCheckoutPlan(body.plan)) {
     return NextResponse.json(
       {
         error:
           "A valid checkout plan is required.",
       },
       {
         status: 400,
       }
     );
   }




   const summary =
   await buildCheckoutSummary(
     body.plan
   );
  
  console.log(
   JSON.stringify(summary, null, 2)
  );
  
  return NextResponse.json({
   summary,
  });




 } catch (error) {
   console.error(
     "Checkout summary route failed:",
     error
   );

   return NextResponse.json(
     {
       error:
         error instanceof Error
           ? error.message
           : "VidaPouch could not prepare this checkout.",
     },
     {
       status: 500,
     }
   );
 }
}
