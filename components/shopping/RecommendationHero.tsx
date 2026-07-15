"use client";

type Props = {

 supplementName: string;

 recommendedBrand: string;

 estimatedMonthlyCost: number;

 matchScore: number;

 onCompare: () => void;

 onWhy: () => void;

};

export default function RecommendationHero({

 supplementName,

 recommendedBrand,

 estimatedMonthlyCost,

 matchScore,

 onCompare,

 onWhy,

}: Props) {

 return (

   <section className="rounded-[34px] border border-[#DDD7CF] bg-white p-10 shadow-[0_20px_60px_rgba(20,15,10,0.06)]">

     <p className="text-[11px] uppercase tracking-[0.22em] text-[#8C1D40]">

       Recommended for You

     </p>

     <h2
       className="mt-3 text-[42px] tracking-[-0.04em]"
       style={{
         fontFamily:
           'Georgia, "Times New Roman", serif',
       }}>


       {recommendedBrand}

     </h2>

     <p className="mt-3 text-[17px] leading-8 text-[#5D686C]">

       Our recommended brand for your

       {" "}

       <strong>{supplementName}</strong>

     </p>

     <div className="mt-10 flex flex-wrap gap-8">

       <Metric
         label="Match"
         value={`${matchScore}/100`}
       />

       <Metric
         label="Monthly Cost"
         value={`$${estimatedMonthlyCost.toFixed(2)}`}
       />

     </div>

     <div className="mt-10 flex gap-4">

       <button
         onClick={onWhy}
         className="rounded-full border border-[#DDD7CF] px-6 py-3 hover:bg-[#F8F2EA]">


         Why this?

       </button>

       <button
         onClick={onCompare}
         className="rounded-full bg-[#081620] px-6 py-3 text-white hover:bg-[#17262C]">


         Compare Brands

       </button>

     </div>

   </section>

 );

}

function Metric({

 label,

 value,

}: {

 label: string;

 value: string;

}) {

 return (

   <div>

     <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C1D40]">

       {label}

     </p>

     <p
       className="mt-2 text-[34px] tracking-[-0.03em]"
       style={{
         fontFamily:
           'Georgia, "Times New Roman", serif',
       }}>


       {value}

     </p>

   </div>

 );

}
