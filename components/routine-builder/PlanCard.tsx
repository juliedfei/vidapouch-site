import type { Supplement } from "./types";

function formatPrice(value: number) {
 return new Intl.NumberFormat("en-US", {
   style: "currency",
   currency: "USD",
   maximumFractionDigits: 0,
 }).format(value);
}

export default function PlanCard({
 title,
 label,
 supplements,
 removeSupplement,
 moveSupplement,
}: {
 title: string;
 label: string;
 supplements: Supplement[];
 removeSupplement?: (indexToRemove: number) => void;
 moveSupplement?: (indexToMove: number) => void;
}) {
 const isMorning = label.toLowerCase().includes("morning");

 return (
   <div className="rounded-[24px] border border-[#DDD7CF] bg-white/55 p-5 shadow-[0_14px_38px_rgba(20,15,10,0.04)]">
     <div className="flex items-start justify-between gap-4">
       <div>
         <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C1D40]">
           {title}
         </p>

         <h3
           className="mt-2 text-[28px] tracking-[-0.03em] text-[#081620]"
           style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

           {label}
         </h3>
       </div>

       <span className="rounded-full border border-[#DDD7CF] bg-[#F8F2EA]/80 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#5D686C]">
         {supplements.length} item{supplements.length === 1 ? "" : "s"}
       </span>
     </div>

     <div className="mt-4 grid gap-3">
       {supplements.length > 0 ? (
         supplements.map((supplement, index) => (
           <div
             key={`${supplement.id || supplement.name}-${index}`}
             className="rounded-2xl border border-[#DDD7CF] bg-[#F8F2EA] px-4 py-4">

             <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
               <div className="min-w-0 flex-1">
                 <p className="font-medium text-[#081620]">
                   {supplement.name}
                 </p>

                 <p className="mt-1 text-sm leading-6 text-[#5D686C]">
                   {supplement.dosage || "Dosage not added"}
                 </p>

                 {supplement.description && (
                   <p className="mt-2 text-sm leading-6 text-[#5D686C]">
                     {supplement.description}
                   </p>
                 )}

                 {supplement.monthlyPrice && (
                   <p className="mt-2 text-sm font-medium text-[#081620]">
                     {formatPrice(supplement.monthlyPrice)} / month
                   </p>
                 )}
               </div>

               <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:items-end">
                 {moveSupplement && (
                   <button
                     type="button"
                     onClick={() => moveSupplement(index)}
                     className="cursor-pointer rounded-full border border-[#DDD7CF] bg-white/55 px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-[#1B2529]">

                     Move to {isMorning ? "Evening" : "Morning"}
                   </button>
                 )}

                 {removeSupplement && (
                   <button
                     type="button"
                     onClick={() => removeSupplement(index)}
                     className="cursor-pointer rounded-full border border-[#8C1D40]/30 bg-white/55 px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-[#8C1D40]">

                     Remove
                   </button>
                 )}
               </div>
             </div>
           </div>
         ))
       ) : (
         <div className="rounded-2xl border border-dashed border-[#D6CCBF] bg-[#F8F2EA]/60 px-4 py-5 text-sm leading-6 text-[#5D686C]">
           No supplements yet. Add an optional suggestion or move an item into
           this pouch.
         </div>
       )}
     </div>
   </div>
 );
}
