import "dotenv/config";

import {
 PrismaClient,
 VidaPouchFulfillmentScenario,
 VidaPouchPricingVersionStatus,
 VidaPouchSettingValueType,
} from "../lib/generated/prisma/client";

import {
 PrismaPg,
} from "@prisma/adapter-pg";

import {
 Pool,
} from "pg";

const connectionString =
 process.env.DATABASE_URL;

if (
 !connectionString
) {
 throw new Error(
   "DATABASE_URL is not defined."
 );
}

const pool =
 new Pool({
   connectionString,
 });

const adapter =
 new PrismaPg(
   pool
 );

const prisma =
 new PrismaClient({
   adapter,
 });

const VERSION_NAME =
 "initial-pooled-pricing";

/*
* Temporary allowances used to verify that the
* continuous Plan Overage calculation works.
*
* These are not final profitability decisions.
* They should be reviewed against the completed
* fulfillment and product-cost model before launch.
*/
const TEST_POOLED_ALLOWANCES = {
 essential:
   "15.00",

 complete:
   "25.00",

 premier:
   "40.00",
} as const;

type PlanSeed = {
 planKey:
   keyof typeof TEST_POOLED_ALLOWANCES;

 name:
   string;

 monthlyPrice:
   string;

 supplementLimit:
   number;

 pooledCostAllowance:
   string;

 fulfillmentScenario:
   VidaPouchFulfillmentScenario;

 displayOrder:
   number;

 customerDescription:
   string;

 customerSelectionDescription:
   string;
};

const PLAN_SEEDS:
 PlanSeed[] =
 [
   {
     planKey:
       "essential",

     name:
       "Essential",

     monthlyPrice:
       "59.99",

     supplementLimit:
       3,

     pooledCostAllowance:
       TEST_POOLED_ALLOWANCES
         .essential,

     fulfillmentScenario:
       VidaPouchFulfillmentScenario.SINGLE_BOX,

     displayOrder:
       1,

     customerDescription:
       "Up to 3 supplements",

     customerSelectionDescription:
       "A simple personalized daily supplement routine.",
   },

   {
     planKey:
       "complete",

     name:
       "Complete",

     monthlyPrice:
       "79.99",

     supplementLimit:
       5,

     pooledCostAllowance:
       TEST_POOLED_ALLOWANCES
         .complete,

     fulfillmentScenario:
       VidaPouchFulfillmentScenario.DUAL_BOX,

     displayOrder:
       2,

     customerDescription:
       "Up to 5 supplements",

     customerSelectionDescription:
       "More room for a complete morning and evening routine.",
   },

   {
     planKey:
       "premier",

     name:
       "Premier",

     monthlyPrice:
       "99.99",

     supplementLimit:
       8,

     pooledCostAllowance:
       TEST_POOLED_ALLOWANCES
         .premier,

     fulfillmentScenario:
       VidaPouchFulfillmentScenario.DUAL_BOX,

     displayOrder:
       3,

     customerDescription:
       "Up to 8 supplements",

     customerSelectionDescription:
       "Our most flexible personalized supplement routine.",
   },
 ];

type NumericSettingSeed = {
 settingKey:
   string;

 valueType:
   typeof VidaPouchSettingValueType.NUMERIC;

 numericValue:
   string;

 description:
   string;
};

type TextSettingSeed = {
 settingKey:
   string;

 valueType:
   typeof VidaPouchSettingValueType.TEXT;

 textValue:
   string;

 description:
   string;
};

type BooleanSettingSeed = {
 settingKey:
   string;

 valueType:
   typeof VidaPouchSettingValueType.BOOLEAN;

 booleanValue:
   boolean;

 description:
   string;
};

type PricingSettingSeed =
 | NumericSettingSeed
 | TextSettingSeed
 | BooleanSettingSeed;

