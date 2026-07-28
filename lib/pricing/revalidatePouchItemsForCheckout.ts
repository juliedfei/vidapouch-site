import "server-only";

import type {
 SearchPouchItem,
} from "@/components/search/types/searchPouch";

import {
 resolveLiveMerchantOffer,
} from "@/lib/search/resolveLiveMerchantOffer";

type RevalidatedPouchItem = {
 item:
   SearchPouchItem;

 liveBottlePrice:
   number;

 verifiedMonthlyCost:
   number;
};

function roundCurrency(
 value:
   number
) {
 return Math.round(
   (
     value +
     Number.EPSILON
   ) *
     100
 ) / 100;
}

function isPositiveNumber(
 value:
   unknown
): value is number {
 return (
   typeof value ===
     "number" &&
   Number.isFinite(
     value
   ) &&
   value >
     0
 );
}

async function revalidateOnePouchItem(
 item:
   SearchPouchItem
): Promise<RevalidatedPouchItem> {
 if (
   !item
     .immersiveProductPageToken
 ) {
   throw new Error(
     `${item.productName} is missing the information required to verify its current price. Please remove it and add it to your pouch again.`
   );
 }









 if (
   !isPositiveNumber(
     item.monthlyUnitCount
   )
 ) {
   throw new Error(
     `${item.productName} does not have a valid monthly quantity.`
   );
 }

 const offer =
   await resolveLiveMerchantOffer({
     retailer:
       item.retailer,

     productTitle:
       item.productName,

     bottlePrice:
       isPositiveNumber(
         item.bottlePrice
       )
         ? item.bottlePrice
         : null,

     shoppingProductId:
       item.shoppingProductId,

     immersiveProductPageToken:
       item
         .immersiveProductPageToken,
   });



 const liveBottlePrice =
   offer.liveBottlePrice;


   const verifiedBottleUnitCount =
   offer.verifiedBottleUnitCount;




 if (
   !isPositiveNumber(
     liveBottlePrice
   )
 ) {
   throw new Error(
     `The current price for ${item.productName} could not be verified.`
   );
 }

 if (
    !isPositiveNumber(
      verifiedBottleUnitCount
    )
   ) {
    throw new Error(
      `The current bottle quantity for ${item.productName} could not be verified.`
    );
   }





   const verifiedCostPerUnit =
   liveBottlePrice /
   verifiedBottleUnitCount;





 const verifiedMonthlyCost =
   roundCurrency(
     verifiedCostPerUnit *
       item.monthlyUnitCount
   );

 const verifiedBaselineMonthlyCost =
   isPositiveNumber(
     item.baselineUnitsPerDay
   )
     ? roundCurrency(
         verifiedCostPerUnit *
           item.baselineUnitsPerDay *
           30
       )
     : verifiedMonthlyCost;

 const updatedPricing =
   item.pricing
     ? {
         ...item.pricing,

         monthlyProductCost:
           verifiedMonthlyCost,
       }
     : undefined;

 return {
   item: {
     ...item,

     bottlePrice:
       liveBottlePrice,

       bottleUnitCount:
       verifiedBottleUnitCount,
      



     monthlyPrice:
       verifiedMonthlyCost,

     baselineMonthlyPrice:
       verifiedBaselineMonthlyCost,

     pricing:
       updatedPricing,
   },

   liveBottlePrice,

   verifiedMonthlyCost,
 };
}

export async function
revalidatePouchItemsForCheckout(
 pouchItems:
   SearchPouchItem[]
) {
 if (
   pouchItems.length ===
   0
 ) {
   throw new Error(
     "Add at least one supplement before checkout."
   );
 }

 /*
  * Checkout verifies all selected products again.
  *
  * A failed product lookup blocks checkout rather
  * than silently charging from an unverified price.
  */
 const revalidatedItems =
   await Promise.all(
     pouchItems.map(
       revalidateOnePouchItem
     )
   );

 return {
   pouchItems:
     revalidatedItems.map(
       (result) =>
         result.item
     ),

   verification: revalidatedItems.map(
     (result) => ({
       pouchItemId:
         result.item.id,

       shoppingProductId:
         result.item
           .shoppingProductId,

       retailer:
         result.item.retailer,

       liveBottlePrice:
         result.liveBottlePrice,

       verifiedMonthlyCost:
         result
           .verifiedMonthlyCost,
     })
   ),
 };
}
