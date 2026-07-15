"use client";

import CurrentRoutineHeader from "./CurrentRoutineHeader";
import RoutineWorkspace from "./RoutineWorkspace";

import type { Supplement } from "./types";

type CurrentRoutineStepProps = {
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

 supplementCount: number;
 isBuildingPlan: boolean;
 buildError: string;

 onBack: () => void;
 onBuild: () => void;
};

export default function CurrentRoutineStep({
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

 supplementCount,
 isBuildingPlan,
 buildError,

 onBack,
 onBuild,
}: CurrentRoutineStepProps) {
 return (
   <>
     <CurrentRoutineHeader
       supplementCount={supplementCount}
       isBuildingPlan={isBuildingPlan}
       buildError={buildError}
       onBack={onBack}
       onBuild={onBuild}
     />

     <RoutineWorkspace
       supplements={supplements}
       brand={brand}
       customBrand={customBrand}
       name={name}
       dosage={dosage}
       setBrand={setBrand}
       setCustomBrand={setCustomBrand}
       setName={setName}
       setDosage={setDosage}
       addSupplement={addSupplement}
       removeSupplement={removeSupplement}
       onBuild={onBuild}
       isBuildingPlan={isBuildingPlan}
     />
   </>
 );
}
