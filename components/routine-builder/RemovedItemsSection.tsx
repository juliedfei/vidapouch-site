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

export default function RemovedItemsSection({
 removedItems,
 restoreRemovedItem,
 permanentlyRemoveItem,
}: RemovedItemsSectionProps) {
 if (removedItems.length === 0) return null;

 const morningItems = removedItems.filter(
   (item) => item.originalTiming === "morning"
 );

 const eveningItems = removedItems.filter(
   (item) => item.originalTiming === "evening"
 );

 function renderSection(
   title: string,
   accentColor: string,
   items: RemovedPouchItem[]
 ) {
   if (items.length === 0) return null;

   return (
     <div className="mt-6">

       <div className="mb-3 flex items-center gap-3">

         <div className={`h-2 w-2 rounded-full ${accentColor}`} />

         <h4
           className="text-[18px] tracking-[-0.02em] text-[#081620]"
           style={{
             fontFamily: 'Georgia, "Times New Roman", serif',
           }}>

           {title}
         </h4>

       </div>

       <div className="grid gap-3">

         {items.map((item) => {
           const originalIndex = removedItems.indexOf(item);

           return (
             <div
               key={`${item.supplement.name}-${originalIndex}`}
               className="rounded-2xl border border-[#DDD7CF] bg-[#F8F2EA] px-4 py-4">


               <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                 <div>

                   <p className="text-[18px] font-medium text-[#081620]">
                     {item.supplement.name}
                   </p>

                   <p className="mt-1 text-sm text-[#5D686C]">
                     {item.supplement.dosage || "Dosage not specified"}
                   </p>

                 </div>

                 <div className="flex flex-col gap-2 sm:items-end">

                   <button
                     type="button"
                     onClick={() => restoreRemovedItem(originalIndex)}
                     className="cursor-pointer rounded-full bg-[#081620] px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-white transition hover:bg-[#17262C]">

                     Add back
                   </button>

                   <button
                     type="button"
                     onClick={() => permanentlyRemoveItem(originalIndex)}
                     className="cursor-pointer text-[12px] uppercase tracking-[0.08em] text-[#8C1D40] transition hover:underline">

                     Dismiss
                   </button>

                 </div>

               </div>

             </div>
           );
         })}

       </div>

     </div>
   );
 }

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
       These supplements were removed from your personalized routine. Restore
       any of them before checkout if you'd like them included.
     </p>

     {renderSection(
       "Removed from Morning ☀️",
       "bg-[#8C1D40]",
       morningItems
     )}

     {renderSection(
       "Removed from Evening 🌙",
       "bg-[#173E73]",
       eveningItems
     )}

   </div>
 );
}
