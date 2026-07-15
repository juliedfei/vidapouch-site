"use client";

import WorkflowHeader from "./WorkflowHeader";

type CurrentRoutineHeaderProps = {
 supplementCount: number;
 isBuildingPlan: boolean;
 buildError: string;
 onBack: () => void;
 onBuild: () => void;
};

export default function CurrentRoutineHeader({
 buildError,
 onBack,
}: CurrentRoutineHeaderProps) {
 return (
   <>
     <WorkflowHeader
       title="Current Supplement Routine"
       description="Enter the supplements you already take, and we'll organize them into morning and evening pouches."
       onBack={onBack}
     />

     {buildError && (
       <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
         {buildError}
       </div>
     )}
   </>
 );
}