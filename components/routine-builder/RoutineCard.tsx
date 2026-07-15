"use client";

import type { Supplement } from "./types";

type RoutineCardProps = {
 supplement: Supplement;
 onRemove: () => void;
};

export default function RoutineCard({
 supplement,
 onRemove,
}: RoutineCardProps) {
 return (
   <div className="rounded-[22px] border border-[#DDD7CF] bg-white p-5 shadow-sm transition hover:shadow-md">

     <div className="flex items-start justify-between gap-5">

       <div className="min-w-0">

         <h3
           className="truncate text-[24px] tracking-[-0.03em] text-[#081620]"
           style={{
             fontFamily: 'Georgia, "Times New Roman", serif',
           }}>

           {supplement.name}
         </h3>

         <div className="mt-4 flex flex-wrap gap-3">

           <div className="rounded-full bg-[#F3E9DD] px-4 py-2">

             <div className="text-[10px] uppercase tracking-[0.14em] text-[#7B7670]">
               Brand
             </div>

             <div className="mt-1 text-[15px] text-[#081620]">
               {supplement.brand ||
                 supplement.customBrand ||
                 "Any Brand"}
             </div>

           </div>

           <div className="rounded-full bg-[#F3E9DD] px-4 py-2">

             <div className="text-[10px] uppercase tracking-[0.14em] text-[#7B7670]">
               Daily Dose
             </div>

             <div className="mt-1 text-[15px] text-[#081620]">
               {supplement.dosage || "Not entered"}
             </div>

           </div>

         </div>

       </div>

       <button
         type="button"
         onClick={onRemove}
         className="flex h-10 w-10 items-center justify-center rounded-full text-[#8C1D40] transition hover:bg-[#F8F2EA]"
         aria-label="Remove supplement">

         ✕
       </button>

     </div>

   </div>
 );
}
