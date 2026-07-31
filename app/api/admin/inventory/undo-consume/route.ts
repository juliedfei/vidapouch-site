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
        "ASSEMBLING"
      ) {
        return NextResponse.json(
          {
            error:
              "Only an assembling fulfillment can be undone.",
          },
          {
            status:
              409,
          }
        );
      }
   
      const consumedAllocations =
        fulfillmentRun.allocations.filter(
          (
            allocation
          ) =>
            allocation.consumedAt &&
            !allocation.releasedAt
        );
   
      if (
        consumedAllocations.length ===
        0
      ) {
        return NextResponse.json(
          {
            error:
              "No consumed inventory allocations were found to undo.",
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
            consumedAllocations
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
   
            const restoredRemainingUnitCount =
              bottle.remainingUnitCount.add(
                allocation.quantity
              );
   
            const restoredReservedUnitCount =
              bottle.reservedUnitCount.add(
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
                    restoredRemainingUnitCount,
   
                  reservedUnitCount:
                    restoredReservedUnitCount,
   
                  status:
                    bottle.status ===
                    "DEPLETED"
                      ? "AVAILABLE"
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
                    null,
                },
              });
   
            await tx
              .vidaPouchInventoryMovement
              .create({
                data: {
                  bottleId:
                    bottle.id,
   
                  movementType:
                    "CONSUMPTION_REVERSED",
   
                  quantity:
                    allocation.quantity,
   
                  referenceType:
                    "FULFILLMENT_RUN",
   
                  referenceId:
                    fulfillmentRun.id,
   
                  reason:
                    "Consumed inventory restored to reserved inventory by admin.",
   
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
                  "INVENTORY_RESERVED",
   
                assemblingAt:
                  null,
              },
            });
        }
      );
   
      return NextResponse.json({
        success:
          true,
   
        restoredAllocationCount:
          consumedAllocations.length,
      });
    } catch (
      error
    ) {
      console.error(
        "Undo inventory consumption failed:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof
              Error
              ? error.message
              : "Unable to undo inventory consumption.",
        },
        {
          status:
            400,
        }
      );
    }
   }