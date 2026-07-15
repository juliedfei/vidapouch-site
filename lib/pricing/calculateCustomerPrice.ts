import type { RetailProduct } from "./types";

export type CustomerPriceBreakdown = {
 bottlePrice: number;

 bottleCapsules: number;

 costPerCapsule: number;

 capsulesPerDay: number;

 monthlyCapsules: number;

 rawMonthlyCost: number;

 fulfillmentMarkup: number;

 customerMonthlyPrice: number;
};

const DAYS_PER_MONTH = 30.4;

const DEFAULT_FULFILLMENT_MARKUP = 0.08;

export function calculateCustomerPrice(
 product: RetailProduct,
 capsulesPerDay: number,
 fulfillmentMarkup = DEFAULT_FULFILLMENT_MARKUP
): CustomerPriceBreakdown {

 const bottleCapsules =
   product.capsulesPerBottle;

 const costPerCapsule =
   product.bottlePrice /
   bottleCapsules;

 const monthlyCapsules =
   capsulesPerDay * DAYS_PER_MONTH;

 const rawMonthlyCost =
   monthlyCapsules *
   costPerCapsule;

 const customerMonthlyPrice =
   rawMonthlyCost *
   (1 + fulfillmentMarkup);

 return {

   bottlePrice:
     product.bottlePrice,

   bottleCapsules,

   costPerCapsule:
     Math.round(
       costPerCapsule * 10000
     ) / 10000,

   capsulesPerDay,

   monthlyCapsules:
     Math.round(
       monthlyCapsules
     ),

   rawMonthlyCost:
     Math.round(
       rawMonthlyCost * 100
     ) / 100,

   fulfillmentMarkup,

   customerMonthlyPrice:
     Math.round(
       customerMonthlyPrice * 100
     ) / 100,

 };

}