const SETTING_SEEDS:
 PricingSettingSeed[] =
 [
   {
     settingKey:
       "sourcing_buffer_rate",

     valueType:
       VidaPouchSettingValueType.NUMERIC,

     numericValue:
       "0.10",

     description:
       "Buffer applied to qualified listing-derived monthly product costs.",
   },

   {
     settingKey:
       "minimum_qualified_listing_count",

     valueType:
       VidaPouchSettingValueType.NUMERIC,

     numericValue:
       "2",

     description:
       "Minimum qualified exact listings required for confirmed automated pricing.",
   },

   {
     settingKey:
       "overage_margin_rate",

     valueType:
       VidaPouchSettingValueType.NUMERIC,

     numericValue:
       "0.25",

     description:
       "Target gross margin applied to raw pooled product-cost overages.",
   },

   {
     settingKey:
       "overage_rounding_increment",

     valueType:
       VidaPouchSettingValueType.NUMERIC,

     numericValue:
       "0.01",

     description:
       "Dollar increment used to round the final customer-facing Plan Overage.",
   },

   {
     settingKey:
       "pricing_configuration_cache_seconds",

     valueType:
       VidaPouchSettingValueType.NUMERIC,

     numericValue:
       "300",

     description:
       "Server-side cache duration for the current pricing configuration.",
   },

   {
     settingKey:
       "retail_cost_basis_method",

     valueType:
       VidaPouchSettingValueType.TEXT,

     textValue:
       "median-exact-listings",

     description:
       "Method used to convert qualified exact vendor listings into a monthly product-cost estimate.",
   },

   {
     settingKey:
       "uncertain_pricing_behavior",

     valueType:
       VidaPouchSettingValueType.TEXT,

     textValue:
       "confirm-before-checkout",

     description:
       "Behavior used when a reliable product cost cannot be determined.",
   },

   {
     settingKey:
       "pooled_plan_overages_enabled",

     valueType:
       VidaPouchSettingValueType.BOOLEAN,

     /*
      * Enabled so the current Plan Overage is
      * recalculated whenever the customer changes
      * products, quantities, or tiers.
      */
     booleanValue:
       true,

     description:
       "Enables continuous customer-facing pooled Plan Overage calculations.",
   },

   {
     settingKey:
       "show_internal_allowance_to_customer",

     valueType:
       VidaPouchSettingValueType.BOOLEAN,

     /*
      * This must always remain false.
      *
      * Customers see only their Plan Overage, not
      * the confidential dollar allowance assigned
      * to the selected tier.
      */
     booleanValue:
       false,

     description:
       "Must remain false. Internal pooled plan allowances are confidential.",
   },
 ];

async function getOrCreatePricingVersion() {
 const existingVersion =
   await prisma
     .vidaPouchPricingVersion
     .findUnique({
       where: {
         versionName:
           VERSION_NAME,
       },
     });

 if (
   existingVersion
 ) {
   return prisma
     .vidaPouchPricingVersion
     .update({
       where: {
         id:
           existingVersion.id,
       },

       data: {
         /*
          * Keep this configuration in draft status
          * while the example allowances are tested.
          */
         status:
           VidaPouchPricingVersionStatus.DRAFT,

         notes:
           "Draft pooled pricing configuration with temporary test allowances. Validate profitability before production activation.",
       },
     });
 }

 return prisma
   .vidaPouchPricingVersion
   .create({
     data: {
       versionName:
         VERSION_NAME,

       status:
         VidaPouchPricingVersionStatus.DRAFT,

       notes:
         "Draft pooled pricing configuration with temporary test allowances. Validate profitability before production activation.",
     },
   });
}

async function seedPlans(
 pricingVersionId:
   string
) {
 for (
   const plan of
   PLAN_SEEDS
 ) {
   await prisma
     .vidaPouchPlan
     .upsert({
       where: {
         planKey_pricingVersionId: {
           planKey:
             plan.planKey,

           pricingVersionId,
         },
       },

       create: {
         pricingVersionId,

         planKey:
           plan.planKey,

         name:
           plan.name,

         monthlyPrice:
           plan.monthlyPrice,

         supplementLimit:
           plan.supplementLimit,

         pooledCostAllowance:
           plan.pooledCostAllowance,

         fulfillmentScenario:
           plan.fulfillmentScenario,

         displayOrder:
           plan.displayOrder,

         active:
           true,

         customerDescription:
           plan.customerDescription,

         customerSelectionDescription:
           plan.customerSelectionDescription,
       },

       update: {
         name:
           plan.name,

         monthlyPrice:
           plan.monthlyPrice,

         supplementLimit:
           plan.supplementLimit,

         /*
          * Unlike the original seed, this explicitly
          * updates the existing null allowance so the
          * continuous calculation can be tested.
          */
         pooledCostAllowance:
           plan.pooledCostAllowance,

         fulfillmentScenario:
           plan.fulfillmentScenario,

         displayOrder:
           plan.displayOrder,

         active:
           true,

         customerDescription:
           plan.customerDescription,

         customerSelectionDescription:
           plan.customerSelectionDescription,
       },
     });

   console.log(
     `Configured ${plan.name} plan with a temporary pooled allowance of $${plan.pooledCostAllowance}.`
   );
 }
}

