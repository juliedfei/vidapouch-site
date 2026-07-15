"use client";

import type {
 CheckoutSummary,
} from "@/lib/checkout/checkoutTypes";

type Props = {
 summary: CheckoutSummary;

 onContinue: () => void;

 isContinuing?: boolean;
};

function formatPrice(value: number) {
 return new Intl.NumberFormat(
   "en-US",
   {
     style: "currency",
     currency: "USD",
     minimumFractionDigits: 2,
     maximumFractionDigits: 2,
   }
 ).format(value);
}

export default function OrderSummary({
 summary,
 onContinue,
 isContinuing = false,
}: Props) {
 return (
   <aside className="rounded-[28px] border border-[#DDD7CF] bg-white p-7 shadow-[0_14px_38px_rgba(20,15,10,0.04)]">
     <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C1D40]">
       Review your order
     </p>

     <h2
       className="mt-2 text-[30px] tracking-[-0.03em] text-[#081620]"
       style={{
         fontFamily:
           'Georgia, "Times New Roman", serif',
       }}>

       Monthly Total
     </h2>

     <div className="mt-7 space-y-4">
       {summary.activeSupplements.map(
         (supplement) => (
           <div
             key={supplement.id}
             className="flex items-start justify-between gap-4">

             <div>
               <p className="text-sm font-medium text-[#081620]">
                 {supplement.name}
               </p>

               <p className="mt-1 text-xs text-[#6D777B]">
                 {supplement.selectedBrand}
               </p>
             </div>

             <span className="shrink-0 text-sm font-medium text-[#081620]">
               {supplement.pricingStatus ===
               "ready"
                 ? formatPrice(
                     supplement.customerMonthlyPrice
                   )
                 : "Pending"}
             </span>
           </div>
         )
       )}
     </div>

     <div className="my-6 border-t border-[#E5DDD3]" />

     <div className="space-y-4">
       <div className="flex items-center justify-between gap-4">
         <span className="text-[15px] text-[#5D686C]">
           Monthly supplements
         </span>

         <span className="font-medium text-[#081620]">
           {formatPrice(
             summary.costs
               .supplementSubtotal
           )}
         </span>
       </div>

       <div className="flex items-start justify-between gap-4">
         <div>
           <span className="text-[15px] text-[#5D686C]">
             VitaPouch Concierge
           </span>

           <p className="mt-1 text-xs text-[#6D777B]">
             {summary.service.label}
           </p>
         </div>

         <span className="shrink-0 font-medium text-[#081620]">
           {formatPrice(
             summary.costs.serviceFee
           )}
         </span>
       </div>
     </div>

     <div className="my-7 border-t border-[#E5DDD3]" />

     <div className="flex items-end justify-between gap-4">
       <span
         className="text-[25px] tracking-[-0.03em] text-[#081620]"
         style={{
           fontFamily:
             'Georgia, "Times New Roman", serif',
         }}>

         You pay
       </span>

       <span
         className="text-[35px] tracking-[-0.04em] text-[#081620]"
         style={{
           fontFamily:
             'Georgia, "Times New Roman", serif',
         }}>

         {formatPrice(
           summary.costs.totalDue
         )}
       </span>
     </div>

     <p className="mt-2 text-right text-xs text-[#6D777B]">
       per monthly VitaPouch cycle
     </p>

     {summary.service
       .includedServices.length > 0 && (
       <div className="mt-7 rounded-2xl border border-[#DDD7CF] bg-[#FCFAF7] p-5">
         <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C1D40]">
           Concierge service includes
         </p>

         <ul className="mt-3 space-y-2">
           {summary.service.includedServices.map(
             (service) => (
               <li
                 key={service}
                 className="flex gap-2 text-sm leading-6 text-[#5D686C]">

                 <span className="text-[#8C1D40]">
                   ✓
                 </span>

                 <span>{service}</span>
               </li>
             )
           )}
         </ul>
       </div>
     )}

     <div className="mt-5 rounded-2xl bg-[#F3E9DD] px-5 py-4">
       <p className="text-sm font-medium text-[#081620]">
         Transparent monthly pricing
       </p>

       <p className="mt-1 text-xs leading-5 text-[#5D686C]">
         Your supplement price is based
         on the quantity included in your
         monthly pouches. VitaPouch will
         not charge an additional amount
         without your approval.
       </p>
     </div>

     <button
       type="button"
       onClick={onContinue}
       disabled={
         !summary.canCheckout ||
         isContinuing
       }
       className="mt-7 w-full rounded-full bg-[#081620] px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#17262C] disabled:cursor-not-allowed disabled:opacity-40">

       {isContinuing
         ? "Preparing Payment..."
         : `Continue · ${formatPrice(
             summary.costs.totalDue
           )}`}
     </button>

     {!summary.canCheckout && (
       <p className="mt-3 text-center text-xs leading-5 text-[#8C1D40]">
         Resolve the pricing issues shown
         on this page before continuing.
       </p>
     )}
   </aside>
 );
}
