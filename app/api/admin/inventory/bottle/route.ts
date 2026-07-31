import {
    NextResponse,
   } from "next/server";
   
   import {
    cookies,
   } from "next/headers";
   
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
   
   async function requireAdmin() {
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
      return null;
    }
   
    return session;
   }
   
   function optionalText(
    value:
      unknown
   ) {
    if (
      typeof value !==
      "string"
    ) {
      return null;
    }
   
    const trimmed =
      value.trim();
   
    return trimmed
      ? trimmed
      : null;
   }
   
   function optionalDate(
    value:
      unknown
   ) {
    if (
      typeof value !==
        "string" ||
      !value.trim()
    ) {
      return null;
    }
   
    const date =
      new Date(
        value
      );
   
    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      throw new Error(
        "Invalid date."
      );
    }
   
    return date;
   }
   
   function decimalValue(
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
   
   export async function PATCH(
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
   
      const bottleId =
        optionalText(
          body.bottleId
        );
   
      if (
        !bottleId
      ) {
        return NextResponse.json(
          {
            error:
              "Bottle ID is required.",
          },
          {
            status:
              400,
          }
        );
      }
   
      const bottle =
        await prisma
          .vidaPouchInventoryBottle
          .findUnique({
            where: {
              id:
                bottleId,
            },
   
            include: {
              allocations: {
                select: {
                  id:
                    true,
                },
   
                take:
                  1,
              },
            },
          });
   
      if (
        !bottle
      ) {
        return NextResponse.json(
          {
            error:
              "Inventory bottle was not found.",
          },
          {
            status:
              404,
          }
        );
      }
   
      const bottleCost =
        decimalValue(
          body.bottleCost,
          "Bottle cost"
        );
   
      const allocatedShippingCost =
        decimalValue(
          body.allocatedShippingCost,
          "Allocated shipping cost"
        );
   
      const allocatedTaxCost =
        decimalValue(
          body.allocatedTaxCost,
          "Allocated tax cost"
        );
   
      const landedCost =
        bottleCost
          .add(
            allocatedShippingCost
          )
          .add(
            allocatedTaxCost
          );
   
      const updatedBottle =
        await prisma
          .vidaPouchInventoryBottle
          .update({
            where: {
              id:
                bottleId,
            },
   
            data: {
              manufacturerLotNumber:
                optionalText(
                  body.manufacturerLotNumber
                ),
   
              expirationDate:
                optionalDate(
                  body.expirationDate
                ),
   
              supplier:
                optionalText(
                  body.supplier
                ),
   
              supplierOrderNumber:
                optionalText(
                  body.supplierOrderNumber
                ),
   
              purchaseDate:
                optionalDate(
                  body.purchaseDate
                ),
   
              bottleCost,
   
              allocatedShippingCost,
   
              allocatedTaxCost,
   
              landedCost,
   
              storageLocation:
                optionalText(
                  body.storageLocation
                ),
   
              notes:
                optionalText(
                  body.notes
                ),
            },
          });
   
      return NextResponse.json({
        bottle: {
          id:
            updatedBottle.id,
   
          bottleCode:
            updatedBottle.bottleCode,
        },
   
        hasHistoricalAllocations:
          bottle.allocations.length >
          0,
      });
    } catch (
      error
    ) {
      console.error(
        "Inventory bottle update failed:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof
              Error
              ? error.message
              : "Unable to update inventory bottle.",
        },
        {
          status:
            400,
        }
      );
    }
   }
   
   export async function DELETE(
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
   
      const bottleId =
        optionalText(
          body.bottleId
        );
   
      if (
        !bottleId
      ) {
        return NextResponse.json(
          {
            error:
              "Bottle ID is required.",
          },
          {
            status:
              400,
          }
        );
      }
   
      const bottle =
        await prisma
          .vidaPouchInventoryBottle
          .findUnique({
            where: {
              id:
                bottleId,
            },
   
            include: {
              allocations: {
                select: {
                  id:
                    true,
                },
              },
   
              movements: {
                select: {
                  id:
                    true,
   
                  movementType:
                    true,
                },
              },
            },
          });
   
      if (
        !bottle
      ) {
        return NextResponse.json(
          {
            error:
              "Inventory bottle was not found.",
          },
          {
            status:
              404,
          }
        );
      }
   
      if (
        bottle.allocations.length >
        0
      ) {
        return NextResponse.json(
          {
            error:
              "This bottle has inventory allocations and cannot be deleted. Change its status instead so the history is preserved.",
          },
          {
            status:
              409,
          }
        );
      }
   
      const nonReceivingMovements =
        bottle.movements.filter(
          (
            movement
          ) =>
            movement.movementType !==
            "RECEIVED"
        );
   
      if (
        nonReceivingMovements.length >
        0
      ) {
        return NextResponse.json(
          {
            error:
              "This bottle has inventory history and cannot be deleted. Change its status instead so the history is preserved.",
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
          await tx
            .vidaPouchInventoryMovement
            .deleteMany({
              where: {
                bottleId:
                  bottle.id,
              },
            });
   
          await tx
            .vidaPouchInventoryBottle
            .delete({
              where: {
                id:
                  bottle.id,
              },
            });
        }
      );
   
      return NextResponse.json({
        success:
          true,
   
        bottleCode:
          bottle.bottleCode,
      });
    } catch (
      error
    ) {
      console.error(
        "Inventory bottle deletion failed:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof
              Error
              ? error.message
              : "Unable to delete inventory bottle.",
        },
        {
          status:
            400,
        }
      );
    }
   }