"use client";

import type { ReactNode } from "react";

type RoutineStepLayoutProps = {
 step: number;
 title: string;
 description: string;
 children: ReactNode;
};

export default function RoutineStepLayout({
 step,
 title,
 description,
 children,
}: RoutineStepLayoutProps) {
 return (
   <section className="border-t border-[#E8E1D8] py-5 first:border-t-0 first:pt-0">

     <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">

       {/* Left */}

       <div className="pt-1">

         <div className="mb-4 flex items-center gap-3">

           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#081620] text-[12px] font-semibold text-white">
             {step}
           </div>

           <h2
             className="text-[26px] tracking-[-0.03em] text-[#081620]"
             style={{
               fontFamily: 'Georgia, "Times New Roman", serif',
             }}>

             {title}
           </h2>

         </div>

         <p className="text-[14px] leading-6 text-[#5D686C]">
           {description}
         </p>

       </div>

       {/* Right */}

       <div className="min-w-0">
         {children}
       </div>

     </div>

   </section>
 );
}