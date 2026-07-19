"use client";

import {
 useEffect,
 useState,
} from "react";

import { useRouter } from "next/navigation";

import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import OrderSummary from "@/components/checkout/OrderSummary";
import PouchSummary from "@/components/checkout/PouchSummary";
import RemovedSupplements from "@/components/checkout/RemovedSupplements";



import type {
 CheckoutPlan,
 CheckoutPricingSource,
 CheckoutPouch,
 CheckoutSummary,
 CheckoutSupplement,
 InternalSourceOption,
 RemovedCheckoutSupplement,
} from "@/lib/checkout/checkoutTypes";

import type {
 PouchTiming,
} from "@/components/routine-builder/types";

const EMPTY_PLAN: CheckoutPlan = {
 morning: [],
 evening: [],
};

function roundCurrency(
 value: number
) {
 return Math.round(value * 100) / 100;
}

function getPricingSource(
 retailer: string
): CheckoutPricingSource {
 const normalizedRetailer =
   retailer.trim().toLowerCase();

 if (
   normalizedRetailer === "estimated" ||
   normalizedRetailer === "catalog"
 ) {
   return "catalog";
 }

 if (
   normalizedRetailer === "inventory" ||
   normalizedRetailer ===
     "vidapouch inventory"
 ) {
   return "inventory";
 }

 if (
   normalizedRetailer === "wholesale" ||
   normalizedRetailer ===
     "distributor"
 ) {
   return "wholesale";
 }

 return "retailer";
}

function isSameSourceOption(
 left: InternalSourceOption,
 right: InternalSourceOption
) {
 return (
   left.product.brand ===
     right.product.brand &&
   left.product.retailer ===
     right.product.retailer &&
   left.product.dosage ===
     right.product.dosage &&
   left.product.bottlePrice ===
     right.product.bottlePrice &&
   left.product.capsulesPerBottle ===
     right.product.capsulesPerBottle
 );
}

function updateCheckoutSupplement(
 supplement: CheckoutSupplement,
 option: InternalSourceOption
): CheckoutSupplement {
 const selectedProduct =
   option.product;

 const selectedBrand =
   selectedProduct.brand.trim();

 const internalAudit =
   supplement.recommendation
     .internalAudit;

 const updatedInternalAudit =
   internalAudit
     ? {
         ...internalAudit,

         pricingSource:
           getPricingSource(
             selectedProduct.retailer
           ),

         calculatedAt:
           new Date().toISOString(),

         selectedBottlePrice:
           roundCurrency(
             selectedProduct.bottlePrice
           ),

         selectedBottleSize:
           selectedProduct
             .capsulesPerBottle,

         selectedShippingCost:
           roundCurrency(
             selectedProduct
               .estimatedShipping || 0
           ),

         selectedLandedBottleCost:
           roundCurrency(
             option
               .estimatedLandedBottleCost
           ),

         internalCostPerCapsule:
           option.costPerCapsule,

         internalMonthlyCost:
           roundCurrency(
             option
               .estimatedMonthlyCost
           ),

         customerMonthlyPrice:
           roundCurrency(
             option
               .estimatedMonthlyCost
           ),

         grossMarginAmount: 0,

         grossMarginPercent: 0,

         selectedRetailer:
           selectedProduct.retailer,

         selectedProductUrl:
           selectedProduct.url,

         sourceOptions:
           internalAudit.sourceOptions.map(
             (sourceOption) => ({
               ...sourceOption,

               selected:
                 isSameSourceOption(
                   sourceOption,
                   option
                 ),
             })
           ),

         notes: [
           ...(internalAudit.notes || []),

           `The customer selected ${selectedBrand} during checkout.`,
         ],
       }
     : undefined;

 return {
   ...supplement,

   selectedBrand,

   selectedProduct,

   selectionSource:
     "customer",

   customerMonthlyPrice:
     roundCurrency(
       option.estimatedMonthlyCost
     ),

   pricingStatus:
     "ready",

   pricingSource:
     getPricingSource(
       selectedProduct.retailer
     ),

   recommendation: {
     ...supplement.recommendation,

     selectedBy:
       "customer",

     selectedBrand,

     explanation:
       "customer_selected_brand",

     internalAudit:
       updatedInternalAudit,
   },
 };
}

function rebuildPouch(
 pouch: CheckoutPouch,
 supplementId: string,
 option: InternalSourceOption
): CheckoutPouch {
 const supplements =
   pouch.supplements.map(
     (supplement) =>
       supplement.id === supplementId
         ? updateCheckoutSupplement(
             supplement,
             option
           )
         : supplement
   );

 const supplementSubtotal =
   roundCurrency(
     supplements.reduce(
       (total, supplement) =>
         total +
         supplement
           .customerMonthlyPrice,
       0
     )
   );

 return {
   ...pouch,

   supplements,

   supplementSubtotal,
 };
}

