import type { PouchTiming, Supplement } from "./types";

type RemovedPouchItem = {
 supplement: Supplement;
 originalTiming: PouchTiming;
};

type RemovedItemsSectionProps = {
 removedItems: RemovedPouchItem[];
 restoreRemovedItem: (indexToRestore: number) => void;
 permanentlyRemoveItem: (indexToRemove: number) => void;
};

function formatPrice(value: number) {
 return new Intl.NumberFormat("en-US", {
   style: "currency",
   currency: "USD",
   maximumFractionDigits: 0,
 }).format(value);
}

export default function RemovedItemsSection({
 removedItems,
 restoreRemovedItem,
 permanentlyRemoveItem,
}: RemovedItemsSectionProps) {
 if (removedItems.length === 0) return null;

 return (
   <div className="mt-7 rounded-[24px] border border-[#DDD7CF] bg-white/45 p-5">
     <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C1D40]">
       Removed items
     </p>

     <h3
       className="mt-2 text-[24px] tracking-[-0.03em]"
       style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

       Changed your mind?
     </h3>

     <p className="mt-2 max-w-[620px] text-[15px] leading-7 text-[#475357]">
       These items were removed from your pouch. Add them back anytime before
       checkout.
     </p>

     <div className="mt-4 grid gap-3">
       {removedItems.map((item, index) => (
         <div
           key={`${item.supplement.name}-${index}`}
           className="rounded-2xl border border-[#DDD7CF] bg-[#F8F2EA] px-4 py-4">

           <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
             <div>
               <p className="text-[11px] uppercase tracking-[0.14em] text-[#8C1D40]">
                 Removed from {item.originalTiming}
               </p>

               <p className="mt-1 text-[18px] font-medium text-[#081620]">
                 {item.supplement.name}
               </p>

               <p className="mt-1 text-sm text-[#5D686C]">
                 {item.supplement.dosage || "Dosage not added"}
                 {item.supplement.monthlyPrice
                   ? ` · ${formatPrice(item.supplement.monthlyPrice)} / month`
                   : ""}
               </p>
             </div>

             <div className="flex flex-col gap-2 sm:items-end">
               <button
                 onClick={() => restoreRemovedItem(index)}
                 className="cursor-pointer rounded-full bg-[#081620] px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-white">

                 Add back
               </button>

               <button
                 onClick={() => permanentlyRemoveItem(index)}
                 className="cursor-pointer text-[12px] uppercase tracking-[0.08em] text-[#8C1D40]">

                 Dismiss
               </button>
             </div>
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}
