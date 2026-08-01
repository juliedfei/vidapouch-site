import {
  NextRequest,
  NextResponse,
 } from "next/server";
 


import type {
 SearchPouchItem,
 SearchPouchPurchaseOption,
} from "@/components/search/types/searchPouch";


import {
  getSubscriptionFulfillmentTiming,
 } from "@/lib/commerce/getSubscriptionFulfillmentTiming";



import {
  VidaPouchOrderStatus,
  VidaPouchPurchaseOption,
  VidaPouchSalesMode,
 } from "@/lib/generated/prisma/client";
 





 import {
  prisma,
 } from "@/lib/db";
 

 
 import {
  getSearchPlan,
 } from "@/components/search/types/searchPlan";
 
 import {
  calculatePooledPouchPricing,
 } from "@/lib/pricing/calculatePooledPouchPricing";
 
 import {
  revalidatePouchItemsForCheckout,
 } from "@/lib/pricing/revalidatePouchItemsForCheckout";
 


 import {
  stripe,
 } from "@/lib/stripe";


 import {
  getVidaPouchSalesMode,
 } from "@/lib/commerce/getVidaPouchSalesMode";




 
 export const runtime =
  "nodejs";
 
 export const dynamic =
  "force-dynamic";
 
 const PRICE_IDS = {
  essential:
    process.env.STRIPE_PRICE_ESSENTIAL,
 
  complete:
    process.env.STRIPE_PRICE_COMPLETE,
 
  premier:
    process.env.STRIPE_PRICE_PREMIER,
 } as const;
 
 type PlanName =
  keyof typeof PRICE_IDS;
 


  type CheckoutRequestBody = {
    plan?:
      unknown;
   
    purchaseOption?:
      unknown;
   
    pouchItems?:
      unknown;
   };
   



 
 const MAX_POUCH_ITEMS =
  8;
 
 const MAX_UNITS_PER_DAY =
  20;
 
 function isRecord(
  value:
    unknown
 ): value is Record<
  string,
  unknown
 >{
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
 }
 
 function isNonEmptyString(
  value:
    unknown
 ): value is string {
  return (
    typeof value ===
      "string" &&
    value.trim().length >
      0
  );
 }
 
 function isPositiveNumber(
  value:
    unknown
 ): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value
    ) &&
    value >
      0
  );
 }
 


 function isPlanName(
  value:
    unknown
 ): value is PlanName {
  return (
    typeof value ===
      "string" &&
    value in
      PRICE_IDS
  );
 }

 function isPurchaseOption(
  value:
    unknown
 ): value is SearchPouchPurchaseOption {
  return (
    value ===
      "one-time" ||
    value ===
      "subscription"
  );
 }



 
 function sanitizePouchItems(
  value:
    unknown
 ): SearchPouchItem[] | null {
  if (
    !Array.isArray(
      value
    ) ||
    value.length ===
      0 ||
    value.length >
      MAX_POUCH_ITEMS
  ) {
    return null;
  }
 
  const seenIds =
    new Set<string>();
 
  const sanitizedItems:
    SearchPouchItem[] =
    [];
 
  for (
    const candidate of
    value
  ) {
    if (
      !isRecord(
        candidate
      )
    ) {
      return null;
    }
 
    if (
      !isNonEmptyString(
        candidate.id
      ) ||
      !isNonEmptyString(
        candidate.productName
      ) ||
      !isNonEmptyString(
        candidate.brand
      ) ||
      !isNonEmptyString(
        candidate.retailer
      ) ||
      !isNonEmptyString(
        candidate
          .immersiveProductPageToken
      )
    ) {
      return null;
    }
 
    const itemId =
      candidate.id.trim();
 
    if (
      seenIds.has(
        itemId
      )
    ) {
      return null;
    }
 
    seenIds.add(
      itemId
    );
 
    if (
      !isPositiveNumber(
        candidate.unitsPerDay
      ) ||
      candidate.unitsPerDay >
        MAX_UNITS_PER_DAY
    ) {
      return null;
    }
 
    /*
     * The customer may select the daily quantity,
     * but the monthly count must agree with that
     * selection. This prevents an altered browser
     * request from supplying an unrelated quantity.
     */
    const expectedMonthlyUnitCount =
      candidate.unitsPerDay *
      30;
 
    if (
      !isPositiveNumber(
        candidate.monthlyUnitCount
      ) ||
      Math.abs(
        candidate.monthlyUnitCount -
          expectedMonthlyUnitCount
      ) >
        0.001
    ) {
      return null;
    }
 
    /*
     * Product prices and bottle quantities supplied
     * by the browser are not trusted for the final
     * charge. They are replaced by the live
     * server-side verification step below.
     */
    sanitizedItems.push(
      candidate as
        unknown as
        SearchPouchItem
    );
  }
 
  return sanitizedItems;
 }
 
 function toCents(
  amount:
    number
 ) {
  return Math.round(
    (
      amount +
      Number.EPSILON
    ) *
      100
  );
 }
 


 export async function POST(
  request:
    NextRequest
 ) {
  try {
    const salesMode =
      await getVidaPouchSalesMode();
 
    if (
      salesMode !==
        VidaPouchSalesMode.STRIPE
    ) {
      return NextResponse.json(
        {
          error:
            salesMode ===
              VidaPouchSalesMode.WAITLIST
              ? "VidaPouch is currently accepting waitlist reservations instead of payments."
              : "New VidaPouch purchases are temporarily paused.",
 
          salesMode,
        },
        {
          status:
            409,
 
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        }
      );
    }
 
    let body:
      CheckoutRequestBody;





 
    try {
      body =
        (await request.json()) as
          CheckoutRequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "The checkout request is not valid JSON.",
        },
        {
          status:
            400,
        }
      );
    }
 


    if (
      !isPlanName(
        body.plan
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid VidaPouch plan.",
        },
        {
          status:
            400,
        }
      );
    }


    if (
      !isPurchaseOption(
        body.purchaseOption
      )
     ) {
      return NextResponse.json(
        {
          error:
            "Please select either a one-time order or a monthly subscription.",
        },
        {
          status:
            400,
        }
      );
     }
     
     const purchaseOption =
      body.purchaseOption;




 
    const plan =
      body.plan;
 
    const priceId =
      PRICE_IDS[plan];
 
    if (
      !priceId
    ) {
      return NextResponse.json(
        {
          error:
            `Missing Stripe Price ID for ${plan}.`,
        },
        {
          status:
            500,
        }
      );
    }
 
    const selectedPlan =
      getSearchPlan(
        plan
      );
 
    if (
      selectedPlan ===
        null
    ) {
      return NextResponse.json(
        {
          error:
            "The selected VidaPouch plan could not be found.",
        },
        {
          status:
            400,
        }
      );
    }
 
    const submittedPouchItems =
      sanitizePouchItems(
        body.pouchItems
      );
 
    if (
      submittedPouchItems ===
        null
    ) {
      return NextResponse.json(
        {
          error:
            "One or more pouch items are invalid. Please refresh your pouch and try again.",
        },
        {
          status:
            400,
        }
      );
    }
 
    if (
      submittedPouchItems.length >
      selectedPlan
        .supplementLimit
    ) {
      return NextResponse.json(
        {
          error:
            `The ${selectedPlan.name} Plan supports up to ${selectedPlan.supplementLimit} supplements.`,
        },
        {
          status:
            409,
        }
      );
    }
 
    /*
     * Recheck every selected retailer offer using
     * the exact Google Shopping product token.
     *
     * The live price and bottle quantity replace the
     * untrusted values originally sent by the browser.
     */
    const {
      pouchItems:
        verifiedPouchItems,
 
      verification,
    } =
      await revalidatePouchItemsForCheckout(
        submittedPouchItems
      );
 
    /*
     * Recalculate the complete pooled pouch after
     * live product-price verification.
     */
    const pooledPricing =
      await calculatePooledPouchPricing({
        selectedPlan,
 
        pouchItems:
          verifiedPouchItems,
      });
 
    if (
      pooledPricing.status ===
        "disabled"
    ) {
      return NextResponse.json(
        {
          error:
            "Plan Overage calculations are not active yet. Please contact the VidaPouch concierge before completing checkout.",
        },
        {
          status:
            409,
        }
      );
    }
 
    if (
      pooledPricing.status ===
        "undetermined" ||
      pooledPricing.confidence !==
        "confirmed" ||
      pooledPricing
        .unresolvedItemCount >
        0
    ) {
      return NextResponse.json(
        {
          error:
            "The final monthly price could not be verified. Please review your selections or contact the VidaPouch concierge.",
        },
        {
          status:
            409,
        }
      );
    }
 
    const planOverageFee =
      pooledPricing
        .planOverageFee ??
      pooledPricing
        .monthlyPriceAdjustment;
 
    const overageAmountInCents =
      toCents(
        planOverageFee
      );
 




      const isSubscription =
      purchaseOption ===
      "subscription";
     
     const subscriptionTiming =
      isSubscription
        ? getSubscriptionFulfillmentTiming()
        : null;
     
     const planAmountInCents =
      toCents(
        pooledPricing
          .planMonthlyPrice
      );




     
     const lineItems = [
      isSubscription
        ? {
            price:
              priceId,
     
            quantity:
              1,
          }
        : {
            price_data: {
              currency:
                "usd",
     
              product_data: {
                name:
                  `${pooledPricing.planName} Plan — 30-Day Supply`,
     
                description:
                  "One-time VidaPouch order. No automatic renewal.",
              },
     
              unit_amount:
                planAmountInCents,
            },
     
            quantity:
              1,
          },
     ];
     
     /*
     * For a subscription, the Plan Overage renews
     * monthly with the plan.
     *
     * For a one-time order, it is charged only once.
     */
     if (
      overageAmountInCents >
        0
     ) {
      lineItems.push({
        price_data: {
          currency:
            "usd",
     
          product_data: {
            name:
              "Plan Overage",
     
            description:
              isSubscription
                ? "Monthly adjustment for higher-cost supplement selections or increased daily quantities."
                : "One-time adjustment for higher-cost supplement selections or increased daily quantities.",
          },
     
          unit_amount:
            overageAmountInCents,
     
          ...(isSubscription
            ? {
                recurring: {
                  interval:
                    "month" as const,
                },
              }
            : {}),
        },
     
        quantity:
          1,
      } as never);
     }
     





 
    const origin =
      request.nextUrl.origin;
 



    const metadata = {
      vidapouchPlan:
        plan,
 
      vidapouchPlanName:
        pooledPricing.planName,
 
      supplementCount:
        String(
          verifiedPouchItems.length
        ),
 
      planMonthlyPrice:
        pooledPricing
          .planMonthlyPrice
          .toFixed(
            2
          ),
 
      planOverageFee:
        planOverageFee.toFixed(
          2
        ),
 
      totalMonthlyPrice:
        pooledPricing
          .totalMonthlyPrice
          .toFixed(
            2
          ),
 
      pricingVersionId:
        pooledPricing
          .pricingVersionId ??
        "",
 
      pricingCalculatedAt:
        pooledPricing
          .calculatedAt,
    };


    const databasePurchaseOption =
    purchaseOption ===
    "subscription"
      ? VidaPouchPurchaseOption.SUBSCRIPTION
      : VidaPouchPurchaseOption.ONE_TIME;
   
   const order =
    await prisma
      .vidaPouchOrder
      .create({
        data: {
          purchaseOption:
            databasePurchaseOption,
   
          status:
            VidaPouchOrderStatus.PENDING,
   
          planKey:
            plan,
   
          planName:
            pooledPricing
              .planName,
   
          supplementCount:
            verifiedPouchItems.length,
   
          planPrice:
            pooledPricing
              .planMonthlyPrice,
   
          planOverageFee,
   
          totalPrice:
            pooledPricing
              .totalMonthlyPrice,
   



              currency:
              "usd",
             
             nextTargetDeliveryDate:
              subscriptionTiming
                ?.nextTargetDeliveryDate ??
              null,
             
             nextShipByDate:
              subscriptionTiming
                ?.nextShipByDate ??
              null,
             
             pricingVersionId:
              pooledPricing
                .pricingVersionId,




   
          pricingCalculatedAt:
            new Date(
              pooledPricing
                .calculatedAt
            ),
   
          items: {
            create:
              verifiedPouchItems.map(
                (item) => ({
                  pouchItemId:
                    item.id,
   
                  productName:
                    item.productName,
   
                  brand:
                    item.brand,
   
                  retailer:
                    item.retailer,
   
                  dosage:
                    item.dosage ||
                    null,
   
                  form:
                    item.form,
   
                  unitLabel:
                    item.unitLabel,
   
                  unitsPerDay:
                    item.unitsPerDay,
   
                  monthlyUnitCount:
                    item.monthlyUnitCount,
   
                  timing:
                    item.timing,
   
                  timingPreference:
                    item
                      .timingPreference,
   
                  bottlePrice:
                    item.bottlePrice,
   
                  bottleUnitCount:
                    item.bottleUnitCount,
   
                  liveProductUrl:
                    null,
   
                  shoppingProductId:
                    item
                      .shoppingProductId,
   
                  immersiveProductPageToken:
                    item
                      .immersiveProductPageToken,
                })
              ),
          },
        },
   
        select: {
          id:
            true,
        },
      });
   
   const checkoutMetadata = {
    ...metadata,
   
    vidaPouchOrderId:
      order.id,
   
    purchaseOption,
   };
   



 
    console.log(
      "VidaPouch verified checkout pricing:",
      {
        plan,
 
        planMonthlyPrice:
          pooledPricing
            .planMonthlyPrice,
 
        planOverageFee,
 
        totalMonthlyPrice:
          pooledPricing
            .totalMonthlyPrice,
 
        verification,
      }
    );
 



    const session =
    await stripe
      .checkout
      .sessions
      .create({
        mode:
          isSubscription
            ? "subscription"
            : "payment",
   
        line_items:
          lineItems,
   
        success_url:
          `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
   
        cancel_url:
          `${origin}/v2`,
   
        allow_promotion_codes:
          true,
   
        billing_address_collection:
          "required",
   
        shipping_address_collection: {
          allowed_countries: [
            "US",
          ],
        },
   
        custom_text: {
          shipping_address: {
            message:
              isSubscription
                ? "Standard shipping is included with your monthly VidaPouch subscription."
                : "Standard shipping is included with your one-time VidaPouch order.",
          },
        },
   



metadata:
 checkoutMetadata,





   
 ...(isSubscription
  ? {
      subscription_data: {
        metadata:
          checkoutMetadata,
      },
    }
  : {
      payment_intent_data: {
        metadata:
          checkoutMetadata,
      },
    }),






      });
   





 
    if (
      !session.url
    ) {
      throw new Error(
        "Stripe did not return a Checkout URL."
      );
    }


    await prisma
    .vidaPouchOrder
    .update({
      where: {
        id:
          order.id,
      },
   
      data: {
        stripeCheckoutSessionId:
          session.id,
      },
    });



 
    return NextResponse.json(
      {
        url:
          session.url,
 
        pricing: {
          planMonthlyPrice:
            pooledPricing
              .planMonthlyPrice,
 
          planOverageFee,
 
          totalMonthlyPrice:
            pooledPricing
              .totalMonthlyPrice,
        },
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  } catch (
    error
  ) {
    console.error(
      "Unable to create Stripe Checkout Session:",
      error
    );
 
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout. Please try again.",
      },
      {
        status:
          500,
      }
    );
  }
 }
 