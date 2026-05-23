import type { SuggestedAddition } from "./types";

type SuggestedAdditionsSectionProps = {
 suggestedAdditions: SuggestedAddition[];
 addSuggestedAddition: (indexToAdd: number) => void;
};

function formatPrice(value: number) {
 return new Intl.NumberFormat("en-US", {
   style: "currency",
   currency: "USD",
   maximumFractionDigits: 0,
 }).format(value);
}

export default function SuggestedAdditionsSection({
 suggestedAdditions,
 addSuggestedAddition,
}: SuggestedAdditionsSectionProps) {
 if (suggestedAdditions.length === 0) return null;

 return (
   <div className="mt-7 rounded-[24px] border border-[#DDD7CF] bg-[#F8F2EA]/80 p-5">
     <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C1D40]">
       Suggested additions
     </p>

     <h3
       className="mt-2 text-[24px] tracking-[-0.03em]"
       style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

       Optional support for your goals.
     </h3>

     <p className="mt-2 max-w-[620px] text-[15px] leading-7 text-[#475357]">
       These are optional additions you may want to consider. Add only what
       feels relevant to your routine.
     </p>

     <div className="mt-4 grid gap-3">
       {suggestedAdditions.map((addition, index) => (
         <div
           key={`${addition.name}-${index}`}
           className="rounded-2xl border border-[#DDD7CF] bg-[#F3E9DD]/70 px-4 py-4">

           <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
             <div>
               <p className="text-[11px] uppercase tracking-[0.14em] text-[#8C1D40]">
                 Suggested for {addition.suggestedTiming}
               </p>

               <p className="mt-1 text-[18px] font-medium text-[#081620]">
                 {addition.name}
               </p>

               <p className="mt-2 text-sm leading-6 text-[#5D686C]">
                 {addition.reason}
               </p>

               {addition.monthlyPrice && (
                 <p className="mt-2 text-sm font-medium text-[#081620]">
                   {formatPrice(addition.monthlyPrice)} / month
                 </p>
               )}
             </div>

             <button
               onClick={() => addSuggestedAddition(index)}
               className="cursor-pointer rounded-full bg-[#081620] px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-white">

               Add
             </button>
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}
