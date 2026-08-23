import {
    NextRequest,
    NextResponse,
   } from "next/server";
   
   import type {
    SearchPouchItem,
    SearchPouchPurchaseOption,
   } from "@/components/search/types/searchPouch";
   


   import {
    VidaPouchPurchaseOption,
    VidaPouchSalesMode,
    VidaPouchWaitlistSource,
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
    getVidaPouchSalesMode,
   } from "@/lib/commerce/getVidaPouchSalesMode";
   
   export const runtime =
    "nodejs";
   
   export const dynamic =
    "force-dynamic";
   
   type WaitlistRequestBody = {
    plan?:
      unknown;
   
    purchaseOption?:
      unknown;
   
    pouchItems?:
      unknown;
   
    customerName?:
      unknown;
   
    customerEmail?:
      unknown;
   
    customerPhone?:
      unknown;
   };
   
   type PlanName =
    | "essential"
    | "complete"
    | "premier";
   
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
      value ===
        "essential" ||
      value ===
        "complete" ||
      value ===
        "premier"
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
   
   function normalizeOptionalText(
    value:
      unknown
   ) {
    if (
      typeof value !==
        "string"
    ) {
      return null;
    }
   
    const normalized =
      value.trim();
   
    return normalized ||
      null;
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
   
      sanitizedItems.push(
        candidate as
          unknown as
          SearchPouchItem
      );
    }
   
    return sanitizedItems;
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
          VidaPouchSalesMode.WAITLIST
      ) {
        return NextResponse.json(
          {
            error:
              salesMode ===
                VidaPouchSalesMode.STRIPE
                ? "VidaPouch is currently accepting payments instead of waitlist reservations."
                : "New VidaPouch requests are temporarily paused.",
   
            salesMode,
          },
          {
            status:
              409,
          }
        );
      }
   
      let body:
        WaitlistRequestBody;
   
      try {
        body =
          (await request.json()) as
            WaitlistRequestBody;
      } catch {
        return NextResponse.json(
          {
            error:
              "The waitlist request is not valid JSON.",
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
   
      if (
        !isNonEmptyString(
          body.customerEmail
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Please enter a valid email address.",
          },
          {
            status:
              400,
          }
        );
      }
   
      const selectedPlan =
        getSearchPlan(
          body.plan
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
   
      const {
        pouchItems:
          verifiedPouchItems,
      } =
        await revalidatePouchItemsForCheckout(
          submittedPouchItems
        );
   
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
                  "Waitlist price calculations are not active yet. Please contact the VidaPouch concierge.",
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
                  "The estimated price could not be verified. Please review your selections.",
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
   
      const databasePurchaseOption =
        body.purchaseOption ===
          "subscription"
          ? VidaPouchPurchaseOption.SUBSCRIPTION
          : VidaPouchPurchaseOption.ONE_TIME;
   
      const entry =
        await prisma
          .vidaPouchWaitlistEntry
          .create({
            data: {
              source:
VidaPouchWaitlistSource.VIDASEARCH,


              customerEmail:
                body.customerEmail
                  .trim()
                  .toLowerCase(),
   
              customerName:
                normalizeOptionalText(
                  body.customerName
                ),
   
              customerPhone:
                normalizeOptionalText(
                  body.customerPhone
                ),
   
              purchaseOption:
                databasePurchaseOption,
   
              planKey:
                body.plan,
   
              planName:
                pooledPricing.planName,
   
              supplementCount:
                verifiedPouchItems.length,
   
              estimatedPlanPrice:
                pooledPricing
                  .planMonthlyPrice,
   
              estimatedOverageFee:
                planOverageFee,
   
              estimatedTotalPrice:
                pooledPricing
                  .totalMonthlyPrice,
   
              currency:
                "usd",
   
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
                    (
                      item
                    ) => ({
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
   
      return NextResponse.json(
        {
          success:
            true,
   
          waitlistEntryId:
            entry.id,
        },
        {
          status:
            201,
   
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
        "Unable to create VidaPouch waitlist entry:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to join the VidaPouch waitlist.",
        },
        {
          status:
            500,
        }
      );
    }
   }
   