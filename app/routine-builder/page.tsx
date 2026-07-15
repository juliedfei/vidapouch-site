"use client";

import { Suspense, useEffect } from "react";

import {
 useRouter,
 useSearchParams,
} from "next/navigation";

import StartScreen from
"@/components/routine-builder/StartScreen";

import GoalStep from
"@/components/routine-builder/GoalStep";

import PlanStep from
"@/components/routine-builder/PlanStep";

import CurrentRoutineStep from
"@/components/routine-builder/CurrentRoutineStep";

import ConciergeModal from
"@/components/routine-builder/ConciergeModal";

import {
 useRoutineBuilder,
} from "./useRoutineBuilder";


function RoutineBuilderPageContent() {
 const router = useRouter();

 const searchParams =
   useSearchParams();

 const {
   /*
    * Workflow
    */

   path,
   setPath,
   planBackPath,
   restoreRoutineBuilderDraft,

   /*
    * Concierge
    */

   showConcierge,
   setShowConcierge,

   /*
    * Brand and routine form
    */

   brand,
   customBrand,
   name,
   dosage,

   setBrand,
   setCustomBrand,
   setName,
   setDosage,

   supplements,
   addSupplement,
   removeSupplement,

   /*
    * Goal builder
    */

   selectedGoals,
   setSelectedGoals,

   selectedLifestyle,
   setSelectedLifestyle,

   selectedConsiderations,
   setSelectedConsiderations,

   /*
    * Plan results
    */

   morningSupplements,
   eveningSupplements,

   unrecognizedItems,
   suggestedAdditions,
   removedItems,

   /*
    * Plan-building actions
    */

   handleBuildDailyPlan,
   handleBuildGoalPlan,
   recheckReviewedItem,

   /*
    * Pouch editing
    */

   addSuggestedAddition,

   removeMorningSupplement,
   removeEveningSupplement,

   moveMorningSupplementToEvening,
   moveEveningSupplementToMorning,

   removeUnrecognizedItem,

   restoreRemovedItem,
   permanentlyRemoveItem,
 } = useRoutineBuilder();




useEffect(() => {
if (
  searchParams.get("step") !==
  "plan"
) {
  return;
}

restoreRoutineBuilderDraft();

/*
 * Remove the temporary step query
 * after restoring the builder.
 */
router.replace(
  "/routine-builder"
);
}, [
router,
searchParams,
restoreRoutineBuilderDraft,
]);

 function handlePlanContinue() {
  /*
   * Checkout reads this smaller object.
   */
  window.localStorage.setItem(
    "vidapouch_checkout_plan",
    JSON.stringify({
      morning:
        morningSupplements,
  
      evening:
        eveningSupplements,
    })
  );
  
  /*
   * The routine builder reads this
   * complete draft when the customer
   * returns from checkout.
   */
  window.localStorage.setItem(
    "vidapouch_routine_builder_draft",
    JSON.stringify({
      path: "plan",
  
      planBackPath,
  
      brand,
      customBrand,
      name,
      dosage,
  
      supplements,
  
      selectedGoals,
      selectedLifestyle,
      selectedConsiderations,
  
      morningSupplements,
      eveningSupplements,
  
      unrecognizedItems,
      suggestedAdditions,
      removedItems,
    })
  );
  
  router.push("/checkout");
  }
  
 if (path === "start") {
   return (
     <>
       <StartScreen
         setPath={setPath}
         openConcierge={() =>
           setShowConcierge(true)
         }
       />

       <ConciergeModal
         open={showConcierge}
         onClose={() =>
           setShowConcierge(false)
         }
       />
     </>
   );
 }

 return (
   <>
     <main className="min-h-screen bg-[#F3E9DD] px-4 py-6 text-[#0E171B] sm:px-8">
       {path === "current" && (
         <CurrentRoutineStep
           supplements={
             supplements
           }
           brand={brand}
           customBrand={
             customBrand
           }
           name={name}
           dosage={dosage}
           setBrand={setBrand}
           setCustomBrand={
             setCustomBrand
           }
           setName={setName}
           setDosage={setDosage}
           addSupplement={
             addSupplement
           }
           removeSupplement={
             removeSupplement
           }
           supplementCount={
             supplements.length
           }
           isBuildingPlan={false}
           buildError=""
           onBack={() =>
             setPath("start")
           }
           onBuild={
             handleBuildDailyPlan
           }
         />
       )}

       {path === "goal" && (
         <GoalStep
           setPath={setPath}
           selectedGoals={
             selectedGoals
           }
           setSelectedGoals={
             setSelectedGoals
           }
           selectedLifestyle={
             selectedLifestyle
           }
           setSelectedLifestyle={
             setSelectedLifestyle
           }
           selectedConsiderations={
             selectedConsiderations
           }
           setSelectedConsiderations={
             setSelectedConsiderations
           }
           handleBuildGoalPlan={
             handleBuildGoalPlan
           }
         />
       )}

       {path === "plan" && (
         <PlanStep
           setPath={setPath}
           backPath={planBackPath}
           morningSupplements={
             morningSupplements
           }
           eveningSupplements={
             eveningSupplements
           }
           unrecognizedItems={
             unrecognizedItems
           }
           suggestedAdditions={
             suggestedAdditions
           }
           removedItems={
             removedItems
           }
           removeMorningSupplement={
             removeMorningSupplement
           }
           removeEveningSupplement={
             removeEveningSupplement
           }
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
           onContinue={
             handlePlanContinue
           }
         />
       )}
     </main>

     <ConciergeModal
       open={showConcierge}
       onClose={() =>
         setShowConcierge(false)
       }
     />
   </>
 );
}

export default function RoutineBuilderPage() {
  return (
    <Suspense fallback={null}>
      <RoutineBuilderPageContent />
    </Suspense>
  );
 }

