import {
    NextResponse,
   } from "next/server";
   
   import {
    cookies,
   } from "next/headers";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
   } from "@/lib/admin/adminSession";
   
   async function requireAdmin() {
    const cookieStore =
      await cookies();
   
    const sessionToken =
      cookieStore.get(
        ADMIN_SESSION_COOKIE
      )?.value;
   
    return verifyAdminSessionToken(
      sessionToken
    );
   }
   
   export async function POST(
    request:
      Request
   ) {
    const session =
      await requireAdmin();
   
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
   
    try {
      const body =
        await request.json();
   
      const orderId =
        typeof body.orderId ===
          "string"
          ? body.orderId.trim()
          : "";
   
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
   
      const fulfillmentRun =
        await prisma
          .vidaPouchFulfillmentRun
          .findFirst({
            where: {
              orderId,
   
              billingCycleId:
                null,
            },
   
            orderBy: {
              createdAt:
                "desc",
            },
   
            include: {
              allocations:
                true,
            },
          });
   
      if (
        !fulfillmentRun
      ) {
        return NextResponse.json(
          {
            error:
              "No fulfillment run was found for this order.",
          },
          {
            status:
              404,
          }
        );
      }
   
      if (
        fulfillmentRun.status !==
        "INVENTORY_RESERVED"
      ) {
        return NextResponse.json(
          {
            error:
              "Inventory must be reserved before it can be consumed.",
          },
          {
            status:
              409,
          }
        );
      }
   
      const activeAllocations =
        fulfillmentRun.allocations.filter(
          (
            allocation
          ) =>
            !allocation.releasedAt &&
            !allocation.consumedAt
        );
   
      if (
        activeAllocations.length ===
        0
      ) {
        return NextResponse.json(
          {
            error:
              "There are no active reserved allocations to consume.",
          },
          {
            status:
              409,
          }
        );
      }
   
      await prisma.$transaction(
        async (
          tx
        ) => {
          for (
            const allocation of
            activeAllocations
          ) {
            const bottle =
              await tx
                .vidaPouchInventoryBottle
                .findUnique({
                  where: {
                    id:
                      allocation.bottleId,
                  },
                });
   
            if (
              !bottle
            ) {
              throw new Error(
                "An allocated inventory bottle could not be found."
              );
            }
   
            if (
              bottle.reservedUnitCount.lt(
                allocation.quantity
              )
            ) {
              throw new Error(
                `Bottle ${bottle.bottleCode} does not have enough reserved units to consume this allocation.`
              );
            }
   
            if (
              bottle.remainingUnitCount.lt(
                allocation.quantity
              )
            ) {
              throw new Error(
                `Bottle ${bottle.bottleCode} does not have enough remaining physical inventory.`
              );
            }
   
            const newRemainingUnitCount =
              bottle.remainingUnitCount.sub(
                allocation.quantity
              );
   
            const newReservedUnitCount =
              bottle.reservedUnitCount.sub(
                allocation.quantity
              );
   
            await tx
              .vidaPouchInventoryBottle
              .update({
                where: {
                  id:
                    bottle.id,
                },
   
                data: {
                  remainingUnitCount:
                    newRemainingUnitCount,
   
                  reservedUnitCount:
                    newReservedUnitCount,
   
                  status:
                    newRemainingUnitCount.lte(
                      0
                    )
                      ? "DEPLETED"
                      : bottle.status,
                },
              });
   
            await tx
              .vidaPouchInventoryAllocation
              .update({
                where: {
                  id:
                    allocation.id,
                },
   
                data: {
                  consumedAt:
                    new Date(),
                },
              });
   
            await tx
              .vidaPouchInventoryMovement
              .create({
                data: {
                  bottleId:
                    bottle.id,
   
                  movementType:
                    "CONSUMED",
   
                  quantity:
                    allocation.quantity,
   
                  referenceType:
                    "FULFILLMENT_RUN",
   
                  referenceId:
                    fulfillmentRun.id,
   
                  reason:
                    "Reserved inventory consumed during VidaPouch assembly.",
   
                  createdBy:
                    session.email,
                },
              });
          }
   
          await tx
            .vidaPouchFulfillmentRun
            .update({
              where: {
                id:
                  fulfillmentRun.id,
              },
   
              data: {
                status:
                  "ASSEMBLING",
   
                assemblingAt:
                  new Date(),
              },
            });
        }
      );
   
      return NextResponse.json({
        success:
          true,
   
        consumedAllocationCount:
          activeAllocations.length,
      });
    } catch (
      error
    ) {
      console.error(
        "Inventory consumption failed:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof
              Error
              ? error.message
              : "Unable to consume inventory.",
        },
        {
          status:
            400,
        }
      );
    }
   }
   