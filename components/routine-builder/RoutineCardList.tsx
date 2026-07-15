"use client";

import RoutineCard from "./RoutineCard";

import type { Supplement } from "./types";

type RoutineCardListProps = {
 supplements: Supplement[];
 removeSupplement: (index: number) => void;
};

export default function RoutineCardList({
 supplements,
 removeSupplement,
}: RoutineCardListProps) {
 if (supplements.length === 0) {
   return (
     <div className="rounded-[24px] border border-dashed border-[#D5CABC] bg-white/45 px-8 py-14 text-center">

       <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9DD] text-[32px]">
         💊
       </div>

       <h3
         className="mt-6 text-[30px] tracking-[-0.04em] text-[#081620]"
         style={{
           fontFamily: 'Georgia, "Times New Roman", serif',
         }}>

         Your routine is empty
       </h3>

       <p className="mx-auto mt-3 max-w-[380px] text-[15px] leading-7 text-[#5D686C]">
         Add your first supplement to begin building your personalized
         VidaPouch routine.
       </p>

     </div>
   );
 }

 return (
   <div className="space-y-4">

     {supplements.map((supplement, index) => (
       <RoutineCard
         key={`${supplement.name}-${index}`}
         supplement={supplement}
         onRemove={() => removeSupplement(index)}
       />
     ))}

   </div>
 );
}