import "server-only";

import {
 prisma,
} from "@/lib/db";

export type VidaPouchPricingPlanKey =
 | "essential"
 | "complete"
 | "premier";

export type VidaPouchFulfillmentScenario =
 | "single-box"
 | "dual-box"
 | "custom";

export type VidaPouchCostBasisMethod =
 | "median-exact-listings"
 | "trimmed-average-exact-listings"
 | "average-exact-listings"
 | "lowest-qualified-listing"
 | "wholesale-cost"
 | "catalog-cost"
 | "manual"
 | "undetermined";

export type VidaPouchUncertainPricingBehavior =
 | "confirm-before-checkout"
 | "block-selection"
 | "use-safe-fallback";

export type VidaPouchPricingPlanConfig = {
 id:
   string;

 planKey:
   VidaPouchPricingPlanKey;

 name:
   string;

 monthlyPrice:
   number;

 supplementLimit:
   number;

 /*
  * Confidential pooled monthly supplement
  * cost allowance for the complete plan.
  *
  * This must never be rendered directly in
  * customer-facing UI.
  */
 pooledCostAllowance:
   number | null;

 fulfillmentScenario:
   VidaPouchFulfillmentScenario;

 displayOrder:
   number;

 active:
   boolean;

 customerDescription:
   string | null;

 customerSelectionDescription:
   string | null;
};

export type VidaPouchPricingSettingsConfig = {
 sourcingBufferRate:
   number;

 minimumQualifiedListingCount:
   number;

 overageMarginRate:
   number;

 overageRoundingIncrement:
   number;

 pricingConfigurationCacheSeconds:
   number;

 retailCostBasisMethod:
   VidaPouchCostBasisMethod;

 uncertainPricingBehavior:
   VidaPouchUncertainPricingBehavior;

 pooledPlanOveragesEnabled:
   boolean;

 showInternalAllowanceToCustomer:
   boolean;
};

export type VidaPouchPricingConfig = {
 pricingVersionId:
   string | null;

 versionName:
   string;

 versionStatus:
   "draft" | "active" | "retired" | "fallback";

 effectiveFrom:
   Date | null;

 effectiveUntil:
   Date | null;

 plans:
   VidaPouchPricingPlanConfig[];

 settings:
   VidaPouchPricingSettingsConfig;

 /*
  * True means the application could not load
  * the configuration from Neon and is using
  * conservative server-side defaults.
  */
 usingFallback:
   boolean;

 loadedAt:
   Date;
};

type PricingSettingRecord = {
 settingKey:
   string;

 numericValue:
   unknown;

 textValue:
   string | null;

 booleanValue:
   boolean | null;
};

type PricingConfigCache = {
 value:
   VidaPouchPricingConfig | null;

 expiresAt:
   number;
};

const DEFAULT_CACHE_SECONDS =
 300;

const DEFAULT_SETTINGS:
 VidaPouchPricingSettingsConfig =
 {
   sourcingBufferRate:
     0.1,

   minimumQualifiedListingCount:
     2,

   overageMarginRate:
     0.25,

   overageRoundingIncrement:
     0.01,

   pricingConfigurationCacheSeconds:
     DEFAULT_CACHE_SECONDS,

   retailCostBasisMethod:
     "median-exact-listings",

   uncertainPricingBehavior:
     "confirm-before-checkout",

   /*
    * The safe fallback keeps pooled charges
    * disabled until validated allowances have
    * been added to the database.
    */
   pooledPlanOveragesEnabled:
     false,

   /*
    * This must always remain false in normal
    * operation because plan allowances are
    * confidential internal pricing data.
    */
   showInternalAllowanceToCustomer:
     false,
 };

const FALLBACK_PLANS:
 VidaPouchPricingPlanConfig[] =
 [
   {
     id:
       "fallback-essential",

     planKey:
       "essential",

     name:
       "Essential",

     monthlyPrice:
       59.99,

     supplementLimit:
       3,

     pooledCostAllowance:
       null,

     fulfillmentScenario:
       "single-box",

     displayOrder:
       1,

     active:
       true,

     customerDescription:
       "Up to 3 supplements",

     customerSelectionDescription:
       "A simple personalized daily supplement routine.",
   },

   {
     id:
       "fallback-complete",

     planKey:
       "complete",

     name:
       "Complete",

     monthlyPrice:
       79.99,

     supplementLimit:
       5,

     pooledCostAllowance:
       null,

     fulfillmentScenario:
       "dual-box",

     displayOrder:
       2,

     active:
       true,

     customerDescription:
       "Up to 5 supplements",

     customerSelectionDescription:
       "More room for a complete morning and evening routine.",
   },

   {
     id:
       "fallback-premier",

     planKey:
       "premier",

     name:
       "Premier",

     monthlyPrice:
       99.99,

     supplementLimit:
       8,

     pooledCostAllowance:
       null,

     fulfillmentScenario:
       "dual-box",

     displayOrder:
       3,

     active:
       true,

     customerDescription:
       "Up to 8 supplements",

     customerSelectionDescription:
       "Our most flexible personalized supplement routine.",
   },
 ];

