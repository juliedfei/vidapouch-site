"use client";

import type {
 RemovedCheckoutSupplement,
} from "@/lib/checkout/checkoutTypes";

type Props = {
 removedSupplements:
   RemovedCheckoutSupplement[];

 onRestore: (index: number) => void;
};

function formatPrice(value: number) {
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

export default function RemovedSupplements({
 removedSupplements,
 onRestore,
}: Props) {
 if (
   removedSupplements.length === 0
 ) {
   return null;
 }

 return (
   <section className="rounded-[24px] border border-[#DDD7CF] bg-white/70 p-6">
     <div>
       <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C1D40]">
         Changed your mind?
       </p>

       <h2
         className="mt-2 text-[24px] tracking-[-0.03em] text-[#081620]"
         style={{
           fontFamily:
             'Georgia, "Times New Roman", serif',
         }}>

         Removed supplements
       </h2>

       <p className="mt-2 text-sm leading-6 text-[#5D686C]">
         Restore an item without returning
         to the routine builder.
       </p>
     </div>

     <div className="mt-5 space-y-3">
       {removedSupplements.map(
         (removedItem, index) => (
           <div
             key={`${removedItem.supplement.id}-${removedItem.removedAt}`}
             className="flex items-center justify-between gap-5 rounded-2xl border border-[#DDD7CF] bg-[#FCFAF7] px-5 py-4">

             <div>
               <p className="font-semibold text-[#081620]">
                 {
                   removedItem.supplement
                     .name
                 }
               </p>

               <p className="mt-1 text-sm text-[#5D686C]">
                 {
                   removedItem.supplement
                     .selectedBrand
                 }{" "}
                 ·{" "}
                 {formatPrice(
                   removedItem.supplement
                     .customerMonthlyPrice
                 )}
                 /month
               </p>
             </div>

             <button
               type="button"
               onClick={() =>
                 onRestore(index)
               }
               className="shrink-0 rounded-full border border-[#8C1D40] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#8C1D40] transition hover:bg-[#8C1D40] hover:text-white">

               Restore
             </button>
           </div>
         )
       )}
     </div>
   </section>
 );
}