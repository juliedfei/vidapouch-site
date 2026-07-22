"use client";

import {
 useState,
} from "react";

import type {
 ReactNode,
} from "react";

import type {
 SearchProductOption,
 SearchProductUnitLabel,
} from "@/lib/search/searchProductOption";

import {
 calculateVitaPouchAddOn,
} from "@/lib/search/calculateVidaPouchAddOn";

import {
 getSearchPouchTiming,
} from "@/lib/search/getSearchPouchTiming";

import type {
 SearchPouchItem,
 SearchPouchPricing,
} from "./types/searchPouch";

import {
 getNextSearchPlan,
} from "./types/searchPlan";

import type {
 SearchPlan,
} from "./types/searchPlan";

type ProductCardProps = {
 product:
   SearchProductOption;

 isInPouch:
   boolean;

 selectedPlan:
   SearchPlan | null;

 selectedSupplementCount:
   number;

 onAddToPouch: (
   item:
     SearchPouchItem
 ) => void;
};

type VendorLinkResponse = {
 url?:
   string;

 error?:
   string;

 matchType?:
   string;

 retailer?:
   string;

 productTitle?:
   string;

 merchantProductTitle?:
   string;

 originalBottlePrice?:
   number | null;

 liveBottlePrice?:
   number | null;

 priceChanged?:
   boolean;

 priceDifferenceAmount?:
   number | null;

 priceDifferencePercentage?:
   number | null;
};

function formatCurrency(
 value:
   number
) {
 return `$${value.toFixed(
   2
 )}`;
}

function clampScore(
 value:
   number
) {
 return Math.max(
   0,
   Math.min(
     100,
     Math.round(
       value
     )
   )
 );
}

function formatReviewCount(
 value:
   number
) {
 return new Intl.NumberFormat(
   "en-US"
 ).format(
   value
 );
}

function getPluralUnitLabel(
 unitLabel:
   SearchProductUnitLabel,

 count:
   number
) {
 if (
   count ===
   1
 ) {
   return unitLabel;
 }

 switch (
   unitLabel
 ) {
   case "capsule":
     return "capsules";

   case "tablet":
     return "tablets";

   case "caplet":
     return "caplets";

   case "softgel":
     return "softgels";

   case "gummy":
     return "gummies";

   case "serving":
     return "servings";

   case "unit":
   default:
     return "units";
 }
}

function RatingStars({
 rating,
}: {
 rating:
   number;
}) {
 const normalizedRating =
   Math.max(
     0,
     Math.min(
       5,
       rating
     )
   );

 const filledWidth =
   `${(
     normalizedRating /
     5
   ) * 100}%`;

 return (
   <span
     className="
       relative
       inline-block
       whitespace-nowrap
       text-[13px]
       leading-none
     "
     aria-label={`${normalizedRating.toFixed(
       1
     )} out of 5 stars`}>

     <span
       className="
         tracking-[1px]
         text-[#D8D1C8]
       "
       aria-hidden="true">

       ★★★★★
     </span>

     <span
       className="
         absolute
         inset-y-0
         left-0
         overflow-hidden
         whitespace-nowrap
         tracking-[1px]
         text-[#A46E24]
       "
       style={{
         width:
           filledWidth,
       }}
       aria-hidden="true">

       ★★★★★
     </span>
   </span>
 );
}

function CalendarIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[16px] w-[16px]">

     <rect
       x="4.5"
       y="5.5"
       width="15"
       height="14"
       rx="2"
       stroke="currentColor"
       strokeWidth="1.5"
     />

     <path
       d="M8 3.5v4M16 3.5v4M4.5 9.5h15"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
     />

     <path
       d="M9 13h2v2H9z"
       fill="currentColor"
     />
   </svg>
 );
}

function ShieldIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[16px] w-[16px]">

     <path
       d="M12 3.5 19 6v5.2c0 4.4-2.8 7.4-7 9.3-4.2-1.9-7-4.9-7-9.3V6l7-2.5Z"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinejoin="round"
     />

     <path
       d="m9.2 12 1.8 1.8 3.8-4"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function PersonIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[16px] w-[16px]">

     <circle
       cx="12"
       cy="8"
       r="3"
       stroke="currentColor"
       strokeWidth="1.5"
     />

     <path
       d="M6.5 19c.4-3.4 2.3-5.2 5.5-5.2s5.1 1.8 5.5 5.2"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
     />
   </svg>
 );
}

function CheckCircleIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[16px] w-[16px]">

     <circle
       cx="12"
       cy="12"
       r="8.5"
       stroke="currentColor"
       strokeWidth="1.5"
     />

     <path
       d="m8.5 12.2 2.2 2.2 4.8-5"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function InfoIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[16px] w-[16px]">

     <circle
       cx="12"
       cy="12"
       r="8.5"
       stroke="currentColor"
       strokeWidth="1.5"
     />

     <path
       d="M12 10.5v5M12 7.5h.01"
       stroke="currentColor"
       strokeWidth="1.7"
       strokeLinecap="round"
     />
   </svg>
 );
}

function PlanIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[18px] w-[18px]">

     <rect
       x="5"
       y="4"
       width="14"
       height="16"
       rx="2"
       stroke="currentColor"
       strokeWidth="1.5"
     />

     <path
       d="M9 2.8v3M15 2.8v3M8.5 10h7M8.5 14h5"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
     />
   </svg>
 );
}

type PlanDetailRowProps = {
 icon:
   ReactNode;

 children:
   ReactNode;
};

function PlanDetailRow({
 icon,
 children,
}: PlanDetailRowProps) {
 return (
   <div
     className="
       flex
       items-start
       gap-2.5
       text-[11px]
       leading-[1.45]
       text-[#4F5A5E]
     ">

     <span
       className="
         mt-[1px]
         shrink-0
         text-[#8C6B55]
       ">

       {icon}
     </span>

     <span>
       {children}
     </span>
   </div>
 );
}

function PricingStatus({
 pricing,
 planName,
}: {
 pricing:
   SearchPouchPricing;

 planName:
   string;
}) {
 if (
   pricing.status ===
   "included"
 ) {
   return (
     <div
       className="
         mt-4
         rounded-[8px]
         border
         border-[#C8D8C3]
         bg-[#F1F7EE]
         px-3
         py-3
       ">

       <div
         className="
           flex
           items-center
           gap-2
           text-[#35613D]
         ">

         <CheckCircleIcon />

         <p
           className="
             text-[11px]
             font-semibold
           ">

           Included in your {planName} Plan
         </p>
       </div>

       <p
         className="
           mt-1.5
           text-[10px]
           leading-[1.5]
           text-[#58705C]
         ">

         No additional monthly product charge
         applies at this quantity.
       </p>
     </div>
   );
 }

 if (
   pricing.status ===
   "add-on"
 ) {
   return (
     <div
       className="
         mt-4
         rounded-[8px]
         border
         border-[#DFC9A8]
         bg-[#FCF5E9]
         px-3
         py-3
       ">

       <div
         className="
           flex
           flex-wrap
           items-center
           justify-between
           gap-2
         ">

         <p
           className="
             text-[11px]
             font-semibold
             text-[#725126]
           ">

           Monthly product add-on
         </p>

         <p
           className="
             text-[14px]
             font-bold
             text-[#6B451C]
           ">

           +
           {formatCurrency(
             pricing
               .totalMonthlyAddOn
           )}
           /mo
         </p>
       </div>

       {pricing.addOnLines.length >
         0 && (
         <div
           className="
             mt-2.5
             space-y-2
             border-t
             border-[#EADAC1]
             pt-2.5
           ">

           {pricing.addOnLines.map(
             (
               line,
               index
             ) => (
               <div
                 key={`${line.reason}-${index}`}
                 className="
                   flex
                   items-start
                   justify-between
                   gap-3
                   text-[10px]
                   leading-[1.45]
                   text-[#705A3C]
                 ">

                 <span>
                   {line.label}
                 </span>

                 <span
                   className="
                     shrink-0
                     font-semibold
                   ">

                   +
                   {formatCurrency(
                     line.monthlyAmount
                   )}
                 </span>
               </div>
             )
           )}
         </div>
       )}

       <p
         className="
           mt-2.5
           text-[9.5px]
           leading-[1.45]
           text-[#806A4D]
         ">

         This amount is added to the monthly
         plan price.
       </p>
     </div>
   );
 }

 return (
   <div
     className="
       mt-4
       rounded-[8px]
       border
       border-[#DED6CF]
       bg-[#F8F6F3]
       px-3
       py-3
     ">

     <div
       className="
         flex
         items-center
         gap-2
         text-[#68615B]
       ">

       <InfoIcon />

       <p
         className="
           text-[11px]
           font-semibold
         ">

         Pricing being confirmed
       </p>
     </div>

     <p
       className="
         mt-1.5
         text-[10px]
         leading-[1.5]
         text-[#77706A]
       ">

       This exact product can be added now.
       Any applicable premium or quantity
       charge will be confirmed before checkout.
     </p>
   </div>
 );
}

export default function ProductCard({
 product,
 isInPouch,
 selectedPlan,
 selectedSupplementCount,
 onAddToPouch,
}: ProductCardProps) {
 const [
   isFindingVendorLink,
   setIsFindingVendorLink,
 ] =
   useState(
     false
   );

 const [
   vendorLinkError,
   setVendorLinkError,
 ] =
   useState(
     ""
   );

 const [
   resolvedBottlePrice,
   setResolvedBottlePrice,
 ] =
   useState<
     number | null>
(
     null
   );

 const representative =
   product
     .representativeProduct;

 const bottleUnitCount =
   representative
     .capsulesPerBottle;

 const displayedBottlePrice =
   resolvedBottlePrice ??
   representative
     .bottlePrice;

 const bottlePricePerUnit =
   bottleUnitCount >
   0
     ? displayedBottlePrice /
       bottleUnitCount
     : null;

 const pouchUnitsPerDay =
   product.unitsPerDay ??
   1;

 const pouchUnitCount =
   pouchUnitsPerDay *
   30;

 const unitLabel =
   product.unitLabel;

 const pluralUnitLabel =
   getPluralUnitLabel(
     unitLabel,
     bottleUnitCount
   );

 const pouchPluralUnitLabel =
   getPluralUnitLabel(
     unitLabel,
     pouchUnitCount
   );

 const vidaPouchScore =
   product.score.overall !==
   null
     ? clampScore(
         product.score
           .overall
       )
     : null;

 const retailerRating =
   representative.rating;

 const retailerReviewCount =
   representative
     .reviewCount;

 const hasRetailerRating =
   typeof retailerRating ===
     "number" &&
   retailerRating >
     0;

 const productClaims =
   Array.from(
     new Set([
       ...product.certifications,

       ...product.qualityClaims,

       product
         .verifiedClaims
         .nsfCertified
         ? "NSF Certified"
         : null,

       product
         .verifiedClaims
         .uspVerified
         ? "USP Verified"
         : null,

       product
         .verifiedClaims
         .thirdPartyTested
         ? "Third-Party Tested"
         : null,

       product
         .verifiedClaims
         .vegan
         ? "Vegan"
         : null,

       product
         .verifiedClaims
         .nonGmo
         ? "Non-GMO"
         : null,

       product
         .verifiedClaims
         .glutenFree
         ? "Gluten-Free"
         : null,
     ])
   ).filter(
     (
       claim
     ): claim is string =>
       typeof claim ===
         "string" &&
       claim.trim().length >
         0
   );

 const dosageLabel =
   product.dosage ||
   "Not specified";

 const formLabel =
   product.form ||
   "Not specified";

 const dosageBasisLabel =
   product
     .dosageIsPerServing ===
   true
     ? "Per serving"
     : product
           .dosageIsPerServing ===
         false
       ? `Per ${unitLabel}`
       : null;

 const canAddToVitaPouch =
   product
     .vitaPouchFormEligible;

 const recommendedPouchTiming =
   getSearchPouchTiming(
     product
   );

 const pouchItemId =
   representative
     .shoppingProductId ??
   `${product.brand}-${product.productName}`;

 const hasSelectedPlan =
   selectedPlan !==
   null;

 const nextPlan =
   selectedPlan
     ? getNextSearchPlan(
         selectedPlan.id
       )
     : null;

 const reachesCurrentPlanLimit =
   selectedPlan !==
     null &&
   selectedSupplementCount >=
     selectedPlan
       .supplementLimit &&
   !isInPouch;

 const willAutomaticallyUpgrade =
   reachesCurrentPlanLimit &&
   nextPlan !==
     null;

 const customRoutineRequired =
   reachesCurrentPlanLimit &&
   nextPlan ===
     null;

 /*
  * When adding this item will automatically
  * upgrade the plan, calculate pricing against
  * the destination plan rather than the old
  * plan.
  */
 const effectivePlan =
   willAutomaticallyUpgrade &&
   nextPlan
     ? nextPlan
     : selectedPlan;

 const vitaPouchPricing =
   effectivePlan
     ? calculateVitaPouchAddOn({
         product,

         selectedPlan:
           effectivePlan,
       })
     : null;

 const addButtonDisabled =
   isInPouch ||
   !hasSelectedPlan ||
   customRoutineRequired;

 function handleAddToPouch() {
   if (
     !canAddToVitaPouch ||
     addButtonDisabled ||
     selectedPlan ===
       null
   ) {
     return;
   }

   onAddToPouch({
     id:
       pouchItemId,

     shoppingProductId:
       representative
         .shoppingProductId ??
       null,

     productName:
       product.productName,

     brand:
       product.brand,

     dosage:
       product.dosage,

     form:
       product.form,

     unitLabel:
       product.unitLabel,

     unitsPerDay:
       pouchUnitsPerDay,

     monthlyUnitCount:
       pouchUnitCount,

     monthlyPrice:
       product
         .displayedMonthlyCost,

     baselineUnitsPerDay:
       product
         .baselineUnitsPerDay ??
       pouchUnitsPerDay,

     baselineMonthlyPrice:
       product
         .baselineMonthlyCost ??
       product
         .displayedMonthlyCost,

     pricing:
       vitaPouchPricing ??
       undefined,

     bottlePrice:
       representative
         .bottlePrice,

     retailer:
       representative
         .retailer,

     imageUrl:
       representative
         .imageUrl ??
       null,

     vitaPouchScore:
       vidaPouchScore,

     certifications:
       product.certifications,

     qualityClaims:
       product.qualityClaims,

     timing:
       recommendedPouchTiming
         .timing,

     recommendedTiming:
       recommendedPouchTiming
         .timing,

     timingPreference:
       "vidapouch",

     timingReason:
       recommendedPouchTiming
         .reason,
   });
 }

 async function handleBuyBottle() {
   if (
     isFindingVendorLink
   ) {
     return;
   }

   const immersiveProductPageToken =
     representative
       .immersiveProductPageToken;

   if (
     !immersiveProductPageToken
   ) {
     setVendorLinkError(
       "The exact Google Shopping product token is missing for this listing."
     );

     return;
   }

   setVendorLinkError(
     ""
   );

   setIsFindingVendorLink(
     true
   );

   /*
    * Open during the original click so
    * Safari does not block the new tab.
    */
   const vendorWindow =
     window.open(
       "",
       "_blank"
     );

   if (
     vendorWindow
   ) {
     vendorWindow.document.title =
       `Opening ${representative.retailer}…`;

     vendorWindow.document.body.innerHTML =
       `
         <div style="
           min-height: 100vh;
           display: flex;
           align-items: center;
           justify-content: center;
           padding: 24px;
           box-sizing: border-box;
           font-family: Arial, sans-serif;
           color: #17252c;
           background: #faf8f6;
           text-align: center;
         ">
           Confirming the exact
           ${representative.retailer}
           product and current price…
         </div>
       `;
   }

   try {
     const response =
       await fetch(
         "/api/search/vendor-link",
         {
           method:
             "POST",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               retailer:
                 representative
                   .retailer,

               productTitle:
                 product
                   .productName,

               bottlePrice:
                 representative
                   .bottlePrice,

               shoppingProductId:
                 representative
                   .shoppingProductId,

               immersiveProductPageToken:
                 representative
                   .immersiveProductPageToken,

               serpApiImmersiveProductUrl:
                 representative
                   .serpApiImmersiveProductUrl,
             }),
         }
       );

     let data:
       VendorLinkResponse;

     try {
       data =
         (await response.json()) as
           VendorLinkResponse;
     } catch {
       throw new Error(
         "The vendor-link service returned an invalid response."
       );
     }

     if (
       !response.ok ||
       !data.url
     ) {
       throw new Error(
         data.error ||
           `The exact ${representative.retailer} offer could not be found.`
       );
     }

     const liveBottlePrice =
       typeof data
         .liveBottlePrice ===
         "number" &&
       Number.isFinite(
         data.liveBottlePrice
       ) &&
       data.liveBottlePrice >
         0
         ? data.liveBottlePrice
         : null;

     if (
       liveBottlePrice !==
       null
     ) {
       setResolvedBottlePrice(
         liveBottlePrice
       );
     }

     if (
       vendorWindow
     ) {
       vendorWindow.opener =
         null;

       vendorWindow.location.href =
         data.url;
     } else {
       window.location.href =
         data.url;
     }
   } catch (
     error
   ) {
     if (
       vendorWindow &&
       !vendorWindow.closed
     ) {
       vendorWindow.close();
     }

     const message =
       error instanceof Error
         ? error.message
         : "The exact vendor offer could not be found.";

     console.error(
       "VidaSearch Buy Bottle failed:",
       {
         retailer:
           representative
             .retailer,

         productTitle:
           product
             .productName,

         shoppingProductId:
           representative
             .shoppingProductId ??
           null,

         hasImmersiveProductPageToken:
           Boolean(
             representative
               .immersiveProductPageToken
           ),

         error:
           message,
       }
     );

     setVendorLinkError(
       message
     );
   } finally {
     setIsFindingVendorLink(
       false
     );
   }
 }

 return (
   <article
     className="
       grid
       w-full
       min-w-0
       grid-cols-1
       overflow-hidden
       border-b
       border-[#EEE7DF]
       bg-white
       last:border-b-0
       lg:grid-cols-[minmax(0,1.65fr)_minmax(155px,0.68fr)_minmax(190px,0.82fr)]
     ">

     {/* Product and score */}

     <div
       className="
         flex
         min-w-0
         gap-4
         border-b
         border-[#EEE7DF]
         px-4
         py-5
         lg:border-b-0
       ">

       <div
         className="
           flex
           w-[88px]
           flex-none
           items-start
           justify-center
         ">

         {representative.imageUrl ? (
           <div
             className="
               flex
               h-[122px]
               w-[82px]
               items-center
               justify-center
               overflow-hidden
               bg-white
               p-1
             ">

             <img
               src={
                 representative
                   .imageUrl
               }
               alt={`${product.productName} product`}
               className="
                 h-full
                 w-full
                 object-contain
               "
               loading="lazy"
               referrerPolicy="no-referrer"
             />
           </div>
         ) : (
           <div
             className="
               flex
               h-[122px]
               w-[82px]
               items-center
               justify-center
               rounded-[10px]
               border
               border-[#E4DDD5]
               bg-[#F8F5F1]
               px-2
               text-center
               text-[10px]
               font-semibold
               text-[#8C1D40]
             ">

             {product.brand}
           </div>
         )}
       </div>

       <div className="min-w-0 flex-1">
         <h3
           className="
             text-[15px]
             font-semibold
             leading-[1.3]
             text-[#081620]
           ">

           {product.productName}
         </h3>

         <div
           className="
             mt-1.5
             flex
             min-w-0
             flex-wrap
             items-center
             gap-x-2
             gap-y-1.5
           ">

           <span
             className="
               text-[12px]
               leading-5
               text-[#30383B]
             ">

             {product.brand}
           </span>

           {product.recommended && (
             <span
               className="
                 whitespace-nowrap
                 rounded-md
                 bg-[#EEF0E8]
                 px-2
                 py-1
                 text-[8px]
                 font-bold
                 uppercase
                 tracking-[0.035em]
                 text-[#46514B]
               ">

               Best Overall
             </span>
           )}
         </div>

         <div
           className="
             mt-3
             grid
             max-w-[300px]
             grid-cols-2
             gap-2
           ">

           <div
             className="
               rounded-[8px]
               border
               border-[#E8E0D8]
               bg-[#FBF9F7]
               px-3
               py-2
             ">

             <p
               className="
                 text-[9px]
                 font-semibold
                 uppercase
                 tracking-[0.06em]
                 text-[#727B7E]
               ">

               Dosage
             </p>

             <p
               className="
                 mt-1
                 text-[14px]
                 font-semibold
                 text-[#17252C]
               ">

               {dosageLabel}
             </p>

             {dosageBasisLabel && (
               <p
                 className="
                   mt-0.5
                   text-[9px]
                   text-[#697276]
                 ">

                 {dosageBasisLabel}
               </p>
             )}
           </div>

           <div
             className="
               rounded-[8px]
               border
               border-[#E8E0D8]
               bg-[#FBF9F7]
               px-3
               py-2
             ">

             <p
               className="
                 text-[9px]
                 font-semibold
                 uppercase
                 tracking-[0.06em]
                 text-[#727B7E]
               ">

               Form
             </p>

             <p
               className="
                 mt-1
                 text-[14px]
                 font-semibold
                 text-[#17252C]
               ">

               {formLabel}
             </p>
           </div>
         </div>

         <div
           className="
             mt-3
             flex
             min-w-0
             items-center
             gap-3
           ">

           <div
             className="
               flex
               h-[48px]
               w-[48px]
               flex-none
               items-center
               justify-center
               rounded-full
               border-[3px]
               border-[#8C1D40]
               bg-[#FCF9F7]
             "
             aria-label={
               vidaPouchScore !==
               null
                 ? `VidaPouch score ${vidaPouchScore} out of 100`
                 : "VidaPouch score not available"
             }>

             <span
               className="
                 text-[15px]
                 font-bold
                 leading-none
                 text-[#8C1D40]
               ">

               {vidaPouchScore ??
                 "—"}
             </span>
           </div>

           <p
             className="
               text-[12px]
               font-semibold
               text-[#17252C]
             ">

             VidaPouch Score
           </p>
         </div>

         {productClaims.length >
           0 && (
           <div
             className="
               mt-3
               flex
               flex-wrap
               gap-1.5
             ">

             {productClaims.map(
               (claim) => (
                 <span
                   key={
                     claim
                   }
                   className="
                     whitespace-nowrap
                     rounded
                     bg-[#F1F3EC]
                     px-2
                     py-1
                     text-[9px]
                     font-medium
                     text-[#3D4548]
                   ">

                   {claim}
                 </span>
               )
             )}
           </div>
         )}
       </div>
     </div>

     {/* Buy bottle */}

     <div
       className="
         flex
         min-w-0
         flex-col
         border-b
         border-[#EEE7DF]
         px-4
         py-5
         lg:border-b-0
         lg:border-l
       ">

       <div className="min-w-0">
         <p
           className="
             whitespace-nowrap
             text-[11px]
             leading-5
             text-[#485256]
           ">

           {bottleUnitCount}{" "}
           {pluralUnitLabel}
         </p>

         <p
           className="
             mt-1
             whitespace-nowrap
             text-[23px]
             font-semibold
             leading-none
             tracking-[-0.025em]
             text-[#081620]
           ">

           {formatCurrency(
             displayedBottlePrice
           )}
         </p>

         {bottlePricePerUnit !==
           null && (
           <p
             className="
               mt-2
               whitespace-nowrap
               text-[11px]
               leading-5
               text-[#596367]
             ">

             {formatCurrency(
               bottlePricePerUnit
             )}{" "}
             / {unitLabel}
           </p>
         )}

         <div
           className="
             mt-4
             text-[11px]
             leading-[1.55]
             text-[#4F5A5E]
           ">

           <div
             className="
               flex
               min-w-0
               items-center
               justify-between
               gap-2
             ">

             <span
               className="
                 truncate
                 font-semibold
                 text-[#4F5A5E]
               ">

               {
                 representative
                   .retailer
               }
             </span>

             <span
               className="
                 flex-none
                 text-[14px]
                 leading-none
                 text-[#4F5A5E]
               "
               aria-hidden="true">

               →
             </span>
           </div>

           {hasRetailerRating && (
             <div
               className="
                 mt-1.5
                 flex
                 flex-wrap
                 items-center
                 gap-1.5
               ">

               <RatingStars
                 rating={
                   retailerRating
                 }
               />

               <span
                 className="
                   font-semibold
                   text-[#3F494D]
                 ">

                 {retailerRating.toFixed(
                   1
                 )}
               </span>

               {typeof retailerReviewCount ===
                 "number" &&
                 retailerReviewCount >
                   0 && (
                 <span
                   className="
                     text-[#697276]
                   ">

                   (
                   {formatReviewCount(
                     retailerReviewCount
                   )}
                   )
                 </span>
               )}
             </div>
           )}

           <p className="mt-1">
             Buy directly
           </p>
         </div>
       </div>

       <button
         type="button"
         onClick={
           handleBuyBottle
         }
         disabled={
           isFindingVendorLink
         }
         className="
           mt-auto
           flex
           h-[38px]
           w-full
           min-w-0
           items-center
           justify-center
           whitespace-nowrap
           rounded-[7px]
           border
           border-[#8C1D40]
           bg-white
           px-2
           text-[11px]
           font-semibold
           text-[#8C1D40]
           transition
           hover:bg-[#FAF6F7]
           disabled:cursor-wait
           disabled:border-[#C9AFB8]
           disabled:text-[#9A6D7D]
         ">

         {isFindingVendorLink
           ? `Finding ${representative.retailer} link…`
           : `Buy at ${representative.retailer}`}
       </button>

       {vendorLinkError && (
         <p
           className="
             mt-2
             text-[10px]
             leading-[1.4]
             text-[#A23636]
           "
           role="alert">

           {vendorLinkError}
         </p>
       )}
     </div>

     {/* Add to VidaPouch plan */}

     <div
       className="
         flex
         min-w-0
         flex-col
         px-4
         py-5
         lg:border-l
         lg:border-[#EEE7DF]
       ">

       {canAddToVitaPouch ? (
         selectedPlan ===
         null ? (
           <>
             <div className="min-w-0">
               <div
                 className="
                   flex
                   items-center
                   gap-2
                   text-[#4F5A5E]
                 ">

                 <CalendarIcon />

                 <p
                   className="
                     text-[11px]
                     font-medium
                   ">

                   {pouchUnitCount}{" "}
                   {pouchPluralUnitLabel} monthly
                 </p>
               </div>

               <div
                 className="
                   mt-4
                   rounded-[9px]
                   border
                   border-[#E6DDD4]
                   bg-[#FBF8F3]
                   px-3
                   py-4
                 ">

                 <div
                   className="
                     flex
                     items-start
                     gap-3
                   ">

                   <span
                     className="
                       mt-[1px]
                       shrink-0
                       text-[#9B714D]
                     ">

                     <PlanIcon />
                   </span>

                   <div>
                     <p
                       className="
                         text-[12px]
                         font-semibold
                         text-[#2C3437]
                       ">

                       Select a VidaPouch plan
                     </p>

                     <p
                       className="
                         mt-1.5
                         text-[10.5px]
                         leading-[1.5]
                         text-[#697276]
                       ">

                       Plans are optional. Choose one
                       above to receive this exact
                       supplement in personalized
                       daily pouches.
                     </p>
                   </div>
                 </div>
               </div>

               <div className="mt-4 space-y-3">
                 <PlanDetailRow
                   icon={
                     <CheckCircleIcon />
                   }>

                   Exact brand and dosage supported
                 </PlanDetailRow>

                 <PlanDetailRow
                   icon={
                     <ShieldIcon />
                   }>

                   Organized into daily pouches
                 </PlanDetailRow>

                 <PlanDetailRow
                   icon={
                     <InfoIcon />
                   }>

                   Premium and higher-quantity
                   add-ons appear before checkout
                 </PlanDetailRow>
               </div>
             </div>

             <button
               type="button"
               disabled
               className="
                 mt-auto
                 flex
                 min-h-[42px]
                 w-full
                 items-center
                 justify-center
                 gap-2
                 rounded-[8px]
                 border
                 border-[#DDD4CC]
                 bg-[#EEE9E4]
                 px-3
                 text-[11px]
                 font-semibold
                 text-[#7A716A]
                 cursor-not-allowed
               ">

               Select a Plan to Add
             </button>
           </>
         ) : (
           <>
             <div className="min-w-0">
               <div
                 className="
                   flex
                   items-center
                   gap-2
                   text-[#4F5A5E]
                 ">

                 <CalendarIcon />

                 <p
                   className="
                     text-[11px]
                     font-medium
                   ">

                   {pouchUnitCount}{" "}
                   {pouchPluralUnitLabel} monthly
                 </p>
               </div>

               <div
                 className="
                   mt-3
                   inline-flex
                   rounded-[7px]
                   border
                   border-[#DCCBB8]
                   bg-[#FBF2E6]
                   px-2.5
                   py-1.5
                   text-[10px]
                   font-semibold
                   text-[#76552E]
                 ">

                 Eligible for{" "}
                 {effectivePlan?.name ??
                   selectedPlan.name}
               </div>

               <div className="mt-4 space-y-3">
                 <PlanDetailRow
                   icon={
                     <PersonIcon />
                   }>

                   Uses 1 of{" "}
                   {effectivePlan
                     ?.supplementLimit ??
                     selectedPlan
                       .supplementLimit} supplement slots
                 </PlanDetailRow>

                 <PlanDetailRow
                   icon={
                     <CheckCircleIcon />
                   }>

                   Exact brand and dosage supported
                 </PlanDetailRow>

                 <PlanDetailRow
                   icon={
                     <ShieldIcon />
                   }>

                   Ships in your personalized pouch
                 </PlanDetailRow>
               </div>

               {vitaPouchPricing && (
                 <PricingStatus
                   pricing={
                     vitaPouchPricing
                   }
                   planName={
                     effectivePlan?.name ??
                     selectedPlan.name
                   }
                 />
               )}

               {willAutomaticallyUpgrade &&
                 nextPlan && (
                 <div
                   className="
                     mt-4
                     rounded-[7px]
                     border
                     border-[#D8C7B3]
                     bg-[#FBF5EC]
                     px-3
                     py-2.5
                   ">

                   <p
                     className="
                       text-[10px]
                       font-semibold
                       leading-[1.45]
                       text-[#73542E]
                     ">

                     Adding this supplement will
                     update your plan to{" "}
                     {nextPlan.name} at{" "}
                     {formatCurrency(
                       nextPlan.monthlyPrice
                     )} per month.
                   </p>
                 </div>
               )}

               {customRoutineRequired && (
                 <div
                   className="
                     mt-4
                     rounded-[7px]
                     border
                     border-[#E4C6C6]
                     bg-[#FCF2F2]
                     px-3
                     py-2.5
                   ">

                   <p
                     className="
                       text-[10px]
                       font-semibold
                       leading-[1.45]
                       text-[#9A3030]
                     ">

                     Premier supports up to eight
                     supplements. Build a custom
                     routine on VitaPouch.com for
                     additional supplements or
                     pouch times.
                   </p>

                   <a
                     href="https://vitapouch.com"
                     className="
                       mt-2
                       inline-flex
                       text-[10px]
                       font-bold
                       text-[#7D0E1C]
                       underline
                       underline-offset-2
                     ">

                     Build a Custom VitaPouch →
                   </a>
                 </div>
               )}
             </div>

             <button
               type="button"
               onClick={
                 handleAddToPouch
               }
               disabled={
                 addButtonDisabled
               }
               className={`
                 mt-auto
                 flex
                 min-h-[42px]
                 w-full
                 min-w-0
                 items-center
                 justify-center
                 gap-2
                 rounded-[8px]
                 px-3
                 text-center
                 text-[11px]
                 font-semibold
                 transition
                 ${
                   isInPouch
                     ? `
                         cursor-default
                         border
                         border-[#BCD0B8]
                         bg-[#EEF5EA]
                         text-[#35613D]
                       `
                     : customRoutineRequired
                       ? `
                           cursor-not-allowed
                           border
                           border-[#DDD4CC]
                           bg-[#EEE9E4]
                           text-[#7A716A]
                         `
                       : `
                           bg-[#8C1D40]
                           text-white
                           hover:bg-[#741935]
                         `
                 }
               `}>

               <span
                 className="
                   text-[16px]
                   leading-none
                 "
                 aria-hidden="true">

                 {isInPouch
                   ? "✓"
                   : customRoutineRequired
                     ? "!"
                     : "+"}
               </span>

               <span>
                 {isInPouch
                   ? `Added to ${selectedPlan.name} Plan`
                   : customRoutineRequired
                     ? "Custom Routine Required"
                     : willAutomaticallyUpgrade &&
                         nextPlan
                       ? `Add & Upgrade to ${nextPlan.name}`
                       : vitaPouchPricing?.status ===
                           "add-on"
                         ? `Add for +${formatCurrency(
                             vitaPouchPricing
                               .totalMonthlyAddOn
                           )}/mo`
                         : `Add to ${selectedPlan.name} Plan`}
               </span>
             </button>
           </>
         )
       ) : (
         <div
           className="
             flex
             h-full
             min-h-[150px]
             flex-col
             items-start
             justify-center
           ">

           <p
             className="
               text-[12px]
               font-semibold
               text-[#17252C]
             ">

             Bottle purchase only
           </p>

           <p
             className="
               mt-2
               text-[11px]
               leading-[1.55]
               text-[#697276]
             ">

             This product form is not currently
             available for VidaPouch packaging.
           </p>
         </div>
       )}
     </div>
   </article>
 );
}