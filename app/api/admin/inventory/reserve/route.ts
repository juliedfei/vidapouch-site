import {
    NextRequest,
    NextResponse,
   } from "next/server";
   
   import {
    Prisma,
   } from "@/lib/generated/prisma/client";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
   } from "@/lib/admin/adminSession";


   import {
    buildInventoryProductKey,
   } from "@/lib/inventory/inventoryProductIdentity";
   


   


   
   
   type AllocationPlan = {
    bottleId:
      string;
   
    quantity:
      Prisma.Decimal;
   
    unitCost:
      Prisma.Decimal;
   
    totalCost:
      Prisma.Decimal;
   };
   
   export async function POST(
    request:
      NextRequest
   ) {
    const sessionToken =
      request.cookies.get(
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
            "Unauthorized.",
        },
        {
          status:
            401,
        }
      );
    }
   
    let body:
      unknown;
   
    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status:
            400,
        }
      );
    }
   
    if (
      typeof body !==
        "object" ||
      body ===
        null
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status:
            400,
        }
      );
    }
   
    const data =
      body as Record<
        string,
        unknown
   >;
   
    const orderId =
      typeof data.orderId ===
        "string"
        ? data.orderId
        : null;
   
    const billingCycleId =
      typeof data.billingCycleId ===
        "string" &&
      data.billingCycleId
        ? data.billingCycleId
        : null;
   
    if (
      !orderId
    ) {
      return NextResponse.json(
        {
          error:
            "Order ID is required.",
        },
        {
          status:
            400,
        }
      );
    }
   
    try {
      const order =
        await prisma
          .vidaPouchOrder
          .findUnique({
            where: {
              id:
                orderId,
            },
   
            include: {
              items:
                true,
   
              billingCycles:
                billingCycleId
                  ? {
                      where: {
                        id:
                          billingCycleId,
                      },
                    }
                  : false,
            },
          });
   
      if (
        !order
      ) {
        return NextResponse.json(
          {
            error:
              "Order was not found.",
          },
          {
            status:
              404,
          }
        );
      }
   
      if (
        order.status !==
          "PAID"
      ) {
        return NextResponse.json(
          {
            error:
              "Inventory can only be reserved for a paid order.",
          },
          {
            status:
              400,
          }
        );
      }
   
      if (
        billingCycleId &&
        order.purchaseOption !==
          "SUBSCRIPTION"
      ) {
        return NextResponse.json(
          {
            error:
              "A billing cycle can only be used with a subscription order.",
          },
          {
            status:
              400,
          }
        );
      }
   
      if (
        billingCycleId &&
        order.billingCycles.length ===
          0
      ) {
        return NextResponse.json(
          {
            error:
              "Billing cycle was not found for this order.",
          },
          {
            status:
              404,
          }
        );
      }
   
      const revenueAmount =
        billingCycleId
          ? order.billingCycles[0]
              .amountPaid
          : order.totalPrice;
   
      const result =
        await prisma.$transaction(
          async (
            tx
          ) => {
            const existingRun =
              billingCycleId
                ? await tx
                    .vidaPouchFulfillmentRun
                    .findUnique({
                      where: {
                        billingCycleId,
                      },
   
                      include: {
                        allocations:
                          true,
                      },
                    })
                : await tx
                    .vidaPouchFulfillmentRun
                    .findFirst({
                      where: {
                        orderId:
                          order.id,
   
                        billingCycleId:
                          null,
                      },
   
                      include: {
                        allocations:
                          true,
                      },
                    });
   
            if (
              existingRun &&
              existingRun.allocations.length >
                0
            ) {
              throw new Error(
                "Inventory has already been reserved for this fulfillment."
              );
            }
   
            const fulfillmentRun =
              existingRun ??
              await tx
                .vidaPouchFulfillmentRun
                .create({
                  data: {
                    orderId:
                      order.id,
   
                    billingCycleId,
   
                    status:
                      "PENDING",
   
                    revenueAmount,
   
                    currency:
                      order.currency,
                  },
                });
   
            for (
              const item of
              order.items
            ) {
              const normalizedKey =
                buildInventoryProductKey({
                  brand:
                    item.brand,
   
                  productName:
                    item.productName,
   
                  dosage:
                    item.dosage,
   
                  form:
                    item.form,
   
                  unitLabel:
                    item.unitLabel,
                });
   
              const inventoryProduct =
                await tx
                  .vidaPouchInventoryProduct
                  .findUnique({
                    where: {
                      normalizedKey,
                    },
   
                    include: {
                      bottles: {
                        where: {
                          status: {
                            in: [
                              "AVAILABLE",
                              "LOW_STOCK",
                            ],
                          },
                        },
   
                        orderBy: [
                          {
                            expirationDate:
                              "asc",
                          },
                          {
                            receivedAt:
                              "asc",
                          },
                        ],
                      },
                    },
                  });
   
              if (
                !inventoryProduct
              ) {
                throw new Error(
                  `No inventory product matches ${item.brand} ${item.productName}.`
                );
              }
   
              let quantityNeeded =
                new Prisma.Decimal(
                  item.monthlyUnitCount
                );
   
              const allocationPlans:
                AllocationPlan[] =
                  [];
   
              for (
                const bottle of
                inventoryProduct.bottles
              ) {
                if (
                  quantityNeeded.lte(
                    0
                  )
                ) {
                  break;
                }
   
                const availableQuantity =
                  new Prisma.Decimal(
                    bottle.remainingUnitCount
                  ).minus(
                    bottle.reservedUnitCount
                  );
   
                if (
                  availableQuantity.lte(
                    0
                  )
                ) {
                  continue;
                }
   
                const quantityToReserve =
                  Prisma.Decimal.min(
                    availableQuantity,
                    quantityNeeded
                  );
   
                const unitCost =
                  new Prisma.Decimal(
                    bottle.landedCost
                  ).dividedBy(
                    bottle.originalUnitCount
                  );
   
                const totalCost =
                  unitCost
                    .times(
                      quantityToReserve
                    )
                    .toDecimalPlaces(
                      2
                    );
   
                allocationPlans.push({
                  bottleId:
                    bottle.id,
   
                  quantity:
                    quantityToReserve,
   
                  unitCost,
   
                  totalCost,
                });
   
                quantityNeeded =
                  quantityNeeded.minus(
                    quantityToReserve
                  );
              }
   
              if (
                quantityNeeded.gt(
                  0
                )
              ) {
                throw new Error(
                  `Not enough available inventory for ${item.brand} ${item.productName}.`
                );
              }
   
              for (
                const allocation of
                allocationPlans
              ) {
                await tx
                  .vidaPouchInventoryBottle
                  .update({
                    where: {
                      id:
                        allocation.bottleId,
                    },
   
                    data: {
                      reservedUnitCount: {
                        increment:
                          allocation.quantity,
                      },
                    },
                  });
   
                await tx
                  .vidaPouchInventoryAllocation
                  .create({
                    data: {
                      fulfillmentRunId:
                        fulfillmentRun.id,
   
                      orderItemId:
                        item.id,
   
                      bottleId:
                        allocation.bottleId,
   
                      quantity:
                        allocation.quantity,
   
                      unitCostSnapshot:
                        allocation.unitCost,
   
                      totalCostSnapshot:
                        allocation.totalCost,
                    },
                  });
   
                await tx
                  .vidaPouchInventoryMovement
                  .create({
                    data: {
                      bottleId:
                        allocation.bottleId,
   
                      movementType:
                        "RESERVED",
   
                      quantity:
                        allocation.quantity,
   
                      referenceType:
                        "FULFILLMENT_RUN",
   
                      referenceId:
                        fulfillmentRun.id,
   
                      reason:
                        `Reserved for order ${order.id}`,
   
                      createdBy:
                        session.email,
                    },
                  });
              }
            }
   
            const updatedRun =
              await tx
                .vidaPouchFulfillmentRun
                .update({
                  where: {
                    id:
                      fulfillmentRun.id,
                  },
   
                  data: {
                    status:
                      "INVENTORY_RESERVED",
   
                    inventoryReservedAt:
                      new Date(),
                  },
   
                  include: {
                    allocations: {
                      include: {
                        bottle:
                          true,
   
                        orderItem:
                          true,
                      },
                    },
                  },
                });
   
            return updatedRun;
          }
        );
   
      return NextResponse.json({
        success:
          true,
   
        fulfillmentRun:
          result,
      });
    } catch (
      error
    ) {
      console.error(
        "Unable to reserve inventory:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to reserve inventory.",
        },
        {
          status:
            500,
        }
      );
    }
   }
   