const pricingConfigCache:
 PricingConfigCache =
 {
   value:
     null,

   expiresAt:
     0,
 };

function toNumber(
 value:
   unknown,

 fallback:
   number
) {
 if (
   typeof value ===
   "number"
 ) {
   return Number.isFinite(
     value
   )
     ? value
     : fallback;
 }

 if (
   typeof value ===
   "string"
 ) {
   const parsed =
     Number(
       value
     );

   return Number.isFinite(
     parsed
   )
     ? parsed
     : fallback;
 }

 if (
   value &&
   typeof value ===
     "object" &&
   "toString" in
     value &&
   typeof value.toString ===
     "function"
 ) {
   const parsed =
     Number(
       value.toString()
     );

   return Number.isFinite(
     parsed
   )
     ? parsed
     : fallback;
 }

 return fallback;
}

function toNullableNumber(
 value:
   unknown
) {
 if (
   value ===
   null ||
   value ===
   undefined
 ) {
   return null;
 }

 const converted =
   toNumber(
     value,
     Number.NaN
   );

 return Number.isFinite(
   converted
 )
   ? converted
   : null;
}

function normalizePlanKey(
 value:
   string
): VidaPouchPricingPlanKey | null {
 switch (
   value
     .trim()
     .toLowerCase()
 ) {
   case "essential":
     return "essential";

   case "complete":
     return "complete";

   case "premier":
     return "premier";

   default:
     return null;
 }
}

function normalizeFulfillmentScenario(
 value:
   string
): VidaPouchFulfillmentScenario {
 switch (
   value
     .trim()
     .toUpperCase()
 ) {
   case "SINGLE_BOX":
     return "single-box";

   case "DUAL_BOX":
     return "dual-box";

   case "CUSTOM":
   default:
     return "custom";
 }
}

function normalizeVersionStatus(
 value:
   string
): VidaPouchPricingConfig["versionStatus"] {
 switch (
   value
     .trim()
     .toUpperCase()
 ) {
   case "ACTIVE":
     return "active";

   case "RETIRED":
     return "retired";

   case "DRAFT":
   default:
     return "draft";
 }
}

function getNumericSetting(
 settings:
   Map<
     string,
     PricingSettingRecord>
,

 settingKey:
   string,

 fallback:
   number
) {
 const setting =
   settings.get(
     settingKey
   );

 if (
   !setting
 ) {
   return fallback;
 }

 return toNumber(
   setting.numericValue,
   fallback
 );
}

function getTextSetting(
 settings:
   Map<
     string,
     PricingSettingRecord>
,

 settingKey:
   string,

 fallback:
   string
) {
 const setting =
   settings.get(
     settingKey
   );

 const value =
   setting
     ?.textValue
     ?.trim();

 return value
   ? value
   : fallback;
}

function getBooleanSetting(
 settings:
   Map<
     string,
     PricingSettingRecord>
,

 settingKey:
   string,

 fallback:
   boolean
) {
 const setting =
   settings.get(
     settingKey
   );

 return typeof setting
   ?.booleanValue ===
   "boolean"
   ? setting.booleanValue
   : fallback;
}

function normalizeCostBasisMethod(
 value:
   string
): VidaPouchCostBasisMethod {
 switch (
   value
 ) {
   case "median-exact-listings":
   case "trimmed-average-exact-listings":
   case "average-exact-listings":
   case "lowest-qualified-listing":
   case "wholesale-cost":
   case "catalog-cost":
   case "manual":
   case "undetermined":
     return value;

   default:
     return DEFAULT_SETTINGS
       .retailCostBasisMethod;
 }
}

function normalizeUncertainPricingBehavior(
 value:
   string
): VidaPouchUncertainPricingBehavior {
 switch (
   value
 ) {
   case "confirm-before-checkout":
   case "block-selection":
   case "use-safe-fallback":
     return value;

   default:
     return DEFAULT_SETTINGS
       .uncertainPricingBehavior;
 }
}

