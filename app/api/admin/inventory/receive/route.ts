import {
    NextRequest,
    NextResponse,
   } from "next/server";
   
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
   

   







   
   async function generateBottleCode() {
    const latestBottle =
      await prisma
        .vidaPouchInventoryBottle
        .findFirst({
          orderBy: {
            createdAt:
              "desc",
          },
   
          select: {
            bottleCode:
              true,
          },
        });
   
    const latestNumber =
      latestBottle?.bottleCode
        .match(
          /^VP-BTL-(\d+)$/
        )?.[1];
   
    const nextNumber =
      latestNumber
        ? Number(
            latestNumber
          ) +
          1
        : 1;
   
    return `VP-BTL-${String(
      nextNumber
    ).padStart(
      6,
      "0"
    )}`;
   }
   
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
  > ;
   
    const productName =
      typeof data.productName ===
        "string"
        ? data.productName.trim()
        : "";
   
    const brand =
      typeof data.brand ===
        "string"
        ? data.brand.trim()
        : "";
   
    const dosage =
      typeof data.dosage ===
        "string" &&
      data.dosage.trim()
        ? data.dosage.trim()
        : null;
   
    const form =
      typeof data.form ===
        "string" &&
      data.form.trim()
        ? data.form.trim()
        : null;
   
    const unitLabel =
      typeof data.unitLabel ===
        "string"
        ? data.unitLabel.trim()
        : "";
   
    const manufacturerLotNumber =
      typeof data.manufacturerLotNumber ===
        "string" &&
      data.manufacturerLotNumber.trim()
        ? data.manufacturerLotNumber.trim()
        : null;
   
    const supplier =
      typeof data.supplier ===
        "string" &&
      data.supplier.trim()
        ? data.supplier.trim()
        : null;
   
    const supplierOrderNumber =
      typeof data.supplierOrderNumber ===
        "string" &&
      data.supplierOrderNumber.trim()
        ? data.supplierOrderNumber.trim()
        : null;
   
    const storageLocation =
      typeof data.storageLocation ===
        "string" &&
      data.storageLocation.trim()
        ? data.storageLocation.trim()
        : null;
   
    const notes =
      typeof data.notes ===
        "string" &&
      data.notes.trim()
        ? data.notes.trim()
        : null;
   
    const bottleCost =
      Number(
        data.bottleCost
      );
   
    const allocatedShippingCost =
      data.allocatedShippingCost ===
        undefined ||
      data.allocatedShippingCost ===
        null ||
      data.allocatedShippingCost ===
        ""
        ? 0
        : Number(
            data.allocatedShippingCost
          );
   
    const allocatedTaxCost =
      data.allocatedTaxCost ===
        undefined ||
      data.allocatedTaxCost ===
        null ||
      data.allocatedTaxCost ===
        ""
        ? 0
        : Number(
            data.allocatedTaxCost
          );
   
    const originalUnitCount =
      Number(
        data.originalUnitCount
      );
   
    if (
      !productName ||
      !brand ||
      !unitLabel
    ) {
      return NextResponse.json(
        {
          error:
            "Product name, brand, and unit label are required.",
        },
        {
          status:
            400,
        }
      );
    }
   
    if (
      !Number.isFinite(
        bottleCost
      ) ||
      bottleCost <
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Bottle cost must be a valid non-negative number.",
        },
        {
          status:
            400,
        }
      );
    }
   
    if (
      !Number.isFinite(
        allocatedShippingCost
      ) ||
      allocatedShippingCost <
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Allocated shipping cost must be a valid non-negative number.",
        },
        {
          status:
            400,
        }
      );
    }
   
    if (
      !Number.isFinite(
        allocatedTaxCost
      ) ||
      allocatedTaxCost <
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Allocated tax cost must be a valid non-negative number.",
        },
        {
          status:
            400,
        }
      );
    }
   
    if (
      !Number.isFinite(
        originalUnitCount
      ) ||
      originalUnitCount <=
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Original unit count must be greater than zero.",
        },
        {
          status:
            400,
        }
      );
    }
   
    const expirationDate =
      typeof data.expirationDate ===
        "string" &&
      data.expirationDate
        ? new Date(
            `${data.expirationDate}T12:00:00`
          )
        : null;
   
    const purchaseDate =
      typeof data.purchaseDate ===
        "string" &&
      data.purchaseDate
        ? new Date(
            `${data.purchaseDate}T12:00:00`
          )
        : null;
   



        const normalizedKey =
        buildInventoryProductKey({
          brand,
          productName,
          dosage,
          form,
          unitLabel,
        });



   
    const landedCost =
      bottleCost +
      allocatedShippingCost +
      allocatedTaxCost;
   
    try {
      const bottleCode =
        await generateBottleCode();
   
      const result =
        await prisma.$transaction(
          async (
            tx
          ) => {
            const inventoryProduct =
              await tx
                .vidaPouchInventoryProduct
                .upsert({
                  where: {
                    normalizedKey,
                  },
   
                  update: {
                    active:
                      true,
                  },
   
                  create: {
                    normalizedKey,
                    productName,
                    brand,
                    dosage,
                    form,
                    unitLabel,
                  },
                });
   
            const bottle =
              await tx
                .vidaPouchInventoryBottle
                .create({
                  data: {
                    bottleCode,
   
                    inventoryProductId:
                      inventoryProduct.id,
   
                    manufacturerLotNumber,
   
                    expirationDate,
   
                    supplier,
   
                    supplierOrderNumber,
   
                    purchaseDate,
   
                    status:
                      "QUARANTINED",
   
                    bottleCost,
   
                    allocatedShippingCost,
   
                    allocatedTaxCost,
   
                    landedCost,
   
                    originalUnitCount,
   
                    remainingUnitCount:
                      originalUnitCount,
   
                    reservedUnitCount:
                      0,
   
                    storageLocation,
   
                    notes,
                  },
                });
   
            await tx
              .vidaPouchInventoryMovement
              .create({
                data: {
                  bottleId:
                    bottle.id,
   
                  movementType:
                    "RECEIVED",
   
                  quantity:
                    originalUnitCount,
   
                  referenceType:
                    "INVENTORY_RECEIPT",
   
                  referenceId:
                    bottle.id,
   
                  reason:
                    "Initial bottle receipt",
   
                  createdBy:
                    session.email,
                },
              });
   
            return {
              inventoryProduct,
              bottle,
            };
          }
        );
   
      return NextResponse.json(
        {
          success:
            true,
   
          inventoryProduct:
            result.inventoryProduct,
   
          bottle:
            result.bottle,
        },
        {
          status:
            201,
        }
      );
    } catch (
      error
    ) {
      console.error(
        "Unable to receive inventory bottle:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Unable to receive the inventory bottle.",
        },
        {
          status:
            500,
        }
      );
    }
   }