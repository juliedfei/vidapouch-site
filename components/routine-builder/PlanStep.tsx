"use client";

import { useRouter } from "next/navigation";
import type {
 Path,
 Supplement,
 UnrecognizedItem,
 SuggestedAddition,
 PouchTiming,
} from "./types";

import PlanCard from "./PlanCard";
import ReviewNeededSection from "./ReviewNeededSection";
import SuggestedAdditionsSection from "./SuggestedAdditionsSection";
import RemovedItemsSection from "./RemovedItemsSection";

type RemovedPouchItem = {
 supplement: Supplement;
 originalTiming: PouchTiming;
};

type PlanStepProps = {
 setPath: (path: Path) => void;
 backPath: Path;
 morningSupplements: Supplement[];
 eveningSupplements: Supplement[];
 unrecognizedItems: UnrecognizedItem[];
 suggestedAdditions: SuggestedAddition[];
 removedItems: RemovedPouchItem[];
 removeMorningSupplement: (indexToRemove: number) => void;
 removeEveningSupplement: (indexToRemove: number) => void;
 moveMorningSupplementToEvening: (indexToMove: number) => void;
 moveEveningSupplementToMorning: (indexToMove: number) => void;
 removeUnrecognizedItem: (indexToRemove: number) => void;
 recheckReviewedItem: (
   indexToRecheck: number,
   updatedItem: UnrecognizedItem
 ) => void;
 addSuggestedAddition: (indexToAdd: number) => void;
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

export default function PlanStep({
 setPath,
 backPath,
 morningSupplements,
 eveningSupplements,
 unrecognizedItems,
 suggestedAdditions,
 removedItems,
 removeMorningSupplement,
 removeEveningSupplement,
 moveMorningSupplementToEvening,
 moveEveningSupplementToMorning,
 removeUnrecognizedItem,
 recheckReviewedItem,
 addSuggestedAddition,
 restoreRemovedItem,
 permanentlyRemoveItem,
}: PlanStepProps) {
 const router = useRouter();

 const allSelectedSupplements = [
   ...morningSupplements,
   ...eveningSupplements,
 ];

 const monthlyTotal = allSelectedSupplements.reduce(
   (total, supplement) => total + (supplement.monthlyPrice || 0),
   0
 );

 const itemCount = allSelectedSupplements.length;

 function handleCheckout() {
   window.localStorage.setItem(
     "vidapouch_checkout_plan",
     JSON.stringify({
       morning: morningSupplements,
       evening: eveningSupplements,
     })
   );

   router.push("/checkout");
 }

 return (
   <div className="mt-8 rounded-[26px] border border-[#DDD7CF] bg-[#F3E9DD]/70 p-5 sm:p-6">
     <button
       onClick={() => setPath(backPath)}
       className="mb-5 cursor-pointer text-[13px] uppercase tracking-[0.14em] text-[#8C1D40]">

       ← Back
     </button>

     <h2
       className="text-[34px] leading-tight tracking-[-0.035em]"
       style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

       Your personalized pouch is ready.
     </h2>

     <p className="mt-3 max-w-[640px] text-[15px] leading-7 text-[#475357]">
       Customize your morning and evening packets, adjust supplement timing,
       and review your estimated monthly plan before checkout.
     </p>

     <div className="mt-6 rounded-[24px] border border-[#DDD7CF] bg-[#081620] p-5 text-white">
       <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
         Estimated monthly plan
       </p>

       <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
         <div>
           <p
             className="text-[36px] leading-none tracking-[-0.04em]"
             style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

             {formatPrice(monthlyTotal)}
             <span className="ml-2 text-[15px] font-normal tracking-normal text-white/60">
               / month
             </span>
           </p>

           <p className="mt-2 text-sm text-white/65">
             {itemCount} selected item{itemCount === 1 ? "" : "s"} across your
             daily pouches.
           </p>
         </div>

         <button
           type="button"
           onClick={handleCheckout}
           className="cursor-pointer rounded-full bg-white px-6 py-4 text-[13px] uppercase tracking-[0.08em] text-[#081620]">

           Continue to Checkout
         </button>
       </div>
     </div>

     <div className="mt-7 grid gap-5 md:grid-cols-2">
       <PlanCard
         title="Morning pouch"
         label="Morning ☀️"
         supplements={morningSupplements}
         removeSupplement={removeMorningSupplement}
         moveSupplement={moveMorningSupplementToEvening}
       />

       <PlanCard
         title="Evening pouch"
         label="Evening 🌙"
         supplements={eveningSupplements}
         removeSupplement={removeEveningSupplement}
         moveSupplement={moveEveningSupplementToMorning}
       />
     </div>

     <SuggestedAdditionsSection
       suggestedAdditions={suggestedAdditions}
       addSuggestedAddition={addSuggestedAddition}
     />

     <RemovedItemsSection
       removedItems={removedItems}
       restoreRemovedItem={restoreRemovedItem}
       permanentlyRemoveItem={permanentlyRemoveItem}
     />

     <ReviewNeededSection
       unrecognizedItems={unrecognizedItems}
       removeUnrecognizedItem={removeUnrecognizedItem}
       recheckReviewedItem={recheckReviewedItem}
     />

     <div className="mt-7 rounded-[24px] border border-[#DDD7CF] bg-[#F8F2EA]/80 p-5">
       <h3
         className="text-[24px] tracking-[-0.03em]"
         style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

         Built to simplify your routine.
       </h3>

       <p className="mt-2 max-w-[700px] text-[15px] leading-7 text-[#475357]">
         Your selected supplements are organized into convenient daily packets
         and delivered monthly based on your personalized routine.
       </p>

       <div className="mt-5 grid gap-3 sm:grid-cols-3">
         <div className="rounded-2xl border border-[#DDD7CF] bg-white/50 px-4 py-4">
           <p className="text-[11px] uppercase tracking-[0.16em] text-[#8C1D40]">
             Flexible
           </p>

           <p className="mt-2 text-sm leading-6 text-[#475357]">
             Adjust your routine anytime as your wellness goals evolve.
           </p>
         </div>

         <div className="rounded-2xl border border-[#DDD7CF] bg-white/50 px-4 py-4">
           <p className="text-[11px] uppercase tracking-[0.16em] text-[#8C1D40]">
             Monthly delivery
           </p>

           <p className="mt-2 text-sm leading-6 text-[#475357]">
             Your packets arrive organized and ready to take throughout the day.
           </p>
         </div>

         <div className="rounded-2xl border border-[#DDD7CF] bg-white/50 px-4 py-4">
           <p className="text-[11px] uppercase tracking-[0.16em] text-[#8C1D40]">
             Subscription control
           </p>

           <p className="mt-2 text-sm leading-6 text-[#475357]">
             Pause, cancel, or update your subscription whenever needed.
           </p>
         </div>
       </div>
     </div>
   </div>
 );
}