function buildSettings(
 records:
   PricingSettingRecord[]
): VidaPouchPricingSettingsConfig {
 const settings =
   new Map(
     records.map(
       (record) => [
         record.settingKey,
         record,
       ]
     )
   );

 const sourcingBufferRate =
   Math.max(
     0,
     getNumericSetting(
       settings,
       "sourcing_buffer_rate",
       DEFAULT_SETTINGS
         .sourcingBufferRate
     )
   );

 const minimumQualifiedListingCount =
   Math.max(
     1,
     Math.round(
       getNumericSetting(
         settings,
         "minimum_qualified_listing_count",
         DEFAULT_SETTINGS
           .minimumQualifiedListingCount
       )
     )
   );

 const overageMarginRate =
   Math.min(
     0.95,
     Math.max(
       0,
       getNumericSetting(
         settings,
         "overage_margin_rate",
         DEFAULT_SETTINGS
           .overageMarginRate
       )
     )
   );

 const overageRoundingIncrement =
   Math.max(
     0.01,
     getNumericSetting(
       settings,
       "overage_rounding_increment",
       DEFAULT_SETTINGS
         .overageRoundingIncrement
     )
   );

 const pricingConfigurationCacheSeconds =
   Math.max(
     0,
     Math.round(
       getNumericSetting(
         settings,
         "pricing_configuration_cache_seconds",
         DEFAULT_SETTINGS
           .pricingConfigurationCacheSeconds
       )
     )
   );

 const retailCostBasisMethod =
   normalizeCostBasisMethod(
     getTextSetting(
       settings,
       "retail_cost_basis_method",
       DEFAULT_SETTINGS
         .retailCostBasisMethod
     )
   );

 const uncertainPricingBehavior =
   normalizeUncertainPricingBehavior(
     getTextSetting(
       settings,
       "uncertain_pricing_behavior",
       DEFAULT_SETTINGS
         .uncertainPricingBehavior
     )
   );

 const pooledPlanOveragesEnabled =
   getBooleanSetting(
     settings,
     "pooled_plan_overages_enabled",
     DEFAULT_SETTINGS
       .pooledPlanOveragesEnabled
   );

 /*
  * Even if the database value were changed
  * accidentally, this reader prevents the
  * confidential allowance from being approved
  * for customer-facing display.
  */
 const showInternalAllowanceToCustomer =
   false;

 return {
   sourcingBufferRate,

   minimumQualifiedListingCount,

   overageMarginRate,

   overageRoundingIncrement,

   pricingConfigurationCacheSeconds,

   retailCostBasisMethod,

   uncertainPricingBehavior,

   pooledPlanOveragesEnabled,

   showInternalAllowanceToCustomer,
 };
}

function buildFallbackConfig():
 VidaPouchPricingConfig {
 return {
   pricingVersionId:
     null,

   versionName:
     "safe-fallback",

   versionStatus:
     "fallback",

   effectiveFrom:
     null,

   effectiveUntil:
     null,

   plans:
     FALLBACK_PLANS.map(
       (plan) => ({
         ...plan,
       })
     ),

   settings: {
     ...DEFAULT_SETTINGS,
   },

   usingFallback:
     true,

   loadedAt:
     new Date(),
 };
}

async function findPricingVersion() {
 const now =
   new Date();

 /*
  * Prefer an active pricing configuration
  * whose effective dates include the current
  * date.
  */
 const activeVersion =
   await prisma
     .vidaPouchPricingVersion
     .findFirst({
       where: {
         status:
           "ACTIVE",

         AND: [
           {
             OR: [
               {
                 effectiveFrom:
                   null,
               },

               {
                 effectiveFrom: {
                   lte:
                     now,
                 },
               },
             ],
           },

           {
             OR: [
               {
                 effectiveUntil:
                   null,
               },

               {
                 effectiveUntil: {
                   gt:
                     now,
                 },
               },
             ],
           },
         ],
       },

       include: {
         plans: {
           where: {
             active:
               true,
           },

           orderBy: {
             displayOrder:
               "asc",
           },
         },

         settings: {
           where: {
             active:
               true,
           },
         },
       },

       orderBy: {
         effectiveFrom:
           "desc",
       },
     });

 if (
   activeVersion
 ) {
   return activeVersion;
 }

 /*
  * During development, use the newest draft
  * configuration when no active version exists.
  *
  * Pooled overages remain disabled in the seeded
  * draft, so this is safe while the break-even
  * analysis is incomplete.
  */
 return prisma
   .vidaPouchPricingVersion
   .findFirst({
     where: {
       status:
         "DRAFT",
     },

     include: {
       plans: {
         where: {
           active:
             true,
         },

         orderBy: {
           displayOrder:
             "asc",
         },
       },

       settings: {
         where: {
           active:
             true,
         },
       },
     },

     orderBy: {
       createdAt:
         "desc",
     },
   });
}

