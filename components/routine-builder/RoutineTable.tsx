"use client";

import type { Supplement } from "./types";

type RoutineTableProps = {
 supplements: Supplement[];
 removeSupplement: (indexToRemove: number) => void;
};

export default function RoutineTable({
 supplements,
 removeSupplement,
}: RoutineTableProps) {
 return (
   <>
     <div className="mt-4 hidden overflow-hidden rounded-[18px] border border-[#DDD7CF] md:block">
       <div className="grid grid-cols-[1.7fr_1.2fr_1fr_90px] bg-[#EDE1D3] px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-[#5D686C]">
         <p>Supplement</p>
         <p>Brand</p>
         <p>Daily Amount</p>
         <p></p>
       </div>

       {supplements.map((supplement, index) => (
         <div
           key={index}
           className="grid grid-cols-[1.7fr_1.2fr_1fr_90px] items-center gap-3 border-t border-[#DDD7CF] bg-[#F8F2EA] px-4 py-4">

           <p className="font-medium">{supplement.name}</p>

           <p className="text-[#475357]">
             {supplement.vidapouchChoosesBrand
               ? "VidaPouch chooses (Recommended)"
               : supplement.brand ||
                 supplement.customBrand ||
                 "Not specified"}
           </p>

           <p>{supplement.dosage || "Not added"}</p>

           <button
             onClick={() => removeSupplement(index)}
             className="text-sm text-[#8C1D40]">

             Remove
           </button>
         </div>
       ))}
     </div>

     <div className="mt-4 grid gap-3 md:hidden">
       {supplements.map((supplement, index) => (
         <div
           key={index}
           className="rounded-[18px] border border-[#DDD7CF] bg-[#F8F2EA] p-4">

           <div className="flex items-start justify-between gap-4">
             <div>
               <p className="text-[11px] uppercase tracking-[0.14em] text-[#8C1D40]">
                 Supplement
               </p>

               <p className="mt-1 text-[18px] font-medium text-[#081620]">
                 {supplement.name}
               </p>
             </div>

             <button
               onClick={() => removeSupplement(index)}
               className="text-sm text-[#8C1D40]">

               Remove
             </button>
           </div>

           <div className="mt-4">
             <p className="text-[11px] uppercase tracking-[0.14em] text-[#8C1D40]">
               Brand
             </p>

             <p className="mt-1 text-[#475357]">
               {supplement.vidapouchChoosesBrand
                 ? "VidaPouch chooses (Recommended)"
                 : supplement.brand ||
                   supplement.customBrand ||
                   "Not specified"}
             </p>
           </div>

           <div className="mt-4">
             <p className="text-[11px] uppercase tracking-[0.14em] text-[#8C1D40]">
               Daily Amount
             </p>

             <p className="mt-1 text-[#475357]">
               {supplement.dosage || "Not added"}
             </p>
           </div>
         </div>
       ))}
     </div>
   </>
 );
}
