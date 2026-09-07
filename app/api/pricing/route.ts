import { NextResponse } from "next/server";

import {
 getVidaPouchPricingConfig,
} from "@/lib/pricing/getVidaPouchPricingConfig";

export const dynamic = "force-dynamic";

export async function GET() {
 try {
   const config =
     await getVidaPouchPricingConfig();

   const plans =
     config.plans
       .filter((plan) => plan.active)
       .sort(
         (a, b) =>
           a.displayOrder -
           b.displayOrder
       )
       .map((plan) => ({
         id: plan.id,
         planKey: plan.planKey,
         name: plan.name,
         monthlyPrice:
           plan.monthlyPrice,
         supplementLimit:
           plan.supplementLimit,
         customerDescription:
           plan.customerDescription,
         customerSelectionDescription:
           plan.customerSelectionDescription,
       }));

   return NextResponse.json({
     pricingVersionId:
       config.pricingVersionId,
     versionName:
       config.versionName,
     usingFallback:
       config.usingFallback,
     plans,
   });
 } catch (error) {
   console.error(
     "Unable to load public VidaPouch pricing:",
     error
   );

   return NextResponse.json(
     {
       error:
         "Unable to load VidaPouch pricing.",
     },
     {
       status: 500,
     }
   );
 }
}
