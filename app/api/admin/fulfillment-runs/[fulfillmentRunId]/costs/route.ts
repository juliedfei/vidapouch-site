import {
    cookies,
   } from "next/headers";
   
   import {
    NextResponse,
   } from "next/server";
   
   import {
    Prisma,
    VidaPouchFulfillmentCostType,
   } from "@/lib/generated/prisma/client";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
   } from "@/lib/admin/adminSession";
   
   export const runtime =
    "nodejs";
   
   type RouteContext = {
    params:
      Promise<{
        fulfillmentRunId:
          string;
      }>;
   };
   
   type RequestBody = {
    shippingCost?:
      unknown;
   
    paymentProcessingCost?:
      unknown;
   
    otherCost?:
      unknown;
   
    pouchCostOverride?:
      unknown;
   
    boxCostOverride?:
      unknown;
   
    insertCostOverride?:
      unknown;
   
    labelCostOverride?:
      unknown;
   
    otherPackagingCostOverride?:
      unknown;
   
    laborHourlyRateOverride?:
      unknown;
   
    laborMinutesPerOrderOverride?:
      unknown;
   };
   
   function getNonNegativeDecimal(
    value:
      unknown,
    fieldName:
      string
   ) {
    const numericValue =
      Number(
        value
      );
   
    if (
      !Number.isFinite(
        numericValue
      ) ||
      numericValue <
        0
    ) {
      throw new Error(
        `${fieldName} must be a valid non-negative number.`
      );
    }
   
    return new Prisma.Decimal(
      numericValue
    );
   }
   
   function getOptionalNonNegativeDecimal(
    value:
      unknown,
    fieldName:
      string
   ) {
    if (
      value ===
        null ||
      value ===
        undefined ||
      value ===
        ""
    ) {
      return null;
    }
   
    return getNonNegativeDecimal(
      value,
      fieldName
    );
   }
   
   export async function PATCH(
    request:
      Request,
    context:
      RouteContext
   ) {
    try {
      const cookieStore =
        await cookies();
   
      const sessionToken =
        cookieStore.get(
          ADMIN_SESSION_COOKIE
        )?.value;
   
      const session =
        verifyAdminSessionToken(
          sessionToken
        );
   
      if (
        !session
      ) {
        return NextResponse.json(
          {
            error:
              "Administrator authentication is required.",
          },
          {
            status:
              401,
          }
        );
      }
   
      const {
        fulfillmentRunId,
      } =
        await context.params;
   
      const fulfillmentRun =
        await prisma
          .vidaPouchFulfillmentRun
          .findUnique({
            where: {
              id:
                fulfillmentRunId,
            },
   
            select: {
              id:
                true,
            },
          });
   
      if (
        !fulfillmentRun
      ) {
        return NextResponse.json(
          {
            error:
              "The fulfillment run was not found.",
          },
          {
            status:
              404,
          }
        );
      }
   
      const body =
        await request.json() as
          RequestBody;
   
      const shippingCost =
        getNonNegativeDecimal(
          body.shippingCost,
          "Shipping cost"
        );
   
      const paymentProcessingCost =
        getNonNegativeDecimal(
          body.paymentProcessingCost,
          "Payment-processing cost"
        );
   
      const otherCost =
        getNonNegativeDecimal(
          body.otherCost,
          "Other cost"
        );
   
      const pouchCostOverride =
        getOptionalNonNegativeDecimal(
          body.pouchCostOverride,
          "Pouch-cost override"
        );
   
      const boxCostOverride =
        getOptionalNonNegativeDecimal(
          body.boxCostOverride,
          "Box-cost override"
        );
   
      const insertCostOverride =
        getOptionalNonNegativeDecimal(
          body.insertCostOverride,
          "Insert-cost override"
        );
   
      const labelCostOverride =
        getOptionalNonNegativeDecimal(
          body.labelCostOverride,
          "Label-cost override"
        );
   
      const otherPackagingCostOverride =
        getOptionalNonNegativeDecimal(
          body.otherPackagingCostOverride,
          "Other packaging-cost override"
        );
   
      const laborHourlyRateOverride =
        getOptionalNonNegativeDecimal(
          body.laborHourlyRateOverride,
          "Labor hourly-rate override"
        );
   
      const laborMinutesPerOrderOverride =
        getOptionalNonNegativeDecimal(
          body.laborMinutesPerOrderOverride,
          "Labor-minutes override"
        );
   
      const result =
        await prisma.$transaction(
          async (
            tx
          ) => {
            await tx
              .vidaPouchFulfillmentRun
              .update({
                where: {
                  id:
                    fulfillmentRunId,
                },
   
                data: {
                  pouchCostOverride,
   
                  boxCostOverride,
   
                  insertCostOverride,
   
                  labelCostOverride,
   
                  otherPackagingCostOverride,
   
                  laborHourlyRateOverride,
   
                  laborMinutesPerOrderOverride,
                },
              });
   
            await tx
              .vidaPouchFulfillmentCost
              .deleteMany({
                where: {
                  fulfillmentRunId,
   
                  costType: {
                    in: [
                      VidaPouchFulfillmentCostType.SHIPPING,
                      VidaPouchFulfillmentCostType.PAYMENT_PROCESSING,
                      VidaPouchFulfillmentCostType.OTHER,
                    ],
                  },
                },
              });
   
            const costRecords: {
              fulfillmentRunId:
                string;
   
              costType:
                VidaPouchFulfillmentCostType;
   
              amount:
                Prisma.Decimal;
   
              description:
                string;
            }[] = [];
   
            if (
              shippingCost.greaterThan(
                0
              )
            ) {
              costRecords.push({
                fulfillmentRunId,
   
                costType:
                  VidaPouchFulfillmentCostType.SHIPPING,
   
                amount:
                  shippingCost,
   
                description:
                  "Actual shipping cost",
              });
            }
   
            if (
              paymentProcessingCost.greaterThan(
                0
              )
            ) {
              costRecords.push({
                fulfillmentRunId,
   
                costType:
                  VidaPouchFulfillmentCostType.PAYMENT_PROCESSING,
   
                amount:
                  paymentProcessingCost,
   
                description:
                  "Actual payment-processing cost",
              });
            }
   
            if (
              otherCost.greaterThan(
                0
              )
            ) {
              costRecords.push({
                fulfillmentRunId,
   
                costType:
                  VidaPouchFulfillmentCostType.OTHER,
   
                amount:
                  otherCost,
   
                description:
                  "Other fulfillment cost",
              });
            }
   
            if (
              costRecords.length >
              0
            ) {
              await tx
                .vidaPouchFulfillmentCost
                .createMany({
                  data:
                    costRecords,
                });
            }
   
            const updatedRun =
              await tx
                .vidaPouchFulfillmentRun
                .findUnique({
                  where: {
                    id:
                      fulfillmentRunId,
                  },
   
                  select: {
                    id:
                      true,
   
                    pouchCostOverride:
                      true,
   
                    boxCostOverride:
                      true,
   
                    insertCostOverride:
                      true,
   
                    labelCostOverride:
                      true,
   
                    otherPackagingCostOverride:
                      true,
   
                    laborHourlyRateOverride:
                      true,
   
                    laborMinutesPerOrderOverride:
                      true,
                  },
                });
   
            const costs =
              await tx
                .vidaPouchFulfillmentCost
                .findMany({
                  where: {
                    fulfillmentRunId,
   
                    costType: {
                      in: [
                        VidaPouchFulfillmentCostType.SHIPPING,
                        VidaPouchFulfillmentCostType.PAYMENT_PROCESSING,
                        VidaPouchFulfillmentCostType.OTHER,
                      ],
                    },
                  },
   
                  orderBy: {
                    costType:
                      "asc",
                  },
                });
   
            return {
              updatedRun,
              costs,
            };
          }
        );
   
      return NextResponse.json({
        success:
          true,
   
        fulfillmentRun: {
          id:
            result.updatedRun?.id,
   
          pouchCostOverride:
            result.updatedRun
              ?.pouchCostOverride ===
            null
              ? null
              : Number(
                  result.updatedRun
                    ?.pouchCostOverride
                ),
   
          boxCostOverride:
            result.updatedRun
              ?.boxCostOverride ===
            null
              ? null
              : Number(
                  result.updatedRun
                    ?.boxCostOverride
                ),
   
          insertCostOverride:
            result.updatedRun
              ?.insertCostOverride ===
            null
              ? null
              : Number(
                  result.updatedRun
                    ?.insertCostOverride
                ),
   
          labelCostOverride:
            result.updatedRun
              ?.labelCostOverride ===
            null
              ? null
              : Number(
                  result.updatedRun
                    ?.labelCostOverride
                ),
   
          otherPackagingCostOverride:
            result.updatedRun
              ?.otherPackagingCostOverride ===
            null
              ? null
              : Number(
                  result.updatedRun
                    ?.otherPackagingCostOverride
                ),
   
          laborHourlyRateOverride:
            result.updatedRun
              ?.laborHourlyRateOverride ===
            null
              ? null
              : Number(
                  result.updatedRun
                    ?.laborHourlyRateOverride
                ),
   
          laborMinutesPerOrderOverride:
            result.updatedRun
              ?.laborMinutesPerOrderOverride ===
            null
              ? null
              : Number(
                  result.updatedRun
                    ?.laborMinutesPerOrderOverride
                ),
        },
   
        costs:
          result.costs.map(
            (
              cost
            ) => ({
              id:
                cost.id,
   
              costType:
                cost.costType,
   
              amount:
                Number(
                  cost.amount
                ),
   
              description:
                cost.description,
            })
          ),
      });
    } catch (
      error
    ) {
      console.error(
        "Unable to update fulfillment costs:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to update fulfillment costs.",
        },
        {
          status:
            400,
        }
      );
    }
   }