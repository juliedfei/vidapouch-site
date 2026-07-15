"use client";

import type { Recommendation } from "@/lib/recommendations/recommendationTypes";

type Props = {
 recommendation: Recommendation;

 onCompare?: () => void;

 onWhy?: () => void;
};

export default function RecommendationCard({

 recommendation,

 onCompare,

 onWhy,

}: Props) {

 return (

   <div className="rounded-[26px] border border-[#DDD7CF] bg-white p-6 shadow-[0_12px_32px_rgba(20,15,10,0.05)]">

     <div className="flex items-start justify-between">

       <div>

         <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C1D40]">

           Recommended

         </p>

         <h3
           className="mt-2 text-[28px] tracking-[-0.03em]"
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>


           {recommendation.product.brand}

         </h3>

       </div>

       <div className="text-right">

         <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C1D40]">

           Match

         </p>

         <p className="mt-2 text-[36px] font-semibold text-[#081620]">

           {Math.round(
             recommendation.score.overall * 10
           )}

         </p>

       </div>

     </div>

     <div className="mt-8 grid gap-3">

       {recommendation.reasons.map((reason) => (

         <div
           key={reason.title}
           className="flex items-start gap-3">


           <div className="mt-2 h-2 w-2 rounded-full bg-[#8C1D40]" />

           <div>

             <p className="font-medium">

               {reason.title}

             </p>

             <p className="text-sm leading-6 text-[#5D686C]">

               {reason.description}

             </p>

           </div>

         </div>

       ))}

     </div>

     <div className="mt-8 flex gap-3">

       <button
         type="button"
         onClick={onWhy}
         className="rounded-full border border-[#DDD7CF] px-5 py-3 text-sm transition hover:bg-[#F8F2EA]">


         Why this?

       </button>

       <button
         type="button"
         onClick={onCompare}
         className="rounded-full bg-[#081620] px-5 py-3 text-sm text-white transition hover:bg-[#17262C]">


         Compare Brands

       </button>

     </div>

   </div>

 );

}
