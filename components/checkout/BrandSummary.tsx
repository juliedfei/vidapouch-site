"use client";

import type { Supplement } from "@/components/routine-builder/types";

type Props = {
 morning: Supplement[];
 evening: Supplement[];
};

export default function BrandSummary({
 morning,
 evening,
}: Props) {
 const supplements = [...morning, ...evening];

 const customerBrands = supplements.filter(
   (s) => s.brand && !s.vidapouchChoosesBrand
 );

 const vidapouchBrands = supplements.filter(
   (s) => s.vidapouchChoosesBrand
 );

 return (
   <section className="rounded-[28px] border border-[#DDD7CF] bg-white p-7 shadow-[0_14px_38px_rgba(20,15,10,0.04)]">

     <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C1D40]">
       Brand Selection
     </p>

     <h2
       className="mt-2 text-[30px] tracking-[-0.03em] text-[#081620]"
       style={{
         fontFamily: 'Georgia, "Times New Roman", serif',
       }}>

       How your brands will be chosen
     </h2>

     <div className="mt-8 grid gap-6 lg:grid-cols-2">

       {/* Customer Brands */}

       <div className="rounded-2xl border border-[#DDD7CF] bg-[#FCFAF7] p-5">

         <p className="text-[11px] uppercase tracking-[0.16em] text-[#8C1D40]">
           Your Preferred Brands
         </p>

         <div className="mt-4 space-y-3">

           {customerBrands.length === 0 ? (

             <p className="text-sm text-[#5D686C]">
               None selected.
             </p>

           ) : (

             customerBrands.map((supplement, index) => (

               <div key={`${supplement.name}-${index}`}>

                 <p className="font-medium text-[#081620]">
                   {supplement.name}
                 </p>

                 <p className="text-sm text-[#5D686C]">
                   {supplement.brand}
                 </p>

               </div>

             ))

           )}

         </div>

       </div>

       {/* VidaPouch */}

       <div className="rounded-2xl border border-[#DDD7CF] bg-[#FCFAF7] p-5">

         <p className="text-[11px] uppercase tracking-[0.16em] text-[#8C1D40]">
           VidaPouch Will Choose
         </p>

         <div className="mt-4 space-y-3">

           {vidapouchBrands.length === 0 ? (

             <p className="text-sm text-[#5D686C]">
               All brands have already been selected.
             </p>

           ) : (

             vidapouchBrands.map((supplement, index) => (

               <div key={`${supplement.name}-${index}`}>

                 <p className="font-medium text-[#081620]">
                   {supplement.name}
                 </p>

                 <p className="text-sm text-[#5D686C]">
                   VidaPouch Choice
                 </p>

               </div>

             ))

           )}

         </div>

       </div>

     </div>

   </section>
 );
}