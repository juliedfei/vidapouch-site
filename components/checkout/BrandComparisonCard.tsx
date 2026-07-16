"use client";

import {
 useMemo,
 useState,
} from "react";

import type {
 CheckoutSupplement,
 InternalSourceOption,
} from "@/lib/checkout/checkoutTypes";

type Props = {
 supplement: CheckoutSupplement;

 onChooseBrand?: (
   option: InternalSourceOption
 ) => void;
};

const INITIAL_VISIBLE_BRANDS = 6;

function formatPrice(
 value: number
) {
 return new Intl.NumberFormat(
   "en-US",
   {
     style: "currency",
     currency: "USD",
     minimumFractionDigits: 2,
     maximumFractionDigits: 2,
   }
 ).format(value);
}

function buildOptionKey(
 option: InternalSourceOption,
 index: number
) {
 return [
   option.product.brand,
   option.product.retailer,
   option.product.bottlePrice,
   option.product.capsulesPerBottle,
   index,
 ].join("-");
}

/*
* The current score engine uses a
* 0–10 scale.
*
* Checkout presents the equivalent
* customer-facing score out of 100.
*/
function getTrustScore(
 option: InternalSourceOption
) {
 const rawScore =
   option.score?.overall ?? 0;

 if (rawScore <= 10) {
   return Math.max(
     0,
     Math.min(
       100,
       Math.round(rawScore * 10)
     )
   );
 }

 return Math.max(
   0,
   Math.min(
     100,
     Math.round(rawScore)
   )
 );
}

function getTrustLabel(
 trustScore: number
) {
 if (trustScore >= 90) {
   return "Excellent";
 }

 if (trustScore >= 80) {
   return "Very Good";
 }

 if (trustScore >= 70) {
   return "Good";
 }

 if (trustScore >= 60) {
   return "Fair";
 }

 return "Limited Data";
}

function getRecommendationBadge({
 option,
 isRecommended,
 lowestMonthlyCost,
}: {
 option: InternalSourceOption;
 isRecommended: boolean;
 lowestMonthlyCost: number;
}) {
 if (isRecommended) {
   return {
     icon: "🏆",
     label: "Best Overall",
   };
 }

 if (
   option.estimatedMonthlyCost ===
   lowestMonthlyCost
 ) {
   return {
     icon: "💰",
     label: "Best Value",
   };
 }

 const trustScore =
   getTrustScore(option);

 if (trustScore >= 90) {
   return {
     icon: "⭐",
     label: "Highly Rated",
   };
 }

 if (
   option.product.capsulesPerBottle >=
   180
 ) {
   return {
     icon: "📦",
     label: "Large Supply",
   };
 }

 return {
   icon: "✓",
   label: "Compared Option",
 };
}

