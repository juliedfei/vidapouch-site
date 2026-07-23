import {
    loadEnvConfig,
   } from "@next/env";
   
   import {
    DataConfidence,
   } from "@/lib/generated/prisma/client";
   
   import type {
    PrismaClient,
   } from "@/lib/generated/prisma/client";
   
   /*
   * Standalone scripts do not automatically load the
   * Next.js environment files.
   *
   * Load the environment before dynamically importing
   * the Prisma singleton.
   */
   loadEnvConfig(
    process.cwd()
   );
   
   const SOURCE_NAME =
    "manual-known-brand-file-v3";
   
   const RETIRED_BRAND_PREFIX =
    "Retired —";
   
   type KnownBrandInput = {
    canonicalName:
      string;
   
    /*
     * Genuine alternate names or spellings for this
     * brand.
     */
    aliases:
      string[];
   
    /*
     * Incorrect BrandAlias records that must be removed.
     */
    removeAliases?:
      string[];
   
    /*
     * Incorrect canonical Brand records that should no
     * longer participate in title matching.
     *
     * These records are renamed rather than deleted so
     * existing products, evidence, scores, and other
     * relationships remain intact.
     */
    retireCanonicalNames?:
      string[];
   };
   
   /*
   * This is the only section you normally edit.
   *
   * canonicalName:
   *   The true brand.
   *
   * aliases:
   *   Genuine alternate spellings or commerce names.
   *
   * removeAliases:
   *   Incorrect aliases that should be deleted.
   *
   * retireCanonicalNames:
   *   Incorrect canonical Brand records that must stop
   *   matching product titles.
   */
   const KNOWN_BRANDS:
    KnownBrandInput[] = [
      {
        canonicalName:
          "Best Naturals",
   
        aliases: [],
   
        removeAliases: [
          "Naturals L-Theanine 200mg",
        ],
   
        retireCanonicalNames: [
          "Naturals L-Theanine 200mg",
        ],
      },
      {
        canonicalName:
          "BulkSupplements",
   
        aliases: [
          "BulkSupplements.com",
        ],
      },
      {
        canonicalName:
          "California Gold Nutrition",
   
        aliases: [],
      },
      {
        canonicalName:
          "DaVinci Labs",
   
        aliases: [],
      },
      {
        canonicalName:
          "Doctor's Best",
   
        aliases: [
          "Doctors Best",
        ],
   
        removeAliases: [
          "Doctor's Best SAM-e",
          "Doctor's Best L-Theanine",
          "Doctors Best SAM-e",
          "Doctors Best L-Theanine",
        ],
   
        retireCanonicalNames: [
          "Doctor's Best SAM-e",
          "Doctor's Best L-Theanine",
          "Doctors Best SAM-e",
          "Doctors Best L-Theanine",
        ],
      },
      {
        canonicalName:
          "Dulcolax",
   
        aliases: [],
   
        removeAliases: [
          "Dulcolax Stimulant Laxative",
        ],
   
        retireCanonicalNames: [
          "Dulcolax Stimulant Laxative",
        ],
      },
      {
        canonicalName:
          "Enzymatic Therapy",
   
        aliases: [],
      },
      {
        canonicalName:
          "EVLution Nutrition",
   
        aliases: [],
      },
      {
        canonicalName:
          "Irwin Naturals",
   
        aliases: [],
   
        removeAliases: [
          "Irwin Naturals Double Potency",
        ],
   
        retireCanonicalNames: [
          "Irwin Naturals Double Potency",
        ],
      },
      {
        canonicalName:
          "Lemme",
   
        aliases: [],
   
        removeAliases: [
          "Lemme Chill",
          "Lemme Chill De",
          "Lemme Chill De-Stress",
        ],
   
        retireCanonicalNames: [
          "Lemme Chill",
          "Lemme Chill De",
          "Lemme Chill De-Stress",
        ],
      },
      {
        canonicalName:
          "Metamucil",
   
        aliases: [],
   
        removeAliases: [
          "Metamucil Clear Fiber",
          "Metamucil Clear Fiber Blend",
        ],
   
        retireCanonicalNames: [
          "Metamucil Clear Fiber",
          "Metamucil Clear Fiber Blend",
        ],
      },
      {
        canonicalName:
          "Momentous",
   
        aliases: [
          "Momentous.com",
        ],
   
        removeAliases: [
          "Momentous L-Theanine",
          "Momentous L-Theanine 60",
        ],
   
        retireCanonicalNames: [
          "Momentous L-Theanine",
          "Momentous L-Theanine 60",
        ],
      },
      {
        canonicalName:
          "Natrol",
   
        aliases: [],
   
        removeAliases: [
          "Natrol Triple",
          "Natrol Triple Magnesium",
        ],
   
        /*
         * This is the important correction for the
         * current Natrol problem.
         */
        retireCanonicalNames: [
          "Natrol Triple",
          "Natrol Triple Magnesium",
        ],
      },
      {
        canonicalName:
          "Nature's Lab",
   
        aliases: [
          "Natures Lab",
        ],
      },
      {
        canonicalName:
          "NatureWise",
   
        aliases: [],
   
        removeAliases: [
          "NatureWise L-Theanine",
          "NatureWise L-Theanine Supplement",
        ],
   
        retireCanonicalNames: [
          "NatureWise L-Theanine",
          "NatureWise L-Theanine Supplement",
        ],
      },
      {
        canonicalName:
          "Nootropics Depot",
   
        aliases: [],
      },
      {
        canonicalName:
          "NOW",
   
        aliases: [
          "NOW Foods",
          "Now Foods",
        ],
   
        removeAliases: [
          "NOW L-Theanine",
          "Now Foods L-Theanine",
          "NOW SAM-E",
          "Now SAM-E",
        ],
   
        retireCanonicalNames: [
          "NOW L-Theanine",
          "Now Foods L-Theanine",
          "NOW SAM-E",
          "Now SAM-E",
        ],
      },
      {
        canonicalName:
          "Onnit",
   
        aliases: [],
   
        removeAliases: [
          "Onnit New",
          "Onnit New Mood",
        ],
   
        retireCanonicalNames: [
          "Onnit New",
          "Onnit New Mood",
        ],
      },
      {
        canonicalName:
          "Pedia-Lax",
   
        aliases: [
          "Pedia Lax",
        ],
   
        removeAliases: [
          "Pedia-Lax Chewable Laxative",
          "Pedia Lax Chewable Laxative",
        ],
   
        retireCanonicalNames: [
          "Pedia-Lax Chewable Laxative",
          "Pedia Lax Chewable Laxative",
        ],
      },
      {
        canonicalName:
          "Pure Encapsulations",
   
        aliases: [],
      },
      {
        canonicalName:
          "Source Naturals",
   
        aliases: [],
   
        removeAliases: [
          "Source Naturals SAMe",
          "Source Naturals SAM-e",
        ],
   
        retireCanonicalNames: [
          "Source Naturals SAMe",
          "Source Naturals SAM-e",
        ],
      },
      {
        canonicalName:
          "Swanson",
   
        aliases: [],
   
        removeAliases: [
          "Swanson Full Spectrum",
          "Swanson Full Spectrum Saffron",
        ],
   
        retireCanonicalNames: [
          "Swanson Full Spectrum",
          "Swanson Full Spectrum Saffron",
        ],
      },
      {
        canonicalName:
          "up & up",
   
        aliases: [
          "up&up",
        ],
   
        removeAliases: [
          "Up &",
        ],
   
        retireCanonicalNames: [
          "Up &",
        ],
      },
      {
        canonicalName:
          "Vital Nutrients",
   
        aliases: [],
      },
    ];
   
   type SyncSummary = {
    brandsCreated:
      number;
   
    brandsExisting:
      number;
   
    brandsUpdated:
      number;
   
    canonicalBrandsRetired:
      number;
   
    canonicalBrandsNotFound:
      number;
   
    aliasesCreated:
      number;
   
    aliasesExisting:
      number;
   
    aliasesUpdated:
      number;
   
    aliasesMoved:
      number;
   
    aliasesRemoved:
      number;
   
    aliasesNotFound:
      number;
   
    aliasConflicts:
      number;
   
    invalidEntries:
      number;
   };
   
   function cleanText(
    value:
      string
   ) {
    return value
      .replace(
        /[®™©]/g,
        ""
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   function normalizeBrandText(
    value:
      string
   ) {
    return cleanText(
      value
    )
      .toLowerCase()
      .replace(
        /&/g,
        " and "
      )
      .replace(
        /['’]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   function isValidBrandName(
    value:
      string
   ) {
    const cleaned =
      cleanText(
        value
      );
   
    const normalized =
      normalizeBrandText(
        cleaned
      );
   
    return (
      cleaned.length >=
        2 &&
      cleaned.length <=
        150 &&
      normalized.length >=
        2
    );
   }
   
   function getConfidenceRank(
    confidence:
      DataConfidence
   ) {
    switch (
      confidence
    ) {
      case DataConfidence.VERIFIED:
        return 4;
   
      case DataConfidence.REPORTED:
        return 3;
   
      case DataConfidence.INFERRED:
        return 2;
   
      case DataConfidence.UNKNOWN:
      default:
        return 1;
    }
   }
   
   function shouldUpgradeConfidence(
    existingConfidence:
      DataConfidence
   ) {
    return (
      getConfidenceRank(
        DataConfidence.REPORTED
      ) >
      getConfidenceRank(
        existingConfidence
      )
    );
   }
   
   function deduplicateTextValues(
    values:
      string[]
   ) {
    const valuesByNormalizedText =
      new Map<
        string,
        string
   >();
   
    for (
      const value of
      values
    ) {
      const cleaned =
        cleanText(
          value
        );
   
      if (
        !isValidBrandName(
          cleaned
        )
      ) {
        continue;
      }
   
      const normalized =
        normalizeBrandText(
          cleaned
        );
   
      if (
        !normalized ||
        valuesByNormalizedText.has(
          normalized
        )
      ) {
        continue;
      }
   
      valuesByNormalizedText.set(
        normalized,
        cleaned
      );
    }
   
    return Array.from(
      valuesByNormalizedText,
      (
        [
          normalizedValue,
          value,
        ]
      ) => ({
        value,
   
        normalizedValue,
      })
    );
   }
   
   function buildAliases(
    brand:
      KnownBrandInput
   ) {
    return deduplicateTextValues(
      [
        brand.canonicalName,
        ...brand.aliases,
      ]
    ).map(
      ({
        value,
        normalizedValue,
      }) => ({
        alias:
          value,
   
        normalizedAlias:
          normalizedValue,
      })
    );
   }
   
   function buildAliasesToRemove(
    brand:
      KnownBrandInput
   ) {
    return deduplicateTextValues(
      brand.removeAliases ??
      []
    ).map(
      ({
        value,
        normalizedValue,
      }) => ({
        alias:
          value,
   
        normalizedAlias:
          normalizedValue,
      })
    );
   }
   
   function buildCanonicalNamesToRetire(
    brand:
      KnownBrandInput
   ) {
    return deduplicateTextValues(
      brand.retireCanonicalNames ??
      []
    ).map(
      ({
        value,
      }) =>
        value
    );
   }
   
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
   
   async function findOrCreateBrand({
    prisma,
    canonicalName,
    summary,
   }: {
    prisma:
      PrismaClient;
   
    canonicalName:
      string;
   
    summary:
      SyncSummary;
   }) {
    const existingBrand =
      await prisma.brand.findFirst({
        where: {
          canonicalName: {
            equals:
              canonicalName,
   
            mode:
              "insensitive",
          },
        },
   
        select: {
          id:
            true,
   
          canonicalName:
            true,
   
          profileConfidence:
            true,
        },
      });
   
    if (
      existingBrand
    ) {
      summary.brandsExisting +=
        1;
   
      if (
        shouldUpgradeConfidence(
          existingBrand.profileConfidence
        )
      ) {
        const updatedBrand =
          await prisma.brand.update({
            where: {
              id:
                existingBrand.id,
            },
   
            data: {
              profileConfidence:
                DataConfidence.REPORTED,
            },
   
            select: {
              id:
                true,
   
              canonicalName:
                true,
   
              profileConfidence:
                true,
            },
          });
   
        summary.brandsUpdated +=
          1;
   
        console.log(
          `Updated brand confidence: ${updatedBrand.canonicalName}`
        );
   
        return updatedBrand;
      }
   
      console.log(
        `Skipped existing brand: ${existingBrand.canonicalName}`
      );
   
      return existingBrand;
    }
   
    const createdBrand =
      await prisma.brand.create({
        data: {
          canonicalName,
   
          profileConfidence:
            DataConfidence.REPORTED,
        },
   
        select: {
          id:
            true,
   
          canonicalName:
            true,
   
          profileConfidence:
            true,
        },
      });
   
    summary.brandsCreated +=
      1;
   
    console.log(
      `Created brand: ${createdBrand.canonicalName}`
    );
   
    return createdBrand;
   }
   
   async function removeIncorrectAlias({
    prisma,
    alias,
    normalizedAlias,
    summary,
   }: {
    prisma:
      PrismaClient;
   
    alias:
      string;
   
    normalizedAlias:
      string;
   
    summary:
      SyncSummary;
   }) {
    const existingAlias =
      await prisma.brandAlias.findUnique({
        where: {
          normalizedAlias,
        },
   
        select: {
          id:
            true,
   
          alias:
            true,
   
          brand: {
            select: {
              canonicalName:
                true,
            },
          },
        },
      });
   
    if (
      !existingAlias
    ) {
      summary.aliasesNotFound +=
        1;
   
      console.log(
        `Incorrect alias was not present: ${alias}`
      );
   
      return;
    }
   
    await prisma.brandAlias.delete({
      where: {
        id:
          existingAlias.id,
      },
    });
   
    summary.aliasesRemoved +=
      1;
   
    console.log(
      [
        `Removed incorrect alias: ${existingAlias.alias}`,
        `from ${existingAlias.brand.canonicalName}`,
      ].join(
        " "
      )
    );
   }
   
   async function moveOrRemoveAliasesFromRetiredBrand({
    prisma,
    retiredBrandId,
    targetBrandId,
    incorrectNormalizedNames,
    targetCanonicalName,
    summary,
   }: {
    prisma:
      PrismaClient;
   
    retiredBrandId:
      string;
   
    targetBrandId:
      string;
   
    incorrectNormalizedNames:
      Set<string>;
   
    targetCanonicalName:
      string;
   
    summary:
      SyncSummary;
   }) {
    const aliases =
      await prisma.brandAlias.findMany({
        where: {
          brandId:
            retiredBrandId,
        },
   
        select: {
          id:
            true,
   
          alias:
            true,
   
          normalizedAlias:
            true,
        },
      });
   
    for (
      const alias of
      aliases
    ) {
      /*
       * Do not preserve an alias that is itself one of
       * the known incorrect expanded product phrases.
       */
      if (
        incorrectNormalizedNames.has(
          alias.normalizedAlias
        )
      ) {
        await prisma.brandAlias.delete({
          where: {
            id:
              alias.id,
          },
        });
   
        summary.aliasesRemoved +=
          1;
   
        console.log(
          `Removed incorrect alias from retired brand: ${alias.alias}`
        );
   
        continue;
      }
   
      const conflictingAlias =
        await prisma.brandAlias.findUnique({
          where: {
            normalizedAlias:
              alias.normalizedAlias,
          },
   
          select: {
            id:
              true,
   
            brandId:
              true,
          },
        });
   
      /*
       * This normally finds the same alias record. It is
       * retained for defensive clarity.
       */
      if (
        conflictingAlias &&
        conflictingAlias.id !==
          alias.id
      ) {
        if (
          conflictingAlias.brandId ===
            targetBrandId
        ) {
          await prisma.brandAlias.delete({
            where: {
              id:
                alias.id,
            },
          });
   
          summary.aliasesRemoved +=
            1;
   
          continue;
        }
   
        summary.aliasConflicts +=
          1;
   
        console.warn(
          `Could not move alias "${alias.alias}" because it belongs to another brand.`
        );
   
        continue;
      }
   
      await prisma.brandAlias.update({
        where: {
          id:
            alias.id,
        },
   
        data: {
          brandId:
            targetBrandId,
   
          source:
            SOURCE_NAME,
   
          confidence:
            DataConfidence.REPORTED,
        },
      });
   
      summary.aliasesMoved +=
        1;
   
      console.log(
        `Moved alias: ${alias.alias} → ${targetCanonicalName}`
      );
    }
   }
   
   async function retireIncorrectCanonicalBrand({
    prisma,
    incorrectCanonicalName,
    targetBrandId,
    targetCanonicalName,
    incorrectNormalizedNames,
    summary,
   }: {
    prisma:
      PrismaClient;
   
    incorrectCanonicalName:
      string;
   
    targetBrandId:
      string;
   
    targetCanonicalName:
      string;
   
    incorrectNormalizedNames:
      Set<string>;
   
    summary:
      SyncSummary;
   }) {
    const incorrectBrand =
      await prisma.brand.findFirst({
        where: {
          canonicalName: {
            equals:
              incorrectCanonicalName,
   
            mode:
              "insensitive",
          },
        },
   
        select: {
          id:
            true,
   
          canonicalName:
            true,
        },
      });
   
    if (
      !incorrectBrand
    ) {
      summary.canonicalBrandsNotFound +=
        1;
   
      console.log(
        `Incorrect canonical brand was not present: ${incorrectCanonicalName}`
      );
   
      return;
    }
   
    if (
      incorrectBrand.id ===
        targetBrandId
    ) {
      return;
    }
   
    await moveOrRemoveAliasesFromRetiredBrand({
      prisma,
   
      retiredBrandId:
        incorrectBrand.id,
   
      targetBrandId,
   
      incorrectNormalizedNames,
   
      targetCanonicalName,
   
      summary,
    });
   
    /*
     * Preserve the record and all of its relationships,
     * but rename it so longest-prefix matching can never
     * mistake it for an active brand.
     */
    const retiredCanonicalName =
      [
        RETIRED_BRAND_PREFIX,
        incorrectBrand.canonicalName,
        incorrectBrand.id.slice(
          -8
        ),
      ].join(
        " "
      );
   
    await prisma.brand.update({
      where: {
        id:
          incorrectBrand.id,
      },
   
      data: {
        canonicalName:
          retiredCanonicalName,
   
        profileConfidence:
          DataConfidence.UNKNOWN,
      },
    });
   
    summary.canonicalBrandsRetired +=
      1;
   
    console.log(
      [
        `Retired incorrect canonical brand:`,
        `"${incorrectBrand.canonicalName}"`,
        `→ "${retiredCanonicalName}"`,
      ].join(
        " "
      )
    );
   }
   
   async function syncAlias({
    prisma,
    alias,
    normalizedAlias,
    brandId,
    canonicalName,
    summary,
   }: {
    prisma:
      PrismaClient;
   
    alias:
      string;
   
    normalizedAlias:
      string;
   
    brandId:
      string;
   
    canonicalName:
      string;
   
    summary:
      SyncSummary;
   }) {
    const existingAlias =
      await prisma.brandAlias.findUnique({
        where: {
          normalizedAlias,
        },
   
        select: {
          id:
            true,
   
          alias:
            true,
   
          brandId:
            true,
   
          confidence:
            true,
   
          source:
            true,
   
          brand: {
            select: {
              canonicalName:
                true,
            },
          },
        },
      });
   
    if (
      existingAlias &&
      existingAlias.brandId !==
        brandId
    ) {
      summary.aliasConflicts +=
        1;
   
      console.warn(
        [
          `Alias conflict: "${alias}"`,
          `already belongs to "${existingAlias.brand.canonicalName}",`,
          `not "${canonicalName}".`,
        ].join(
          " "
        )
      );
   
      return;
    }
   
    if (
      existingAlias
    ) {
      const needsUpdate =
        existingAlias.alias !==
          alias ||
        existingAlias.confidence !==
          DataConfidence.REPORTED ||
        existingAlias.source !==
          SOURCE_NAME;
   
      if (
        needsUpdate
      ) {
        await prisma.brandAlias.update({
          where: {
            id:
              existingAlias.id,
          },
   
          data: {
            alias,
   
            brandId,
   
            source:
              SOURCE_NAME,
   
            confidence:
              DataConfidence.REPORTED,
          },
        });
   
        summary.aliasesUpdated +=
          1;
   
        console.log(
          `Updated alias: ${alias} → ${canonicalName}`
        );
   
        return;
      }
   
      summary.aliasesExisting +=
        1;
   
      console.log(
        `Skipped existing alias: ${alias} → ${canonicalName}`
      );
   
      return;
    }
   
    await prisma.brandAlias.create({
      data: {
        alias,
   
        normalizedAlias,
   
        brandId,
   
        source:
          SOURCE_NAME,
   
        confidence:
          DataConfidence.REPORTED,
      },
    });
   
    summary.aliasesCreated +=
      1;
   
    console.log(
      `Created alias: ${alias} → ${canonicalName}`
    );
   }
   
   async function syncKnownBrand({
    prisma,
    input,
    summary,
   }: {
    prisma:
      PrismaClient;
   
    input:
      KnownBrandInput;
   
    summary:
      SyncSummary;
   }) {
    const canonicalName =
      cleanText(
        input.canonicalName
      );
   
    if (
      !isValidBrandName(
        canonicalName
      )
    ) {
      summary.invalidEntries +=
        1;
   
      console.warn(
        `Skipped invalid brand entry: "${input.canonicalName}"`
      );
   
      return;
    }
   
    const brand =
      await findOrCreateBrand({
        prisma,
   
        canonicalName,
   
        summary,
      });
   
    const aliasesToRemove =
      buildAliasesToRemove(
        input
      );
   
    const canonicalNamesToRetire =
      buildCanonicalNamesToRetire(
        input
      );
   
    const incorrectNormalizedNames =
      new Set(
        [
          ...aliasesToRemove.map(
            (
              alias
            ) =>
              alias.normalizedAlias
          ),
   
          ...canonicalNamesToRetire.map(
            (
              name
            ) =>
              normalizeBrandText(
                name
              )
          ),
        ]
      );
   
    /*
     * Retire incorrect canonical records before adding
     * the valid aliases.
     */
    for (
      const incorrectCanonicalName of
      canonicalNamesToRetire
    ) {
      await retireIncorrectCanonicalBrand({
        prisma,
   
        incorrectCanonicalName,
   
        targetBrandId:
          brand.id,
   
        targetCanonicalName:
          brand.canonicalName,
   
        incorrectNormalizedNames,
   
        summary,
      });
    }
   
    /*
     * Remove any remaining incorrect alias records,
     * regardless of which incorrect brand created them.
     */
    for (
      const {
        alias,
        normalizedAlias,
      } of aliasesToRemove
    ) {
      await removeIncorrectAlias({
        prisma,
   
        alias,
   
        normalizedAlias,
   
        summary,
      });
    }
   
    const aliases =
      buildAliases(
        input
      );
   
    for (
      const {
        alias,
        normalizedAlias,
      } of aliases
    ) {
      await syncAlias({
        prisma,
   
        alias,
   
        normalizedAlias,
   
        brandId:
          brand.id,
   
        canonicalName:
          brand.canonicalName,
   
        summary,
      });
    }
   }
   
   async function main() {
    verifyDatabaseEnvironment();
   
    const {
      prisma,
    } = await import(
      "@/lib/db"
    );
   
    const summary:
      SyncSummary = {
        brandsCreated:
          0,
   
        brandsExisting:
          0,
   
        brandsUpdated:
          0,
   
        canonicalBrandsRetired:
          0,
   
        canonicalBrandsNotFound:
          0,
   
        aliasesCreated:
          0,
   
        aliasesExisting:
          0,
   
        aliasesUpdated:
          0,
   
        aliasesMoved:
          0,
   
        aliasesRemoved:
          0,
   
        aliasesNotFound:
          0,
   
        aliasConflicts:
          0,
   
        invalidEntries:
          0,
      };
   
    console.log(
      `Synchronizing ${KNOWN_BRANDS.length} known brands...`
    );
   
    try {
      for (
        const input of
        KNOWN_BRANDS
      ) {
        await syncKnownBrand({
          prisma,
   
          input,
   
          summary,
        });
      }
   
      console.log(
        "\nKnown-brand synchronization complete:"
      );
   
      console.table(
        summary
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
        "Known-brand synchronization failed:",
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
   