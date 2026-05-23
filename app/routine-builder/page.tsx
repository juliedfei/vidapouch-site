"use client";

import { useState } from "react";

import type {
 Path,
 Supplement,
 UnrecognizedItem,
 BuildPlanResponse,
 SuggestedAddition,
 PouchTiming,
} from "@/components/routine-builder/types";
import StartStep from "@/components/routine-builder/StartStep";
import GoalStep from "@/components/routine-builder/GoalStep";
import PlanStep from "@/components/routine-builder/PlanStep";
import AddSupplementRow from "@/components/routine-builder/AddSupplementRow";
import RoutineTable from "@/components/routine-builder/RoutineTable";

type RemovedPouchItem = {
 supplement: Supplement;
 originalTiming: PouchTiming;
};

export default function RoutineBuilderPage() {
 const [path, setPath] = useState<Path>("start");
 const [planBackPath, setPlanBackPath] = useState<Path>("current");

 const [name, setName] = useState("");
 const [dosage, setDosage] = useState("");
 const [supplements, setSupplements] = useState<Supplement[]>([]);

 const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

 const [morningSupplements, setMorningSupplements] = useState<Supplement[]>([]);
 const [eveningSupplements, setEveningSupplements] = useState<Supplement[]>([]);
 const [unrecognizedItems, setUnrecognizedItems] = useState<UnrecognizedItem[]>([]);
 const [suggestedAdditions, setSuggestedAdditions] = useState<SuggestedAddition[]>([]);
 const [removedItems, setRemovedItems] = useState<RemovedPouchItem[]>([]);

 async function handleBuildDailyPlan() {
   setMorningSupplements([]);
   setEveningSupplements([]);
   setUnrecognizedItems([]);
   setSuggestedAdditions([]);
   setRemovedItems([]);

   const response = await fetch("/api/build-plan", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ supplements }),
   });

   const data: BuildPlanResponse = await response.json();

   setMorningSupplements(data.morning || []);
   setEveningSupplements(data.evening || []);
   setUnrecognizedItems(data.unrecognized || []);
   setSuggestedAdditions(data.suggestedAdditions || []);
   setPlanBackPath("current");
   setPath("plan");
 }

 async function handleBuildGoalPlan() {
   if (selectedGoals.length === 0) return;

   setMorningSupplements([]);
   setEveningSupplements([]);
   setUnrecognizedItems([]);
   setSuggestedAdditions([]);
   setRemovedItems([]);

   const response = await fetch("/api/build-plan", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ goals: selectedGoals }),
   });

   const data: BuildPlanResponse = await response.json();

   setMorningSupplements(data.morning || []);
   setEveningSupplements(data.evening || []);
   setUnrecognizedItems(data.unrecognized || []);
   setSuggestedAdditions(data.suggestedAdditions || []);
   setPlanBackPath("goal");
   setPath("plan");
 }

 async function recheckReviewedItem(
   indexToRecheck: number,
   updatedItem: UnrecognizedItem
 ) {
   const cleanSupplement: Supplement = {
     name: updatedItem.name.trim(),
     dosage: updatedItem.dosage?.trim() || "",
   };

   const response = await fetch("/api/build-plan", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ supplements: [cleanSupplement] }),
   });

   const data: BuildPlanResponse = await response.json();

   if (data.morning?.length) {
     setMorningSupplements((current) => [...current, ...data.morning]);
     setUnrecognizedItems((current) =>
       current.filter((_, i) => i !== indexToRecheck)
     );
     return;
   }

   if (data.evening?.length) {
     setEveningSupplements((current) => [...current, ...data.evening]);
     setUnrecognizedItems((current) =>
       current.filter((_, i) => i !== indexToRecheck)
     );
     return;
   }

   setUnrecognizedItems((current) =>
     current.map((item, index) =>
       index === indexToRecheck
         ? data.unrecognized?.[0] || {
             ...cleanSupplement,
             reason: "needs_confirmation",
             note: "This still needs review before it can be added to a pouch.",
           }
         : item
     )
   );
 }

 function addSuggestedAddition(indexToAdd: number) {
   const addition = suggestedAdditions[indexToAdd];
   if (!addition) return;

   const cleanSupplement: Supplement = {
     id: addition.id,
     name: addition.name,
     dosage: addition.dosage || "",
     monthlyPrice: addition.monthlyPrice,
     description: addition.description,
     category: addition.category,
   };

   if (addition.suggestedTiming === "evening") {
     setEveningSupplements((current) => [...current, cleanSupplement]);
   } else {
     setMorningSupplements((current) => [...current, cleanSupplement]);
   }

   setSuggestedAdditions((current) =>
     current.filter((_, index) => index !== indexToAdd)
   );
 }

 function removeMorningSupplement(indexToRemove: number) {
   const itemToRemove = morningSupplements[indexToRemove];
   if (!itemToRemove) return;

   setMorningSupplements((current) =>
     current.filter((_, index) => index !== indexToRemove)
   );

   setRemovedItems((current) => [
     ...current,
     { supplement: itemToRemove, originalTiming: "morning" },
   ]);
 }

 function removeEveningSupplement(indexToRemove: number) {
   const itemToRemove = eveningSupplements[indexToRemove];
   if (!itemToRemove) return;

   setEveningSupplements((current) =>
     current.filter((_, index) => index !== indexToRemove)
   );

   setRemovedItems((current) => [
     ...current,
     { supplement: itemToRemove, originalTiming: "evening" },
   ]);
 }

 function restoreRemovedItem(indexToRestore: number) {
   const removedItem = removedItems[indexToRestore];
   if (!removedItem) return;

   if (removedItem.originalTiming === "evening") {
     setEveningSupplements((current) => [...current, removedItem.supplement]);
   } else {
     setMorningSupplements((current) => [...current, removedItem.supplement]);
   }

   setRemovedItems((current) =>
     current.filter((_, index) => index !== indexToRestore)
   );
 }

 function permanentlyRemoveItem(indexToRemove: number) {
   setRemovedItems((current) =>
     current.filter((_, index) => index !== indexToRemove)
   );
 }

 function moveMorningSupplementToEvening(indexToMove: number) {
   const supplementToMove = morningSupplements[indexToMove];
   if (!supplementToMove) return;

   setMorningSupplements((current) =>
     current.filter((_, index) => index !== indexToMove)
   );

   setEveningSupplements((current) => [...current, supplementToMove]);
 }

 function moveEveningSupplementToMorning(indexToMove: number) {
   const supplementToMove = eveningSupplements[indexToMove];
   if (!supplementToMove) return;

   setEveningSupplements((current) =>
     current.filter((_, index) => index !== indexToMove)
   );

   setMorningSupplements((current) => [...current, supplementToMove]);
 }

 function addSupplement() {
   if (!name.trim()) return;

   setSupplements([
     ...supplements,
     {
       name: name.trim(),
       dosage: dosage.trim(),
     },
   ]);

   setName("");
   setDosage("");
 }

 function removeSupplement(indexToRemove: number) {
   setSupplements(supplements.filter((_, i) => i !== indexToRemove));
 }

 function removeUnrecognizedItem(indexToRemove: number) {
   setUnrecognizedItems((current) =>
     current.filter((_, i) => i !== indexToRemove)
   );
 }

 return (
   <main className="min-h-screen bg-[#F3E9DD] px-4 py-8 text-[#0E171B] sm:px-8 sm:py-10">
     <section className="mx-auto max-w-[980px] rounded-[28px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-5 py-8 shadow-[0_24px_70px_rgba(20,15,10,0.08)] sm:rounded-[34px] sm:px-10 sm:py-10">
       <p className="text-[10px] uppercase tracking-[0.24em] text-[#8C1D40] sm:text-[11px]">
         VITAMIN ROUTINE BUILDER
       </p>

       <h1
         className="mt-4 text-[38px] leading-[1.02] tracking-[-0.04em] text-[#081620] sm:text-[58px]"
         style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

         Build your daily supplement routine.
       </h1>

       <p className="mt-5 max-w-[640px] text-[16px] leading-8 text-[#475357] sm:text-[17px]">
         Tell us what you already take — or what you’re hoping to improve —
         and we’ll help turn it into a simple morning and evening plan.
       </p>

       {path === "start" && <StartStep setPath={setPath} />}

       {path === "current" && (
         <div className="mt-8 rounded-[26px] border border-[#DDD7CF] bg-[#F3E9DD]/70 p-5 sm:p-6">
           <button
             onClick={() => setPath("start")}
             className="mb-5 cursor-pointer text-[13px] uppercase tracking-[0.14em] text-[#8C1D40]">

             ← Back
           </button>

           <h2
             className="text-[28px] tracking-[-0.03em]"
             style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

             What are you currently taking?
           </h2>

           <p className="mt-3 text-[15px] leading-7 text-[#475357]">
             Add each supplement in your current routine. VitaPouch will match
             it to the closest VitaPouch option.
           </p>

           <div className="mt-6 rounded-[24px] border border-[#DDD7CF] bg-white/45 p-4 sm:p-5">
             <h3
               className="text-[24px] tracking-[-0.03em]"
               style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

               Your current routine
             </h3>

             {supplements.length === 0 && (
               <div className="mt-4 rounded-[18px] border border-dashed border-[#CFC4B7] bg-[#F8F2EA]/70 px-5 py-6 text-[#5D686C]">
                 Your routine is empty. Add your first supplement below.
               </div>
             )}

             {supplements.length > 0 && (
               <RoutineTable
                 supplements={supplements}
                 removeSupplement={removeSupplement}
               />
             )}

             <AddSupplementRow
               name={name}
               dosage={dosage}
               setName={setName}
               setDosage={setDosage}
               addSupplement={addSupplement}
             />

             {supplements.length > 0 && (
               <button
                 onClick={handleBuildDailyPlan}
                 className="mt-6 w-full cursor-pointer rounded-full bg-[#081620] px-6 py-4 text-[13px] uppercase tracking-[0.08em] text-white">

                 Build My Daily Plan
               </button>
             )}
           </div>
         </div>
       )}

       {path === "plan" && (
         <PlanStep
           setPath={setPath}
           backPath={planBackPath}
           morningSupplements={morningSupplements}
           eveningSupplements={eveningSupplements}
           unrecognizedItems={unrecognizedItems}
           suggestedAdditions={suggestedAdditions}
           removedItems={removedItems}
           removeMorningSupplement={removeMorningSupplement}
           removeEveningSupplement={removeEveningSupplement}
           moveMorningSupplementToEvening={moveMorningSupplementToEvening}
           moveEveningSupplementToMorning={moveEveningSupplementToMorning}
           removeUnrecognizedItem={removeUnrecognizedItem}
           recheckReviewedItem={recheckReviewedItem}
           addSuggestedAddition={addSuggestedAddition}
           restoreRemovedItem={restoreRemovedItem}
           permanentlyRemoveItem={permanentlyRemoveItem}
         />
       )}

       {path === "goal" && (
         <GoalStep
           setPath={setPath}
           selectedGoals={selectedGoals}
           setSelectedGoals={setSelectedGoals}
           handleBuildGoalPlan={handleBuildGoalPlan}
         />
       )}
     </section>
   </main>
 );
}