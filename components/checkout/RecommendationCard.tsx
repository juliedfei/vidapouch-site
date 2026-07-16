"use client";

import { useState } from "react";

import type {
 CheckoutRecommendation,
} from "@/lib/checkout/checkoutTypes";

type Props = {
 recommendation: CheckoutRecommendation;
};

export default function RecommendationCard({
 recommendation,
}: Props) {
 const [isOpen, setIsOpen] =
   useState(false);

 const wasChosenByVidaPouch =
   recommendation.selectedBy ===
   "vidapouch";

 const sortedReasons = [
   ...recommendation.customerFacingReasons,
 ].sort(
   (a, b) =>
     b.importance - a.importance
 );

 return (
   <div className="mt-4 rounded-2xl border border-[#E5DDD3] bg-white">
     <button
       type="button"
       onClick={() =>
         setIsOpen((current) => !current)
       }
       aria-expanded={isOpen}
       className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">

       <div>
         <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C1D40]">
           {wasChosenByVidaPouch
             ? "Why VidaPouch chose this"
             : "Brand selection"}
         </p>

         <p className="mt-1 text-sm text-[#475357]">
           {wasChosenByVidaPouch
             ? `${
                 recommendation.alternativesConsidered +
                 1
               } option${
                 recommendation.alternativesConsidered ===
                 0
                   ? ""
                   : "s"
               } reviewed`
             : "You selected this brand"}
         </p>
       </div>

       <span className="text-lg leading-none text-[#8C1D40]">
         {isOpen ? "−" : "+"}
       </span>
     </button>

     {isOpen && (
       <div className="border-t border-[#E5DDD3] px-4 py-4">
         {sortedReasons.length === 0 ? (
           <p className="text-sm leading-6 text-[#5D686C]">
             No additional recommendation
             details are available.
           </p>
         ) : (
           <div className="space-y-4">
             {sortedReasons.map(
               (reason, index) => (
                 <div
                   key={`${reason.title}-${index}`}
                   className="flex gap-3">

                   <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F3E9DD] text-[11px] font-semibold text-[#8C1D40]">
                     ✓
                   </div>

                   <div>
                     <p className="text-sm font-semibold text-[#081620]">
                       {reason.title}
                     </p>

                     <p className="mt-1 text-sm leading-6 text-[#5D686C]">
                       {reason.description}
                     </p>
                   </div>
                 </div>
               )
             )}
           </div>
         )}
       </div>
     )}
   </div>
 );
}