export default function BrandComparisonCard({
 supplement,
 onChooseBrand,
}: Props) {
 const [isOpen, setIsOpen] =
   useState(false);

 const [
   showAllBrands,
   setShowAllBrands,
 ] = useState(false);

 const options = useMemo(() => {
   const sourceOptions =
     supplement.recommendation
       .internalAudit?.sourceOptions ??
     [];

   return [...sourceOptions].sort(
     (left, right) => {
       const leftScore =
         getTrustScore(left);

       const rightScore =
         getTrustScore(right);

       if (
         leftScore !== rightScore
       ) {
         return (
           rightScore - leftScore
         );
       }

       return (
         left.estimatedMonthlyCost -
         right.estimatedMonthlyCost
       );
     }
   );
 }, [supplement.recommendation]);

 const recommendedOption =
   options[0];

 const lowestMonthlyCost =
   options.length > 0
     ? Math.min(
         ...options.map(
           (option) =>
             option.estimatedMonthlyCost
         )
       )
     : 0;

 const visibleOptions =
   showAllBrands
     ? options
     : options.slice(
         0,
         INITIAL_VISIBLE_BRANDS
       );

 const remainingBrandCount =
   Math.max(
     options.length -
       INITIAL_VISIBLE_BRANDS,
     0
   );

 if (options.length === 0) {
   return null;
 }

 return (
   <div className="mt-3 overflow-hidden rounded-xl border border-[#E5DDD3] bg-white">
     <button
       type="button"
       onClick={() =>
         setIsOpen(
           (current) => !current
         )
       }
       aria-expanded={isOpen}
       className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-[#FCFAF7]">

       <div>
         <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8C1D40]">
           Compare Brands
         </span>

         <span className="mt-0.5 block text-xs text-[#6D777B]">
           {options.length} brand
           {options.length === 1
             ? ""
             : "s"}{" "}
           evaluated
         </span>
       </div>

       <span
         aria-hidden="true"
         className="text-[20px] leading-none text-[#8C1D40]">

         {isOpen ? "−" : "+"}
       </span>
     </button>

     {isOpen && (
       <div className="border-t border-[#E5DDD3]">
         {recommendedOption && (
           <div className="border-b border-[#E5DDD3] bg-[#F8F2EA] px-4 py-4">
             <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
               <div>
                 <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C1D40]">
                   ⭐ VidaPouch Pick
                 </p>

                 <p className="mt-1 font-semibold text-[#081620]">
                   {
                     recommendedOption
                       .product.brand
                   }
                 </p>

                 <p className="mt-1 text-xs leading-5 text-[#5D686C]">
                   Highest combined score
                   for quality, value,
                   evidence, reviews, and
                   availability.
                 </p>
               </div>

               <div className="shrink-0 sm:text-right">
                 <p className="text-[24px] font-semibold tracking-[-0.03em] text-[#081620]">
                   {getTrustScore(
                     recommendedOption
                   )}
                   <span className="text-sm font-normal text-[#6D777B]">
                     /100
                   </span>
                 </p>

                 <p className="text-xs font-medium text-[#5D686C]">
                   {getTrustLabel(
                     getTrustScore(
                       recommendedOption
                     )
                   )}
                 </p>
               </div>
             </div>
           </div>
         )}

         <div className="max-h-[430px] overflow-auto">
           <table className="w-full min-w-[720px] border-collapse">
             <thead className="sticky top-0 z-10 bg-[#FCFAF7]">
               <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6D777B]">
                 <th className="px-4 py-3">
                   Brand
                 </th>

                 <th className="px-4 py-3 text-center">
                   Trust
                 </th>

                 <th className="px-4 py-3">
                   Why
                 </th>

                 <th className="px-4 py-3 text-right">
                   Monthly
                 </th>

                 <th className="px-4 py-3 text-right">
                   Selection
                 </th>
               </tr>
             </thead>

             <tbody>
               {visibleOptions.map(
                 (option, index) => {
                   const isCurrent =
                     option.selected;

                   const isRecommended =
                     option ===
                     recommendedOption;

                   const trustScore =
                     getTrustScore(
                       option
                     );

                   const badge =
                     getRecommendationBadge(
                       {
                         option,
                         isRecommended,
                         lowestMonthlyCost,
                       }
                     );

                   return (
                     <tr
                       key={buildOptionKey(
                         option,
                         index
                       )}
                       className={`border-t border-[#F0ECE6] ${
                         isCurrent
                           ? "bg-[#F8F2EA]"
                           : "bg-white"
                       }`}>

                       <td className="px-4 py-3">
                         <div className="flex items-start gap-2">
                           {isRecommended && (
                             <span
                               aria-label="VidaPouch recommendation"
                               title="VidaPouch recommendation"
                               className="mt-0.5 text-[15px]">

                               ⭐
                             </span>
                           )}

                           <div className="min-w-0">
                             <p className="font-medium text-[#081620]">
                               {
                                 option
                                   .product
                                   .brand
                               }
                             </p>

                             {isCurrent && (
                               <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8C1D40]">
                                 Your current
                                 selection
                               </p>
                             )}
                           </div>
                         </div>
                       </td>

                       <td className="whitespace-nowrap px-4 py-3 text-center">
                         <p className="font-semibold text-[#081620]">
                           {trustScore}
                           <span className="text-xs font-normal text-[#6D777B]">
                             /100
                           </span>
                         </p>

                         <p className="mt-0.5 text-[10px] text-[#6D777B]">
                           {getTrustLabel(
                             trustScore
                           )}
                         </p>
                       </td>

                       <td className="px-4 py-3">
                         <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DDD3] bg-[#FCFAF7] px-2.5 py-1 text-xs font-medium text-[#475357]">
                           <span>
                             {badge.icon}
                           </span>

                           {badge.label}
                         </span>
                       </td>

                       <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-[#081620]">
                         {formatPrice(
                           option
                             .estimatedMonthlyCost
                         )}

                         <span className="ml-0.5 text-xs font-normal text-[#6D777B]">
                           /mo
                         </span>
                       </td>

                       <td className="whitespace-nowrap px-4 py-3 text-right">
                         {isCurrent ? (
                           <span className="inline-flex rounded-full border border-[#D8CEC2] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5D686C]">
                             Current
                           </span>
                         ) : (
                           <button
                             type="button"
                             onClick={() =>
                               onChooseBrand?.(
                                 option
                               )
                             }
                             disabled={
                               !onChooseBrand
                             }
                             className="rounded-full border border-[#8C1D40] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8C1D40] transition hover:bg-[#8C1D40] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">

                             Select
                           </button>
                         )}
                       </td>
                     </tr>
                   );
                 }
               )}
             </tbody>
           </table>
         </div>

         {remainingBrandCount > 0 && (
           <div className="border-t border-[#E5DDD3] bg-[#FCFAF7] px-4 py-3 text-center">
             <button
               type="button"
               onClick={() =>
                 setShowAllBrands(
                   (current) => !current
                 )
               }
               className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8C1D40] hover:underline">

               {showAllBrands
                 ? "Show fewer brands"
                 : `Show ${remainingBrandCount} more brand${
                     remainingBrandCount ===
                     1
                       ? ""
                       : "s"
                   }`}
             </button>
           </div>
         )}
       </div>
     )}
   </div>
 );
}
