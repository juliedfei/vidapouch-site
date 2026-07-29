import {
    SearchIntentType,
   } from "@/lib/generated/prisma/client";
   
   export type SearchIntentMarketplacePolicy = {
    allowOriginalMarketplaceQuery:
      boolean;
   
    requireSupplementExpansions:
      boolean;
   
    requiresMedicalNotice:
      boolean;
   };
   
   /**
   * Centralizes marketplace-search rules for every
   * supported search-intent type.
   *
   * Health conditions and sensitive life stages must
   * be translated into relevant supplement ingredient
   * searches. Their original phrases must never be
   * sent directly to a marketplace.
   */
   export function getSearchIntentMarketplacePolicy(
    intentType:
      SearchIntentType
   ): SearchIntentMarketplacePolicy {
    switch (
      intentType
    ) {
      case SearchIntentType
        .HEALTH_CONDITION:
      case SearchIntentType
        .LIFE_STAGE:
        return {
          allowOriginalMarketplaceQuery:
            false,
   
          requireSupplementExpansions:
            true,
   
          requiresMedicalNotice:
            true,
        };
   
      case SearchIntentType
        .HEALTH_GOAL:
        return {
          allowOriginalMarketplaceQuery:
            true,
   
          requireSupplementExpansions:
            false,
   
          requiresMedicalNotice:
            false,
        };
   
      case SearchIntentType
        .DOCTOR_TYPE:
      case SearchIntentType
        .INVALID:
        return {
          allowOriginalMarketplaceQuery:
            false,
   
          requireSupplementExpansions:
            false,
   
          requiresMedicalNotice:
            false,
        };
   
      case SearchIntentType
        .SUPPLEMENT:
      case SearchIntentType
        .BRAND:
      default:
        return {
          allowOriginalMarketplaceQuery:
            true,
   
          requireSupplementExpansions:
            false,
   
          requiresMedicalNotice:
            false,
        };
    }
   }