async function seedNumericSetting({
 pricingVersionId,
 setting,
}: {
 pricingVersionId:
   string;

 setting:
   NumericSettingSeed;
}) {
 await prisma
   .vidaPouchPricingSetting
   .upsert({
     where: {
       pricingVersionId_settingKey: {
         pricingVersionId,

         settingKey:
           setting.settingKey,
       },
     },

     create: {
       pricingVersionId,

       settingKey:
         setting.settingKey,

       valueType:
         setting.valueType,

       numericValue:
         setting.numericValue,

       textValue:
         null,

       booleanValue:
         null,

       description:
         setting.description,

       active:
         true,
     },

     update: {
       valueType:
         setting.valueType,

       numericValue:
         setting.numericValue,

       textValue:
         null,

       booleanValue:
         null,

       description:
         setting.description,

       active:
         true,
     },
   });
}

async function seedTextSetting({
 pricingVersionId,
 setting,
}: {
 pricingVersionId:
   string;

 setting:
   TextSettingSeed;
}) {
 await prisma
   .vidaPouchPricingSetting
   .upsert({
     where: {
       pricingVersionId_settingKey: {
         pricingVersionId,

         settingKey:
           setting.settingKey,
       },
     },

     create: {
       pricingVersionId,

       settingKey:
         setting.settingKey,

       valueType:
         setting.valueType,

       numericValue:
         null,

       textValue:
         setting.textValue,

       booleanValue:
         null,

       description:
         setting.description,

       active:
         true,
     },

     update: {
       valueType:
         setting.valueType,

       numericValue:
         null,

       textValue:
         setting.textValue,

       booleanValue:
         null,

       description:
         setting.description,

       active:
         true,
     },
   });
}

async function seedBooleanSetting({
 pricingVersionId,
 setting,
}: {
 pricingVersionId:
   string;

 setting:
   BooleanSettingSeed;
}) {
 await prisma
   .vidaPouchPricingSetting
   .upsert({
     where: {
       pricingVersionId_settingKey: {
         pricingVersionId,

         settingKey:
           setting.settingKey,
       },
     },

     create: {
       pricingVersionId,

       settingKey:
         setting.settingKey,

       valueType:
         setting.valueType,

       numericValue:
         null,

       textValue:
         null,

       booleanValue:
         setting.booleanValue,

       description:
         setting.description,

       active:
         true,
     },

     update: {
       valueType:
         setting.valueType,

       numericValue:
         null,

       textValue:
         null,

       booleanValue:
         setting.booleanValue,

       description:
         setting.description,

       active:
         true,
     },
   });
}

async function seedSettings(
 pricingVersionId:
   string
) {
 for (
   const setting of
   SETTING_SEEDS
 ) {
   if (
     setting.valueType ===
     VidaPouchSettingValueType.NUMERIC
   ) {
     await seedNumericSetting({
       pricingVersionId,
       setting,
     });
   } else if (
     setting.valueType ===
     VidaPouchSettingValueType.TEXT
   ) {
     await seedTextSetting({
       pricingVersionId,
       setting,
     });
   } else {
     await seedBooleanSetting({
       pricingVersionId,
       setting,
     });
   }

   console.log(
     `Configured setting: ${setting.settingKey}`
   );
 }
}

async function main() {
 console.log(
   "Seeding VidaPouch pricing configuration..."
 );

 const pricingVersion =
   await getOrCreatePricingVersion();

 console.log(
   `Using pricing version: ${pricingVersion.versionName}`
 );

 await seedPlans(
   pricingVersion.id
 );

 await seedSettings(
   pricingVersion.id
 );

 console.log(
   "VidaPouch pricing configuration seeded successfully."
 );

 console.log(
   "Temporary pooled allowances:"
 );

 console.log(
   `Essential: $${TEST_POOLED_ALLOWANCES.essential}`
 );

 console.log(
   `Complete: $${TEST_POOLED_ALLOWANCES.complete}`
 );

 console.log(
   `Premier: $${TEST_POOLED_ALLOWANCES.premier}`
 );

 console.log(
   "Continuous Plan Overage calculations are enabled for testing."
 );

 console.log(
   "The pricing version remains in DRAFT and the test allowances must be reviewed before launch."
 );
}

main()
 .catch(
   (error) => {
     console.error(
       "VidaPouch pricing seed failed:",
       error
     );

     process.exitCode =
       1;
   }
 )
 .finally(
   async () => {
     await prisma
       .$disconnect();

     await pool
       .end();
   }
 );