function applyBrandSelection(
 summary: CheckoutSummary,
 supplementId: string,
 option: InternalSourceOption
): CheckoutSummary {
 const morning =
   rebuildPouch(
     summary.morning,
     supplementId,
     option
   );

 const evening =
   rebuildPouch(
     summary.evening,
     supplementId,
     option
   );

 const activeSupplements = [
   ...morning.supplements,
   ...evening.supplements,
 ];

 const supplementSubtotal =
   roundCurrency(
     morning.supplementSubtotal +
       evening.supplementSubtotal
   );

 const totalDue =
   roundCurrency(
     supplementSubtotal +
       summary.service.fee
   );

 const issues =
   summary.issues.filter(
     (issue) =>
       !(
         issue.supplementId ===
           supplementId &&
         (
           issue.code ===
             "price_unavailable" ||
           issue.code ===
             "recommendation_unavailable"
         )
       )
   );

 const canCheckout =
   activeSupplements.length > 0 &&
   !issues.some(
     (issue) => issue.blocking
   );

 return {
   ...summary,

   morning,

   evening,

   activeSupplements,

   costs: {
     ...summary.costs,

     supplementSubtotal,

     serviceFee:
       summary.service.fee,

     totalDue,
   },

   issues,

   canCheckout,

   calculatedAt:
     new Date().toISOString(),
 };
}

