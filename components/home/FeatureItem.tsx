import type { ReactNode } from "react";

type FeatureItemProps = {
 icon: ReactNode;
 line1: string;
 line2: string;
};

export default function FeatureItem({
 icon,
 line1,
 line2,
}: FeatureItemProps) {
 return (
   <div className="flex flex-col items-center text-center">
     <div className="mb-2 h-7 w-7 text-[#132026] sm:h-8 sm:w-8">
       {icon}
     </div>

     <p className="text-[9px] uppercase tracking-[0.13em] text-[#1E2A2E] sm:text-[10px]">
       {line1}
     </p>

     <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-[#1E2A2E] sm:text-[10px]">
       {line2}
     </p>
   </div>
 );
}
