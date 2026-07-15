import type {
    CheckoutPlan,
    CheckoutServiceSummary,
   } from "./checkoutTypes";
   
   export const SINGLE_POUCH_SERVICE_FEE =
    69.99;
   
   export const DUAL_POUCH_SERVICE_FEE =
    89.99;
   
   const SINGLE_POUCH_INCLUDED_SERVICES = [
    "Supplement sourcing",
    "Brand and product verification",
    "Monthly supplement portioning",
    "Daily pouch preparation",
    "Personalized pouch organization",
    "Order quality review",
   ];
   
   const DUAL_POUCH_INCLUDED_SERVICES = [
    "Supplement sourcing",
    "Brand and product verification",
    "Morning and evening routine separation",
    "Monthly supplement portioning",
    "Daily pouch preparation",
    "Personalized pouch organization",
    "Order quality review",
   ];
   
   export function calculateServiceFee(
    plan: CheckoutPlan
   ): CheckoutServiceSummary {
    const hasMorningPouch =
      plan.morning.length > 0;
   
    const hasEveningPouch =
      plan.evening.length > 0;
   
    if (
      hasMorningPouch &&
      hasEveningPouch
    ) {
      return {
        planType:
          "morning_and_evening",
   
        label:
          "Morning + Evening VitaPouch Concierge",
   
        fee:
          DUAL_POUCH_SERVICE_FEE,
   
        includedServices:
          DUAL_POUCH_INCLUDED_SERVICES,
      };
    }
   
    if (hasMorningPouch) {
      return {
        planType:
          "morning_only",
   
        label:
          "Morning VitaPouch Concierge",
   
        fee:
          SINGLE_POUCH_SERVICE_FEE,
   
        includedServices:
          SINGLE_POUCH_INCLUDED_SERVICES,
      };
    }
   
    if (hasEveningPouch) {
      return {
        planType:
          "evening_only",
   
        label:
          "Evening VitaPouch Concierge",
   
        fee:
          SINGLE_POUCH_SERVICE_FEE,
   
        includedServices:
          SINGLE_POUCH_INCLUDED_SERVICES,
      };
    }
   
    return {
      planType:
        "morning_only",
   
      label:
        "VitaPouch Concierge",
   
      fee: 0,
   
      includedServices: [],
    };
   }
   