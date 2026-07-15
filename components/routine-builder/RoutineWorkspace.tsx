"use client";

import AddSupplementRow from "./AddSupplementRow";
import RoutineStepLayout from "./RoutineStepLayout";
import RoutineReviewSection from "./RoutineReviewSection";

import type { Supplement } from "./types";

type RoutineWorkspaceProps = {
 supplements: Supplement[];

 brand: string;
 customBrand: string;
 name: string;
 dosage: string;

 setBrand: (value: string) => void;
 setCustomBrand: (value: string) => void;
 setName: (value: string) => void;
 setDosage: (value: string) => void;

 addSupplement: () => void;
 removeSupplement: (index: number) => void;

 onBuild: () => void;
 isBuildingPlan: boolean;
};

export default function RoutineWorkspace({
 supplements,

 brand,
 customBrand,
 name,
 dosage,

 setBrand,
 setCustomBrand,
 setName,
 setDosage,

 addSupplement,
 removeSupplement,

 onBuild,
 isBuildingPlan,
}: RoutineWorkspaceProps) {
 return (
   <div className="mx-auto mt-8 max-w-[1200px] space-y-6">
     <RoutineStepLayout
       step={1}
       title="Add Supplements"
       description="Enter the supplements you currently take. You can choose a specific brand or let VidaPouch recommend one for you.">

       <AddSupplementRow
         brand={brand}
         customBrand={customBrand}
         name={name}
         dosage={dosage}
         setBrand={setBrand}
         setCustomBrand={setCustomBrand}
         setName={setName}
         setDosage={setDosage}
         addSupplement={addSupplement}
       />
     </RoutineStepLayout>

     <RoutineStepLayout
       step={2}
       title="Review Your Routine"
       description={
         supplements.length === 0
           ? "Your supplements will appear here as you add them."
           : `${supplements.length} supplement${
               supplements.length === 1 ? "" : "s"
             } added`
       }>

       <RoutineReviewSection
         supplements={supplements}
         removeSupplement={removeSupplement}
         onBuild={onBuild}
         isBuildingPlan={isBuildingPlan}
       />
     </RoutineStepLayout>
   </div>
 );
}
