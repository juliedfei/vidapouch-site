"use client";

import {
  useCallback,
  useState,
 } from "react";
 




import type {
 Supplement,
 SuggestedAddition,
 UnrecognizedItem,
 BuildPlanResponse,
 PouchTiming,
 Path,
} from "@/components/routine-builder/types";

type RemovedPouchItem = {
 supplement: Supplement;
 originalTiming: PouchTiming;
};


type RoutineBuilderDraft = {
  path?: Path;
  planBackPath?: Path;
  
  brand?: string;
  customBrand?: string;
  name?: string;
  dosage?: string;
  
  supplements?: Supplement[];
  
  selectedGoals?: string[];
  selectedLifestyle?: string[];
  selectedConsiderations?: string[];
  
  morningSupplements?: Supplement[];
  eveningSupplements?: Supplement[];
  
  unrecognizedItems?: UnrecognizedItem[];
  suggestedAdditions?: SuggestedAddition[];
  removedItems?: RemovedPouchItem[];
  };
  






const VIDAPOUCH_CHOOSES_BRAND =
 "VidaPouch chooses (Recommended)";

export function useRoutineBuilder() {
 /*
  * Workflow
  */

 const [path, setPath] =
   useState<Path>("start");

 const [planBackPath, setPlanBackPath] =
   useState<Path>("current");

 /*
  * Concierge
  */

 const [showConcierge, setShowConcierge] =
   useState(false);

 /*
  * Current Routine
  */

 const [brand, setBrand] =
   useState("");

 const [customBrand, setCustomBrand] =
   useState("");

 const [name, setName] =
   useState("");

 const [dosage, setDosage] =
   useState("");

 const [supplements, setSupplements] =
   useState<Supplement[]>([]);

 /*
  * Goal Builder
  */

 const [
   selectedGoals,
   setSelectedGoals,
 ] = useState<string[]>([]);

 const [
   selectedLifestyle,
   setSelectedLifestyle,
 ] = useState<string[]>([]);

 const [
   selectedConsiderations,
   setSelectedConsiderations,
 ] = useState<string[]>([]);

 /*
  * Plan
  */

 const [
   morningSupplements,
   setMorningSupplements,
 ] = useState<Supplement[]>([]);

 const [
   eveningSupplements,
   setEveningSupplements,
 ] = useState<Supplement[]>([]);

 const [
   unrecognizedItems,
   setUnrecognizedItems,
 ] = useState<UnrecognizedItem[]>([]);

 const [
   suggestedAdditions,
   setSuggestedAdditions,
 ] = useState<SuggestedAddition[]>([]);

 const [
   removedItems,
   setRemovedItems,
 ] = useState<RemovedPouchItem[]>([]);



 const restoreRoutineBuilderDraft =
 useCallback(() => {
   const savedDraft =
     window.localStorage.getItem(
       "vidapouch_routine_builder_draft"
     );
 
   if (!savedDraft) {
     /*
      * Older saved sessions may only
      * have the checkout pouch plan.
      */
     const savedCheckoutPlan =
       window.localStorage.getItem(
         "vidapouch_checkout_plan"
       );
 
     if (savedCheckoutPlan) {
       try {
         const parsedCheckoutPlan =
           JSON.parse(
             savedCheckoutPlan
           ) as {
             morning?: unknown;
             evening?: unknown;
           };
 
         setMorningSupplements(
           Array.isArray(
             parsedCheckoutPlan.morning
           )
             ? (
                 parsedCheckoutPlan.morning as Supplement[]
               )
             : []
         );
 
         setEveningSupplements(
           Array.isArray(
             parsedCheckoutPlan.evening
           )
             ? (
                 parsedCheckoutPlan.evening as Supplement[]
               )
             : []
         );
       } catch (error) {
         console.error(
           "Unable to restore checkout plan:",
           error
         );
       }
     }
 
     setPath("plan");
     return;
   }
 
   try {
     const draft =
       JSON.parse(
         savedDraft
       ) as RoutineBuilderDraft;
 
     setBrand(
       typeof draft.brand === "string"
         ? draft.brand
         : ""
     );
 
     setCustomBrand(
       typeof draft.customBrand === "string"
         ? draft.customBrand
         : ""
     );
 
     setName(
       typeof draft.name === "string"
         ? draft.name
         : ""
     );
 
     setDosage(
       typeof draft.dosage === "string"
         ? draft.dosage
         : ""
     );
 
     setSupplements(
       Array.isArray(
         draft.supplements
       )
         ? draft.supplements
         : []
     );
 
     setSelectedGoals(
       Array.isArray(
         draft.selectedGoals
       )
         ? draft.selectedGoals
         : []
     );
 
     setSelectedLifestyle(
       Array.isArray(
         draft.selectedLifestyle
       )
         ? draft.selectedLifestyle
         : []
     );
 
     setSelectedConsiderations(
       Array.isArray(
         draft.selectedConsiderations
       )
         ? draft.selectedConsiderations
         : []
     );
 
     setMorningSupplements(
       Array.isArray(
         draft.morningSupplements
       )
         ? draft.morningSupplements
         : []
     );
 
     setEveningSupplements(
       Array.isArray(
         draft.eveningSupplements
       )
         ? draft.eveningSupplements
         : []
     );
 
     setUnrecognizedItems(
       Array.isArray(
         draft.unrecognizedItems
       )
         ? draft.unrecognizedItems
         : []
     );
 
     setSuggestedAdditions(
       Array.isArray(
         draft.suggestedAdditions
       )
         ? draft.suggestedAdditions
         : []
     );
 
     setRemovedItems(
       Array.isArray(
         draft.removedItems
       )
         ? draft.removedItems
         : []
     );
 
     const restoredBackPath =
       draft.planBackPath === "goal"
         ? "goal"
         : "current";
 
     setPlanBackPath(
       restoredBackPath
     );
 
     /*
      * Returning from checkout should
      * always reopen the pouch page.
      */
     setPath("plan");
   } catch (error) {
     console.error(
       "Unable to restore routine builder draft:",
       error
     );
 
     setPath("plan");
   }
 }, []);






 /*
  * Current Routine Actions
  */


 const restoreCheckoutPlan =
 useCallback(() => {
   const savedPlan =
     window.localStorage.getItem(
       "vidapouch_checkout_plan"
     );

   if (!savedPlan) {
     setPath("plan");
     return;
   }

   try {
     const parsedPlan =
       JSON.parse(savedPlan) as {
         morning?: unknown;
         evening?: unknown;
       };

     setMorningSupplements(
       Array.isArray(
         parsedPlan.morning
       )
         ? (
             parsedPlan.morning as Supplement[]
           )
         : []
     );

     setEveningSupplements(
       Array.isArray(
         parsedPlan.evening
       )
         ? (
             parsedPlan.evening as Supplement[]
           )
         : []
     );

     setUnrecognizedItems([]);
     setSuggestedAdditions([]);
     setRemovedItems([]);
     setPath("plan");
   } catch (error) {
     console.error(
       "Unable to restore pouch plan:",
       error
     );

     setMorningSupplements([]);
     setEveningSupplements([]);
     setPath("plan");
   }
 }, []);










 function addSupplement() {
   if (!name.trim()) return;

   const vidapouchChoosesBrand =
     brand === VIDAPOUCH_CHOOSES_BRAND;

   const resolvedBrand =
     brand === "Other"
       ? customBrand.trim()
       : vidapouchChoosesBrand
         ? ""
         : brand.trim();

   const hasValidBrandSelection =
     vidapouchChoosesBrand ||
     resolvedBrand.length > 0;

   if (!hasValidBrandSelection) {
     return;
   }

   setSupplements((current) => [
     ...current,
     {
       name: name.trim(),
       dosage:
         dosage.trim() || "1 capsule",

       brand: vidapouchChoosesBrand
         ? undefined
         : resolvedBrand,

       customBrand:
         brand === "Other"
           ? customBrand.trim()
           : undefined,

       vidapouchChoosesBrand,
     },
   ]);

   setBrand("");
   setCustomBrand("");
   setName("");
   setDosage("");
 }

 function removeSupplement(
   index: number
 ) {
   setSupplements((current) =>
     current.filter(
       (_, itemIndex) =>
         itemIndex !== index
     )
   );
 }

 /*
  * Build Plan
  */

 async function handleBuildDailyPlan() {
   setMorningSupplements([]);
   setEveningSupplements([]);
   setUnrecognizedItems([]);
   setSuggestedAdditions([]);
   setRemovedItems([]);

   const response = await fetch(
     "/api/build-plan",
     {
       method: "POST",
       headers: {
         "Content-Type":
           "application/json",
       },
       body: JSON.stringify({
         supplements,
       }),
     }
   );

   const data: BuildPlanResponse =
     await response.json();

   setMorningSupplements(
     data.morning || []
   );

   setEveningSupplements(
     data.evening || []
   );

   setUnrecognizedItems(
     data.unrecognized || []
   );

   setSuggestedAdditions(
     data.suggestedAdditions || []
   );

   setPlanBackPath("current");
   setPath("plan");
 }

 async function handleBuildGoalPlan() {
   if (selectedGoals.length === 0) {
     return;
   }

   setMorningSupplements([]);
   setEveningSupplements([]);
   setUnrecognizedItems([]);
   setSuggestedAdditions([]);
   setRemovedItems([]);

   const response = await fetch(
     "/api/build-plan",
     {
       method: "POST",
       headers: {
         "Content-Type":
           "application/json",
       },
       body: JSON.stringify({
         goals: selectedGoals,
         lifestyle:
           selectedLifestyle,
         considerations:
           selectedConsiderations,
       }),
     }
   );

   const data: BuildPlanResponse =
     await response.json();

   setMorningSupplements(
     data.morning || []
   );

   setEveningSupplements(
     data.evening || []
   );

   setUnrecognizedItems(
     data.unrecognized || []
   );

   setSuggestedAdditions(
     data.suggestedAdditions || []
   );

   setPlanBackPath("goal");
   setPath("plan");
 }

 async function recheckReviewedItem(
   indexToRecheck: number,
   updatedItem: UnrecognizedItem
 ) {
   const cleanSupplement: Supplement = {
     name: updatedItem.name.trim(),

     dosage:
       updatedItem.dosage?.trim() ||
       "1 capsule",

     brand: updatedItem.brand,

     customBrand:
       updatedItem.customBrand,

     vidapouchChoosesBrand:
       updatedItem.vidapouchChoosesBrand,
   };

   const response = await fetch(
     "/api/build-plan",
     {
       method: "POST",
       headers: {
         "Content-Type":
           "application/json",
       },
       body: JSON.stringify({
         supplements: [
           cleanSupplement,
         ],
       }),
     }
   );

   const data: BuildPlanResponse =
     await response.json();

   if (data.morning?.length) {
     setMorningSupplements(
       (current) => [
         ...current,
         ...data.morning,
       ]
     );

     setUnrecognizedItems(
       (current) =>
         current.filter(
           (_, index) =>
             index !== indexToRecheck
         )
     );

     return;
   }

   if (data.evening?.length) {
     setEveningSupplements(
       (current) => [
         ...current,
         ...data.evening,
       ]
     );

     setUnrecognizedItems(
       (current) =>
         current.filter(
           (_, index) =>
             index !== indexToRecheck
         )
     );

     return;
   }

   setUnrecognizedItems(
     (current) =>
       current.map((item, index) =>
         index === indexToRecheck
           ? data.unrecognized?.[0] || {
               ...cleanSupplement,
               reason:
                 "needs_confirmation",
               note:
                 "This still needs review before it can be added to a pouch.",
             }
           : item
       )
   );
 }

 /*
  * Pouch Editing
  */

 function addSuggestedAddition(
   index: number
 ) {
   const addition =
     suggestedAdditions[index];

   if (!addition) return;

   const hasSelectedBrand =
     Boolean(addition.brand?.trim());

   const supplement: Supplement = {
     id: addition.id,
     name: addition.name,

     dosage:
       addition.dosage ||
       "1 capsule",

     brand: hasSelectedBrand
       ? addition.brand
       : undefined,

     customBrand:
       addition.customBrand,

     vidapouchChoosesBrand:
       !hasSelectedBrand,

     description:
       addition.description,

     category:
       addition.category,
   };

   if (
     addition.suggestedTiming ===
     "evening"
   ) {
     setEveningSupplements(
       (current) => [
         ...current,
         supplement,
       ]
     );
   } else {
     setMorningSupplements(
       (current) => [
         ...current,
         supplement,
       ]
     );
   }

   setSuggestedAdditions(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !== index
       )
   );
 }

 function removeMorningSupplement(
   index: number
 ) {
   const item =
     morningSupplements[index];

   if (!item) return;

   setMorningSupplements(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !== index
       )
   );

   setRemovedItems((current) => [
     ...current,
     {
       supplement: item,
       originalTiming: "morning",
     },
   ]);
 }

 function removeEveningSupplement(
   index: number
 ) {
   const item =
     eveningSupplements[index];

   if (!item) return;

   setEveningSupplements(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !== index
       )
   );

   setRemovedItems((current) => [
     ...current,
     {
       supplement: item,
       originalTiming: "evening",
     },
   ]);
 }

 function restoreRemovedItem(
   index: number
 ) {
   const item =
     removedItems[index];

   if (!item) return;

   if (
     item.originalTiming ===
     "morning"
   ) {
     setMorningSupplements(
       (current) => [
         ...current,
         item.supplement,
       ]
     );
   } else {
     setEveningSupplements(
       (current) => [
         ...current,
         item.supplement,
       ]
     );
   }

   setRemovedItems(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !== index
       )
   );
 }

 function permanentlyRemoveItem(
   index: number
 ) {
   setRemovedItems(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !== index
       )
   );
 }

 function moveMorningSupplementToEvening(
   index: number
 ) {
   const item =
     morningSupplements[index];

   if (!item) return;

   setMorningSupplements(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !== index
       )
   );

   setEveningSupplements(
     (current) => [
       ...current,
       item,
     ]
   );
 }

 function moveEveningSupplementToMorning(
   index: number
 ) {
   const item =
     eveningSupplements[index];

   if (!item) return;

   setEveningSupplements(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !== index
       )
   );

   setMorningSupplements(
     (current) => [
       ...current,
       item,
     ]
   );
 }

 function removeUnrecognizedItem(
   index: number
 ) {
   setUnrecognizedItems(
     (current) =>
       current.filter(
         (_, itemIndex) =>
           itemIndex !== index
       )
   );
 }

 return {
   /*
    * Workflow
    */

   path,
   setPath,

   planBackPath,
   setPlanBackPath,

   restoreRoutineBuilderDraft,




   /*
    * Concierge
    */

   showConcierge,
   setShowConcierge,

   /*
    * Current Routine
    */

   brand,
   setBrand,

   customBrand,
   setCustomBrand,

   name,
   setName,

   dosage,
   setDosage,

   supplements,

   addSupplement,
   removeSupplement,

   /*
    * Goal Builder
    */

   selectedGoals,
   setSelectedGoals,

   selectedLifestyle,
   setSelectedLifestyle,

   selectedConsiderations,
   setSelectedConsiderations,

   /*
    * Plan Results
    */

   morningSupplements,
   eveningSupplements,

   suggestedAdditions,
   unrecognizedItems,
   removedItems,

   /*
    * Build Plan
    */

   handleBuildDailyPlan,
   handleBuildGoalPlan,
   recheckReviewedItem,

   /*
    * Plan Editing
    */

   addSuggestedAddition,

   removeMorningSupplement,
   removeEveningSupplement,

   moveMorningSupplementToEvening,
   moveEveningSupplementToMorning,

   removeUnrecognizedItem,

   restoreRemovedItem,
   permanentlyRemoveItem,

   
 };
}