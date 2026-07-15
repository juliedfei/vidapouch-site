import type { SuggestedAddition } from "./types";

type SuggestedAdditionsSectionProps = {
 suggestedAdditions: SuggestedAddition[];
 addSuggestedAddition: (indexToAdd: number) => void;
};

export default function SuggestedAdditionsSection({
 suggestedAdditions,
 addSuggestedAddition,
}: SuggestedAdditionsSectionProps) {
 if (suggestedAdditions.length === 0) return null;

 const morningSuggestions = suggestedAdditions.filter(
   (addition) => addition.suggestedTiming === "morning"
 );

 const eveningSuggestions = suggestedAdditions.filter(
   (addition) => addition.suggestedTiming === "evening"
 );

 function renderSection(
   title: string,
   accentColor: string,
   additions: SuggestedAddition[]
 ) {
   if (additions.length === 0) return null;

   return (
     <div className="mt-6">

       <div className="mb-3 flex items-center gap-3">

         <div
           className={`h-2 w-2 rounded-full ${accentColor}`}
         />

         <h4
           className="text-[18px] tracking-[-0.02em] text-[#081620]"
           style={{
             fontFamily: 'Georgia, "Times New Roman", serif',
           }}>

           {title}
         </h4>

       </div>

       <div className="grid gap-3">

         {additions.map((addition) => {
           const originalIndex =
             suggestedAdditions.indexOf(addition);

           return (
             <div
               key={`${addition.name}-${originalIndex}`}
               className="rounded-2xl border border-[#DDD7CF] bg-[#F3E9DD]/70 px-4 py-4">


               <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                 <div className="flex-1">

                   <p className="text-[18px] font-medium text-[#081620]">
                     {addition.name}
                   </p>

                   <p className="mt-2 text-sm leading-6 text-[#5D686C]">
                     {addition.reason}
                   </p>

                 </div>

                 <button
                   type="button"
                   onClick={() =>
                     addSuggestedAddition(originalIndex)
                   }
                   className="cursor-pointer rounded-full bg-[#081620] px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-white transition hover:bg-[#17262C]">

                   Add
                 </button>

               </div>

             </div>
           );
         })}

       </div>

     </div>
   );
 }

 return (
   <div className="mt-7 rounded-[24px] border border-[#DDD7CF] bg-[#F8F2EA]/80 p-5">

     <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C1D40]">
       Recommended additions
     </p>

     <h3
       className="mt-2 text-[24px] tracking-[-0.03em]"
       style={{
         fontFamily: 'Georgia, "Times New Roman", serif',
       }}>

       Complete your personalized routine.
     </h3>

     <p className="mt-2 max-w-[620px] text-[15px] leading-7 text-[#475357]">
       These supplements complement your current routine. Add only the ones
       you'd like included in your personalized pouches.
     </p>

     {renderSection(
       "Morning Recommendations ☀️",
       "bg-[#8C1D40]",
       morningSuggestions
     )}

     {renderSection(
       "Evening Recommendations 🌙",
       "bg-[#173E73]",
       eveningSuggestions
     )}

   </div>
 );
}