async function loadPricingConfigFromDatabase():
 Promise<VidaPouchPricingConfig> {
 const pricingVersion =
   await findPricingVersion();

 if (
   !pricingVersion
 ) {
   console.warn(
     "VidaPouch pricing configuration was not found. Using safe fallbacks."
   );

   return buildFallbackConfig();
 }

 const plans:
   VidaPouchPricingPlanConfig[] =
   pricingVersion
     .plans
     .flatMap(
       (plan) => {
         const planKey =
           normalizePlanKey(
             plan.planKey
           );

         if (
           !planKey
         ) {
           console.warn(
             "Ignoring unsupported VidaPouch plan key:",
             plan.planKey
           );

           return [];
         }

         return [
           {
             id:
               plan.id,

             planKey,

             name:
               plan.name,

             monthlyPrice:
               toNumber(
                 plan.monthlyPrice,
                 0
               ),

             supplementLimit:
               Math.max(
                 1,
                 plan.supplementLimit
               ),

             pooledCostAllowance:
               toNullableNumber(
                 plan
                   .pooledCostAllowance
               ),

             fulfillmentScenario:
               normalizeFulfillmentScenario(
                 plan
                   .fulfillmentScenario
               ),

             displayOrder:
               plan.displayOrder,

             active:
               plan.active,

             customerDescription:
               plan
                 .customerDescription,

             customerSelectionDescription:
               plan
                 .customerSelectionDescription,
           },
         ];
       }
     );

 /*
  * Do not activate pooled overages unless every
  * active plan has a validated allowance.
  */
 const everyPlanHasAllowance =
   plans.length >
     0 &&
   plans.every(
     (plan) =>
       plan
         .pooledCostAllowance !==
       null
   );

 const databaseSettings =
   buildSettings(
     pricingVersion
       .settings
   );

 const settings:
   VidaPouchPricingSettingsConfig =
   {
     ...databaseSettings,

     pooledPlanOveragesEnabled:
       databaseSettings
         .pooledPlanOveragesEnabled &&
       everyPlanHasAllowance,

     /*
      * This remains forcibly false regardless
      * of the stored database value.
      */
     showInternalAllowanceToCustomer:
       false,
   };

 return {
   pricingVersionId:
     pricingVersion.id,

   versionName:
     pricingVersion
       .versionName,

   versionStatus:
     normalizeVersionStatus(
       pricingVersion.status
     ),

   effectiveFrom:
     pricingVersion
       .effectiveFrom,

   effectiveUntil:
     pricingVersion
       .effectiveUntil,

   plans,

   settings,

   usingFallback:
     false,

   loadedAt:
     new Date(),
 };
}

/*
* Loads the current pricing configuration.
*
* Configuration is cached in the server process
* to avoid querying Neon separately for every
* product card or search result.
*/
export async function getVidaPouchPricingConfig({
 forceRefresh = false,
}: {
 forceRefresh?:
   boolean;
} = {}):
 Promise<VidaPouchPricingConfig> {
 const now =
   Date.now();

 if (
   !forceRefresh &&
   pricingConfigCache
     .value &&
   pricingConfigCache
     .expiresAt >
     now
 ) {
   return pricingConfigCache
     .value;
 }

 let config:
   VidaPouchPricingConfig;

 try {
   config =
     await loadPricingConfigFromDatabase();
 } catch (
   error
 ) {
   console.error(
     "Unable to load VidaPouch pricing configuration from Neon:",
     error
   );

   config =
     buildFallbackConfig();
 }

 const cacheSeconds =
   Math.max(
     0,
     config
       .settings
       .pricingConfigurationCacheSeconds
   );

 pricingConfigCache.value =
   config;

 pricingConfigCache.expiresAt =
   now +
   cacheSeconds *
     1000;

 return config;
}

/*
* Clears the local server-process cache.
*
* A future manager dashboard can call this after
* changing pricing configuration.
*/
export function clearVidaPouchPricingConfigCache() {
 pricingConfigCache.value =
   null;

 pricingConfigCache.expiresAt =
   0;
}
