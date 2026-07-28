import {
    loadEnvConfig,
   } from "@next/env";
   
   import {
    RetailerType,
   } from "@/lib/generated/prisma/client";
   
   /*
   * Standalone scripts do not automatically load the
   * Next.js environment files.
   */
   loadEnvConfig(
    process.cwd()
   );
   




   
   type RetailerSeed = {
    canonicalName:
      string;
   
    website:
      string;
   
    retailerType:
      RetailerType;
   
    aliases:
      string[];
   };
   
   const RETAILERS:
    RetailerSeed[] = [
    {
      canonicalName:
        "Walmart",
   
      website:
        "https://www.walmart.com",
   
      retailerType:
        RetailerType.MASS_RETAIL,
   
      aliases: [
        "Walmart",
        "Walmart.com",
      ],
    },
   
    {
      canonicalName:
        "Target",
   
      website:
        "https://www.target.com",
   
      retailerType:
        RetailerType.MASS_RETAIL,
   
      aliases: [
        "Target",
        "Target.com",
      ],
    },
   
    {
      canonicalName:
        "CVS Pharmacy",
   
      website:
        "https://www.cvs.com",
   
      retailerType:
        RetailerType.PHARMACY,
   
      aliases: [
        "CVS",
        "CVS Pharmacy",
        "CVS.com",
      ],
    },
   
    {
      canonicalName:
        "Walgreens",
   
      website:
        "https://www.walgreens.com",
   
      retailerType:
        RetailerType.PHARMACY,
   
      aliases: [
        "Walgreens",
        "Walgreens.com",
      ],
    },
   
    {
      canonicalName:
        "Amazon",
   
      website:
        "https://www.amazon.com",
   
      retailerType:
        RetailerType.MARKETPLACE,
   
      aliases: [
        "Amazon",
        "Amazon.com",
      ],
    },
   
    {
      canonicalName:
        "GNC",
   
      website:
        "https://www.gnc.com",
   
      retailerType:
        RetailerType.SPECIALTY,
   
      aliases: [
        "GNC",
        "GNC.com",
      ],
    },
   
    {
      canonicalName:
        "iHerb",
   
      website:
        "https://www.iherb.com",
   
      retailerType:
        RetailerType.SPECIALTY,
   
      aliases: [
        "iHerb",
        "iHerb.com",
      ],
    },
   
    {
      canonicalName:
        "Thrive Market",
   
      website:
        "https://thrivemarket.com",
   
      retailerType:
        RetailerType.SPECIALTY,
   
      aliases: [
        "Thrive Market",
        "ThriveMarket",
      ],
    },
   
    {
      canonicalName:
        "PureFormulas",
   
      website:
        "https://www.pureformulas.com",
   
      retailerType:
        RetailerType.SPECIALTY,
   
      aliases: [
        "PureFormulas",
        "PureFormulas.com",
      ],
    },
   
    {
      canonicalName:
        "Life Extension",
   
      website:
        "https://www.lifeextension.com",
   
      retailerType:
        RetailerType.DIRECT,
   
      aliases: [
        "Life Extension",
        "LifeExtension",
      ],
    },
   
    {
      canonicalName:
        "Puritan's Pride",
   
      website:
        "https://www.puritan.com",
   
      retailerType:
        RetailerType.DIRECT,
   
      aliases: [
        "Puritan's Pride",
        "Puritans Pride",
        "Puritan",
      ],
    },
   
    {
      canonicalName:
        "Thorne",
   
      website:
        "https://www.thorne.com",
   
      retailerType:
        RetailerType.DIRECT,
   
      aliases: [
        "Thorne",
        "Thorne.com",
      ],
    },
   
    {
      canonicalName:
        "MegaFood",
   
      website:
        "https://www.megafood.com",
   
      retailerType:
        RetailerType.DIRECT,
   
      aliases: [
        "MegaFood",
        "MegaFood.com",
      ],
    },
   
    {
      canonicalName:
        "OLLY",
   
      website:
        "https://www.olly.com",
   
      retailerType:
        RetailerType.DIRECT,
   
      aliases: [
        "OLLY",
        "Olly",
        "Olly.com",
      ],
    },
   
    {
      canonicalName:
        "Irwin Naturals",
   
      website:
        "https://www.irwinnaturals.com",
   
      retailerType:
        RetailerType.DIRECT,
   
      aliases: [
        "Irwin Naturals",
        "IrwinNaturals",
      ],
    },
   
    {
      canonicalName:
        "Whole Foods Market",
   
      website:
        "https://www.wholefoodsmarket.com",
   
      retailerType:
        RetailerType.MASS_RETAIL,
   
      aliases: [
        "Whole Foods",
        "Whole Foods Market",
      ],
    },
   
    {
      canonicalName:
        "Macy's",
   
      website:
        "https://www.macys.com",
   
      retailerType:
        RetailerType.MASS_RETAIL,
   
      aliases: [
        "Macy's",
        "Macys",
        "Macy s",
      ],
    },
   
    {
      canonicalName:
        "Hy-Vee",
   
      website:
        "https://www.hy-vee.com",
   
      retailerType:
        RetailerType.MASS_RETAIL,
   
      aliases: [
        "Hy-Vee",
        "Hy Vee",
      ],
    },
   
    {
      canonicalName:
        "Solaray",
   
      website:
        "https://solaray.com",
   
      retailerType:
        RetailerType.DIRECT,
   
      aliases: [
        "Solaray",
        "Solaray.com",
        "Solaray Vitamins",
      ],
    },
   
    {
      canonicalName:
        "The Vitamin Shoppe",
   
      website:
        "https://www.vitaminshoppe.com",
   
      retailerType:
        RetailerType.SPECIALTY,
   
      aliases: [
        "The Vitamin Shoppe",
        "Vitamin Shoppe",
        "VitaminShoppe",
      ],
    },
   
    {
      canonicalName:
        "Sports Research",
   
      website:
        "https://www.sportsresearch.com",
   
      retailerType:
        RetailerType.DIRECT,
   
      aliases: [
        "Sports Research",
        "SportsResearch",
      ],
    },
   
    {
      canonicalName:
        "Nordstrom",
   
      website:
        "https://www.nordstrom.com",
   
      retailerType:
        RetailerType.MASS_RETAIL,
   
      aliases: [
        "Nordstrom",
        "Nordstrom.com",
      ],
    },
   ];
   
   function normalizeAlias(
    value:
      string
   ) {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /['’"]/g,
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
   
   async function main() {
    /*
     * Import Prisma only after .env.local has loaded.
     */
    const {
      prisma,
    } =
      await import(
        "../lib/db"
      );
   
    try {
      for (
        const retailerSeed of
        RETAILERS
      ) {
        const retailer =
          await prisma
            .retailer
            .upsert({
              where: {
                canonicalName:
                  retailerSeed
                    .canonicalName,
              },
   
              create: {
                canonicalName:
                  retailerSeed
                    .canonicalName,
   
                website:
                  retailerSeed
                    .website,
   
                retailerType:
                  retailerSeed
                    .retailerType,
   
                active:
                  true,
              },
   
              update: {
                website:
                  retailerSeed
                    .website,
   
                retailerType:
                  retailerSeed
                    .retailerType,
   
                active:
                  true,
              },
            });
   
        const aliases =
          Array.from(
            new Set([
              retailerSeed
                .canonicalName,
   
              ...retailerSeed
                .aliases,
            ])
          );
   
        for (
          const alias of
          aliases
        ) {
          const normalizedAlias =
            normalizeAlias(
              alias
            );
   
          if (
            !normalizedAlias
          ) {
            continue;
          }
   
          await prisma
            .retailerAlias
            .upsert({
              where: {
                normalizedAlias,
              },
   
              create: {
                alias,
   
                normalizedAlias,
   
                retailerId:
                  retailer.id,
              },
   
              update: {
                alias,
   
                retailerId:
                  retailer.id,
              },
            });
        }
   
        console.log(
          `Seeded retailer: ${retailerSeed.canonicalName}`
        );
      }
   
      console.log(
        `Successfully seeded ${RETAILERS.length} approved retailers.`
      );
    } finally {
      await prisma
        .$disconnect();
    }
   }
   
   main().catch(
    (error) => {
      console.error(
        "Retailer seed failed:",
        error
      );
   
      process.exitCode =
        1;
    }
   );