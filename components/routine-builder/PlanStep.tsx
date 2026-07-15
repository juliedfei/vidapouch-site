"use client";

import type {
 Path,
 Supplement,
 UnrecognizedItem,
 SuggestedAddition,
 PouchTiming,
} from "./types";

import PlanHeader from "./PlanHeader";
import PouchWorkspace from "./PouchWorkspace";

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

 removeMorningSupplement: (index: number) => void;
 removeEveningSupplement: (index: number) => void;

 moveMorningSupplementToEvening: (
   index: number
 ) => void;

 moveEveningSupplementToMorning: (
   index: number
 ) => void;

 removeUnrecognizedItem: (
   index: number
 ) => void;

 recheckReviewedItem: (
   index: number,
   updatedItem: UnrecognizedItem
 ) => void;

 addSuggestedAddition: (
   index: number
 ) => void;

 restoreRemovedItem: (
   index: number
 ) => void;

 permanentlyRemoveItem: (
   index: number
 ) => void;

 onContinue: () => void;
};

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

 onContinue,
}: PlanStepProps) {

 return (
   <>
     <PlanHeader
       onBack={() => setPath(backPath)}
     />

     <PouchWorkspace
       morningSupplements={morningSupplements}
       eveningSupplements={eveningSupplements}

       suggestedAdditions={suggestedAdditions}
       unrecognizedItems={unrecognizedItems}
       removedItems={removedItems}

       removeMorningSupplement={removeMorningSupplement}
       removeEveningSupplement={removeEveningSupplement}

       moveMorningSupplementToEvening={
         moveMorningSupplementToEvening
       }

       moveEveningSupplementToMorning={
         moveEveningSupplementToMorning
       }

       removeUnrecognizedItem={
         removeUnrecognizedItem
       }

       recheckReviewedItem={
         recheckReviewedItem
       }

       addSuggestedAddition={
         addSuggestedAddition
       }

       restoreRemovedItem={
         restoreRemovedItem
       }

       permanentlyRemoveItem={
         permanentlyRemoveItem
       }

       onContinue={onContinue}
     />
   </>
 );
}