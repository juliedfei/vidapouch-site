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
   
              status: {
                in: [
                  "INVENTORY_RESERVED",
                  "PENDING",
                ],
              },
            },
   
            orderBy: {
              createdAt:
                "desc",
            },
   
            include: {
              allocations: {
                include: {
                  bottle:
                    true,
                },
              },
            },
          });
   
      if (
        !fulfillmentRun
      ) {
        return NextResponse.json(
          {
            error:
              "No releasable inventory reservation was found for this order.",
          },
          {
            status:
              404,
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
              "This order has no active inventory reservations to release.",
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
            await tx
              .vidaPouchInventoryBottle
              .update({
                where: {
                  id:
                    allocation.bottleId,
                },
   
                data: {
                  reservedUnitCount: {
                    decrement:
                      allocation.quantity,
                  },
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
                  releasedAt:
                    new Date(),
                },
              });
   
            await tx
              .vidaPouchInventoryMovement
              .create({
                data: {
                  bottleId:
                    allocation.bottleId,
   
                  movementType:
                    "RELEASED",
   
                  quantity:
                    allocation.quantity,
   
                  referenceType:
                    "FULFILLMENT_RUN",
   
                  referenceId:
                    fulfillmentRun.id,
   
                  reason:
                    "Inventory reservation released by admin.",
   
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
                  "PENDING",
   
                inventoryReservedAt:
                  null,
              },
            });
        }
      );
   
      return NextResponse.json({
        success:
          true,
   
        releasedAllocationCount:
          activeAllocations.length,
      });
    } catch (
      error
    ) {
      console.error(
        "Inventory release failed:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof
              Error
              ? error.message
              : "Unable to release inventory.",
        },
        {
          status:
            400,
        }
      );
    }
   }
   