"use client";

import RoutineTable from "./RoutineTable";
import type { Supplement } from "./types";

type RoutineReviewSectionProps = {
 supplements: Supplement[];
 removeSupplement: (index: number) => void;

 onBuild: () => void;
 isBuildingPlan: boolean;
};

export default function RoutineReviewSection({
 supplements,
 removeSupplement,
 onBuild,
 isBuildingPlan,
}: RoutineReviewSectionProps) {
 const hasSupplements = supplements.length > 0;

 return (
   <div>

     <RoutineTable
       supplements={supplements}
       removeSupplement={removeSupplement}
     />

     {hasSupplements && (
       <div className="mt-8 flex justify-end">

         <button
           type="button"
           onClick={onBuild}
           disabled={isBuildingPlan}
           className="rounded-full bg-[#081620] px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#17262C] disabled:cursor-not-allowed disabled:opacity-50">

           {isBuildingPlan
             ? "Building Your Plan..."
             : "Build My Daily Plan →"}

         </button>

       </div>
     )}

   </div>
 );
}