"use client";

import WorkflowHeader from "./WorkflowHeader";

type PlanHeaderProps = {
 onBack: () => void;
};

export default function PlanHeader({
 onBack,
}: PlanHeaderProps) {
 return (
   <WorkflowHeader
     title="Organize Your Daily Pouches"
     description="Review your routine, move supplements between pouches, and prepare your order before checkout."
     onBack={onBack}
   />
 );
}