export default function CheckoutPage() {
 const router = useRouter();

 const [plan, setPlan] =
   useState<CheckoutPlan>(
     EMPTY_PLAN
   );

 const [
   checkoutSummary,
   setCheckoutSummary,
 ] = useState<
   CheckoutSummary | null
>(null);

 const [
   removedSupplements,
   setRemovedSupplements,
 ] = useState<
   RemovedCheckoutSupplement[]
>([]);

 const [
   hasLoadedPlan,
   setHasLoadedPlan,
 ] = useState(false);

 const [
   isBuildingCheckout,
   setIsBuildingCheckout,
 ] = useState(false);

 const [
   checkoutError,
   setCheckoutError,
 ] = useState<string | null>(
   null
 );

 const [
   isContinuing,
   setIsContinuing,
 ] = useState(false);

 useEffect(() => {
   const savedPlan =
     window.localStorage.getItem(
       "vidapouch_checkout_plan"
     );

   if (!savedPlan) {
     setHasLoadedPlan(true);
     return;
   }

   try {
     const parsedPlan =
       JSON.parse(
         savedPlan
       ) as Partial<CheckoutPlan>;

     setPlan({
       morning: Array.isArray(
         parsedPlan.morning
       )
         ? parsedPlan.morning
         : [],

       evening: Array.isArray(
         parsedPlan.evening
       )
         ? parsedPlan.evening
         : [],
     });
   } catch {
     setPlan(EMPTY_PLAN);
   } finally {
     setHasLoadedPlan(true);
   }
 }, []);

 useEffect(() => {
   if (!hasLoadedPlan) return;

   window.localStorage.setItem(
     "vidapouch_checkout_plan",
     JSON.stringify(plan)
   );
 }, [
   hasLoadedPlan,
   plan,
 ]);

 useEffect(() => {
   if (!hasLoadedPlan) return;

   let wasCancelled = false;

   async function loadCheckoutSummary() {
    setIsBuildingCheckout(true);
    setCheckoutError(null);
   
    try {
      const response = await fetch(
        "/api/checkout/summary",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            plan,
          }),
        }
      );
   
      const data =
        await response.json();
   
      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to prepare checkout."
        );
      }
   
      if (!wasCancelled) {
        setCheckoutSummary(
          data.summary
        );
      }
    } catch (error) {
      console.error(error);
   
      if (!wasCancelled) {
        setCheckoutSummary(null);
   
        setCheckoutError(
          error instanceof Error
            ? error.message
            : "Unable to prepare checkout."
        );
      }
    } finally {
      if (!wasCancelled) {
        setIsBuildingCheckout(false);
      }
    }
   }
   






   void loadCheckoutSummary();

   return () => {
     wasCancelled = true;
   };
 }, [
   hasLoadedPlan,
   plan,
 ]);

 useEffect(() => {
   if (!checkoutSummary) {
     return;
   }

   window.localStorage.setItem(
     "vidapouch_checkout_summary",
     JSON.stringify(
       checkoutSummary
     )
   );
 }, [checkoutSummary]);



 function handleBack() {
  router.push(
    "/routine-builder?step=plan"
  );
 }






 function handleChooseBrand(
   supplementId: string,
   option: InternalSourceOption
 ) {
   setCheckoutSummary(
     (current) => {
       if (!current) {
         return current;
       }

       return applyBrandSelection(
         current,
         supplementId,
         option
       );
     }
   );
 }

 function handleRemove(
   timing: PouchTiming,
   index: number
 ) {
   if (!checkoutSummary) {
     return;
   }

   const pouch =
     timing === "morning"
       ? checkoutSummary.morning
       : checkoutSummary.evening;

   const checkoutSupplement =
     pouch.supplements[index];

   if (!checkoutSupplement) {
     return;
   }

   setRemovedSupplements(
     (current) => [
       ...current,
       {
         supplement:
           checkoutSupplement,

         removedAt:
           new Date().toISOString(),
       },
     ]
   );

   setPlan((current) => ({
     ...current,

     [timing]:
       current[timing].filter(
         (_, itemIndex) =>
           itemIndex !== index
       ),
   }));
 }

 function handleRestore(
   removedIndex: number
 ) {
   const removedItem =
     removedSupplements[
       removedIndex
     ];

   if (!removedItem) {
     return;
   }

   const timing =
     removedItem.supplement
       .timing;

   setPlan((current) => ({
     ...current,

     [timing]: [
       ...current[timing],

       removedItem.supplement
         .originalSupplement,
     ],
   }));

   setRemovedSupplements(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !==
           removedIndex
       )
   );
 }

 function handleContinue() {
   if (
     !checkoutSummary
       ?.canCheckout
   ) {
     return;
   }

   setIsContinuing(true);

   window.localStorage.setItem(
     "vidapouch_checkout_summary",
     JSON.stringify(
       checkoutSummary
     )
   );

   router.push(
     "/checkout/payment"
   );
 }

 const hasAnySupplements =
   plan.morning.length > 0 ||
   plan.evening.length > 0;

 if (
   !hasLoadedPlan ||
   isBuildingCheckout
 ) {
   return (
     <main className="min-h-screen bg-[#F3E9DD] px-4 py-6 text-[#0E171B] sm:px-8">
       <div className="mx-auto max-w-[1200px]">
         <CheckoutHeader
           onBack={handleBack}
         />

         <div className="rounded-[24px] border border-[#DDD7CF] bg-white p-7">
           <p className="font-medium text-[#081620]">
             Preparing your VidaPouch
             order...
           </p>

           <p className="mt-2 text-sm leading-6 text-[#5D686C]">
             We are reviewing brands,
             monthly quantities, and
             supplement pricing.
           </p>
         </div>
       </div>
     </main>
   );
 }

 return (
   <main className="min-h-screen bg-[#F3E9DD] px-4 py-6 text-[#0E171B] sm:px-8">
     <div className="mx-auto max-w-[1200px]">
       <CheckoutHeader
         onBack={handleBack}
       />

       <div className="mb-7 rounded-[24px] border border-[#DDD7CF] bg-white px-6 py-5">
         <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C1D40]">
           Your personalized order
         </p>

         <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
           <div>
             <h1
               className="text-[32px] tracking-[-0.035em] text-[#081620] sm:text-[38px]"
               style={{
                 fontFamily:
                   'Georgia, "Times New Roman", serif',
               }}>

               Review Your Monthly
               VidaPouch
             </h1>

             <p className="mt-2 max-w-[750px] text-sm leading-6 text-[#5D686C]">
               Review your personalized VidaPouch,
               monthly supplement
               pricing, and concierge
               service before completing
               your order.
             </p>
           </div>

           <div className="grid gap-2 text-sm text-[#475357] sm:grid-cols-2 md:block md:text-right">
             <p>
               ✓ Transparent supplement
               pricing
             </p>

             <p>
               ✓ No additional charge
               without approval
             </p>
           </div>
         </div>
       </div>

       {!hasAnySupplements && (
         <div className="mb-6 rounded-[20px] border border-[#DDD7CF] bg-white px-5 py-4">
           <p className="font-medium text-[#081620]">
             Your pouch plan is empty.
           </p>

           <p className="mt-1 text-sm leading-6 text-[#5D686C]">
             Restore a removed
             supplement or return to your
             routine to add an item.
           </p>
         </div>
       )}

       {checkoutError && (
         <div className="mb-6 rounded-[20px] border border-[#C98D7B] bg-[#FFF8F4] px-5 py-4">
           <p className="font-medium text-[#8C1D40]">
             Checkout could not be
             prepared.
           </p>

           <p className="mt-1 text-sm leading-6 text-[#5D686C]">
             {checkoutError}
           </p>
         </div>
       )}

       {checkoutSummary &&
         checkoutSummary.issues
           .length > 0 && (
           <div className="mb-6 rounded-[20px] border border-[#C98D7B] bg-[#FFF8F4] px-5 py-4">
             <p className="font-medium text-[#8C1D40]">
               Some pricing details
               require attention.
             </p>

             <div className="mt-3 space-y-2">
               {checkoutSummary.issues.map(
                 (issue, index) => (
                   <p
                     key={`${issue.code}-${issue.supplementId || index}`}
                     className="text-sm leading-6 text-[#5D686C]">

                     • {issue.message}
                   </p>
                 )
               )}
             </div>
           </div>
         )}

       {checkoutSummary && (
         <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.85fr)]">
           <div className="space-y-6">
             <PouchSummary
               morning={
                 checkoutSummary.morning
               }
               evening={
                 checkoutSummary.evening
               }
               onRemove={
                 handleRemove
               }
               onChooseBrand={
                 handleChooseBrand
               }
             />

             <RemovedSupplements
               removedSupplements={
                 removedSupplements
               }
               onRestore={
                 handleRestore
               }
             />
           </div>

           <div className="xl:sticky xl:top-6">
             <OrderSummary
               summary={
                 checkoutSummary
               }
               onContinue={
                 handleContinue
               }
               isContinuing={
                 isContinuing
               }
             />
           </div>
         </div>
       )}
     </div>
   </main>
 );
}