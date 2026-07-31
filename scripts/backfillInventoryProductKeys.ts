import {
    loadEnvConfig,
   } from "@next/env";
   
   import type {
    PrismaClient,
   } from "@/lib/generated/prisma/client";
   
   import {
    buildInventoryProductKey,
   } from "@/lib/inventory/inventoryProductIdentity";
   
   /*
   * Standalone scripts do not automatically load
   * Next.js environment files.
   */
   loadEnvConfig(
    process.cwd()
   );
   
   function verifyDatabaseEnvironment() {
    const connectionString =
      process.env.DATABASE_URL ??
      process.env.POSTGRES_PRISMA_URL ??
      process.env.POSTGRES_URL;
   
    if (
      !connectionString
    ) {
      throw new Error(
        [
          "No Prisma database connection variable was found.",
          "Confirm that DATABASE_URL is present in .env.local.",
        ].join(
          " "
        )
      );
    }
   
    try {
      const parsedUrl =
        new URL(
          connectionString
        );
   
      console.log(
        "Prisma database environment loaded:",
        {
          protocol:
            parsedUrl.protocol
              .replace(
                ":",
                ""
              ),
   
          host:
            parsedUrl.hostname,
   
          database:
            parsedUrl.pathname
              .replace(
                /^\//,
                ""
              ) ||
            null,
        }
      );
    } catch {
      console.log(
        "Prisma database environment loaded."
      );
    }
   }
   
   async function updateInventoryProductKeys(
    prisma:
      PrismaClient
   ) {
    const products =
      await prisma
        .vidaPouchInventoryProduct
        .findMany({
          orderBy: {
            createdAt:
              "asc",
          },
        });
   
    console.log(
      `Found ${products.length} inventory product(s).`
    );
   
    let updatedCount =
      0;
   
    let unchangedCount =
      0;
   
    for (
      const product of
      products
    ) {
      const newNormalizedKey =
        buildInventoryProductKey({
          brand:
            product.brand,
   
          productName:
            product.productName,
   
          dosage:
            product.dosage,
   
          form:
            product.form,
   
          unitLabel:
            product.unitLabel,
        });
   
      if (
        product.normalizedKey ===
        newNormalizedKey
      ) {
        unchangedCount +=
          1;
   
        console.log(
          `Already current: ${product.brand} — ${product.productName}`
        );
   
        continue;
      }
   
      const conflictingProduct =
        await prisma
          .vidaPouchInventoryProduct
          .findUnique({
            where: {
              normalizedKey:
                newNormalizedKey,
            },
   
            select: {
              id:
                true,
   
              brand:
                true,
   
              productName:
                true,
            },
          });
   
      if (
        conflictingProduct &&
        conflictingProduct.id !==
          product.id
      ) {
        throw new Error(
          [
            `Cannot update ${product.brand} — ${product.productName}.`,
            `The new normalized key is already used by`,
            `${conflictingProduct.brand} — ${conflictingProduct.productName}.`,
          ].join(
            " "
          )
        );
      }
   
      await prisma
        .vidaPouchInventoryProduct
        .update({
          where: {
            id:
              product.id,
          },
   
          data: {
            normalizedKey:
              newNormalizedKey,
          },
        });
   
      updatedCount +=
        1;
   
      console.log(
        `Updated: ${product.brand} — ${product.productName}`
      );
    }
   
    console.log(
      "\nInventory product key backfill complete:"
    );
   
    console.table({
      productsFound:
        products.length,
   
      productsUpdated:
        updatedCount,
   
      productsAlreadyCurrent:
        unchangedCount,
    });
   }
   
   async function main() {
    verifyDatabaseEnvironment();
   
    const {
      prisma,
    } = await import(
      "@/lib/db"
    );
   
    try {
      await updateInventoryProductKeys(
        prisma
      );
    } finally {
      await prisma.$disconnect();
    }
   }
   
   main().catch(
    (
      error
    ) => {
      console.error(
        "Inventory product key backfill failed:",
        {
          message:
            error instanceof
              Error
              ? error.message
              : String(
                  error
                ),
   
          code:
            (
              typeof error ===
                "object" &&
              error !==
                null &&
              "code" in
                error
            )
              ? String(
                  error.code
                )
              : null,
        }
      );
   
      process.exitCode =
        1;
    }
   );
   