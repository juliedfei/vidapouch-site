"use client";

function formatPrice(value: number) {
 return new Intl.NumberFormat("en-US", {
   style: "currency",
   currency: "USD",
   maximumFractionDigits: 0,
 }).format(value);
}

type Props = {
 supplementEstimate: number;
 serviceFee: number;
};

export default function CostSummary({
 supplementEstimate,
 serviceFee,
}: Props) {
 const estimatedTotal = supplementEstimate + serviceFee;

 return (
   <aside className="rounded-[28px] border border-[#DDD7CF] bg-white p-7 shadow-[0_14px_38px_rgba(20,15,10,0.04)]">

     <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C1D40]">
       Monthly Estimate
     </p>

     <h2
       className="mt-2 text-[30px] tracking-[-0.03em] text-[#081620]"
       style={{
         fontFamily: 'Georgia, "Times New Roman", serif',
       }}>

       Estimated Total
     </h2>

     <div className="mt-8 space-y-5">

       <div className="flex items-center justify-between">

         <span className="text-[15px] text-[#5D686C]">
           Supplements
         </span>

         <span className="font-medium text-[#081620]">
           ≈ {formatPrice(supplementEstimate)}
         </span>

       </div>

       <div className="flex items-center justify-between">

         <span className="text-[15px] text-[#5D686C]">
           VidaPouch Service
         </span>

         <span className="font-medium text-[#081620]">
           {formatPrice(serviceFee)}
         </span>

       </div>

     </div>

     <div className="my-8 border-t border-[#E5DDD3]" />

     <div className="flex items-center justify-between">

       <span
         className="text-[26px] tracking-[-0.03em]"
         style={{
           fontFamily: 'Georgia, "Times New Roman", serif',
         }}>

         Total
       </span>

       <span
         className="text-[36px] tracking-[-0.03em] text-[#081620]"
         style={{
           fontFamily: 'Georgia, "Times New Roman", serif',
         }}>

         ≈ {formatPrice(estimatedTotal)}
       </span>

     </div>

     <p className="mt-4 text-sm leading-6 text-[#5D686C]">
       Supplement pricing is estimated and may vary slightly based on
       brand availability and package size.
     </p>

     <div className="mt-8 rounded-2xl border border-[#DDD7CF] bg-[#FCFAF7] p-5">

       <p className="text-[11px] uppercase tracking-[0.16em] text-[#8C1D40]">
         Included
       </p>

       <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5D686C]">
         <li>✓ Monthly pouch preparation</li>
         <li>✓ Morning & evening organization</li>
         <li>✓ Quality review before shipment</li>
         <li>✓ Monthly delivery</li>
       </ul>

     </div>

     <button
       type="button"
       className="mt-8 w-full rounded-full bg-[#081620] px-6 py-4 text-[13px] uppercase tracking-[0.08em] text-white transition hover:bg-[#17262C]">

       Continue to Payment
     </button>

   </aside>
 );
}