import Image from "next/image";
import type { Supplement } from "./types";



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
   <div className="rounded-[24px] border border-[#DDD7CF] bg-white p-6 shadow-[0_14px_38px_rgba(20,15,10,0.04)]">

     {/* HEADER */}

     <div className="relative flex items-start justify-between">

       {/* Left */}

       <p
         className={`text-[11px] uppercase tracking-[0.2em] font-medium ${
           isMorning ? "text-[#8C1D40]" : "text-[#173E73]"
         }`}>

         {title}
       </p>

       {/* Badge */}

       <div
       className={`absolute left-1/2 -translate-x-1/2 ${
   isMorning ? "-top-7" : "-top-[34px]"
 }`}>

 <Image
   src={
     isMorning
       ? "/images/branding/am-badge.png"
       : "/images/branding/pm-badge.png"
   }
   alt={isMorning ? "AM Badge" : "PM Badge"}
   width={isMorning ? 44 : 48}
   height={isMorning ? 64 : 70}
   priority
   className="pointer-events-none select-none"
 />
</div>

       {/* Count */}

       <span className="rounded-full border border-[#DDD7CF] bg-[#F8F2EA] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#5D686C]">
         {supplements.length} item{supplements.length === 1 ? "" : "s"}
       </span>

     </div>

     {/* Leaves room for badge */}

     <div className="mt-10 space-y-3">

       {supplements.length > 0 ? (

         supplements.map((supplement, index) => {

           const detailLine = [
             supplement.brand,
             supplement.dosage,
           ]
             .filter(Boolean)
             .join(" • ");

           return (

             <div
               key={`${supplement.id || supplement.name}-${index}`}
               className="rounded-2xl border border-[#DDD7CF] bg-[#FCFAF7] px-5 py-4">


               <div className="flex items-start justify-between gap-6">

                 {/* LEFT */}

                 <div className="min-w-0 flex-1">

                   {/* Desktop */}

                   <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">

                     <h4 className="font-semibold text-[#081620]">
                       {supplement.name}
                     </h4>

                     {detailLine ? (

                       <span className="text-sm text-[#5D686C]">
                         {detailLine}
                       </span>

                     ) : (

                       <span className="text-sm italic text-[#A89E91]">
                         Details not specified
                       </span>

                     )}

                   </div>

                   {/* Mobile */}

                   <div className="md:hidden">

                     <h4 className="font-semibold text-[#081620]">
                       {supplement.name}
                     </h4>

                     <p className="mt-1 text-sm text-[#5D686C]">
                       {detailLine || "Details not specified"}
                     </p>

                   </div>

                   {supplement.description && (

                     <p className="mt-2 text-sm leading-6 text-[#5D686C]">
                       {supplement.description}
                     </p>

                   )}

                   

                 </div>

                 {/* RIGHT */}

                 <div className="flex items-center gap-3 shrink-0">

                   {moveSupplement && (

                     <button
                       type="button"
                       onClick={() => moveSupplement(index)}
                       className={`rounded-full border border-[#DDD7CF] bg-white px-4 py-2 text-[11px] uppercase tracking-[0.08em] transition hover:bg-[#F8F2EA] ${
                         isMorning
                           ? "text-[#8C1D40]"
                           : "text-[#173E73]"
                       }`}>

                       Move to {isMorning ? "Evening" : "Morning"}
                     </button>

                   )}

                   {removeSupplement && (

                     <button
                       type="button"
                       onClick={() => removeSupplement(index)}
                       className="text-2xl leading-none text-[#B4A89A] transition hover:text-[#8C1D40]"
                       aria-label="Remove supplement">

                       ✕
                     </button>

                   )}

                 </div>

               </div>

             </div>

           );

         })

       ) : (

         <div className="rounded-2xl border border-dashed border-[#D6CCBF] bg-[#FCFAF7] px-5 py-6 text-sm leading-6 text-[#5D686C]">
           No supplements yet. Add an optional suggestion or move an item into
           this pouch.
         </div>

       )}

     </div>

   </div>
 );
}