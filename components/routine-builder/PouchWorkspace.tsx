"use client";

import type {
 Supplement,
 SuggestedAddition,
 UnrecognizedItem,
 PouchTiming,
} from "./types";

import PlanCard from "./PlanCard";
import SuggestedAdditionsSection from "./SuggestedAdditionsSection";
import RemovedItemsSection from "./RemovedItemsSection";
import ReviewNeededSection from "./ReviewNeededSection";

type RemovedPouchItem = {
 supplement: Supplement;
 originalTiming: PouchTiming;
};

type Props = {
 morningSupplements: Supplement[];
 eveningSupplements: Supplement[];

 suggestedAdditions: SuggestedAddition[];
 unrecognizedItems: UnrecognizedItem[];
 removedItems: RemovedPouchItem[];

 removeMorningSupplement: (index: number) => void;
 removeEveningSupplement: (index: number) => void;

 moveMorningSupplementToEvening: (index: number) => void;
 moveEveningSupplementToMorning: (index: number) => void;

 removeUnrecognizedItem: (index: number) => void;

 recheckReviewedItem: (
   index: number,
   updatedItem: UnrecognizedItem
 ) => void;

 addSuggestedAddition: (index: number) => void;

 restoreRemovedItem: (index: number) => void;
 permanentlyRemoveItem: (index: number) => void;

 onContinue: () => void;
};

export default function PouchWorkspace({
 morningSupplements,
 eveningSupplements,

 suggestedAdditions,
 unrecognizedItems,
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

 onContinue,
}: Props) {
 return (
   <>
     <div className="mt-5 grid gap-6 lg:grid-cols-2">
       <PlanCard
         title="Morning Pouch"
         label="Morning ☀️"
         supplements={morningSupplements}
         removeSupplement={removeMorningSupplement}
         moveSupplement={moveMorningSupplementToEvening}
       />

       <PlanCard
         title="Evening Pouch"
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

     <div className="mt-8 flex justify-end">
       <button
         type="button"
         onClick={onContinue}
         className="rounded-full bg-[#081620] px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#17262C]">

         Review Order →
       </button>
     </div>
   </>
 );
}
