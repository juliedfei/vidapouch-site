"use client";

import BrandComparisonCard from "./BrandComparisonCard";





import type {
  CheckoutSupplement,
  InternalSourceOption,
 } from "@/lib/checkout/checkoutTypes";







type Props = {
  supplement: CheckoutSupplement;
  onRemove: () => void;
 
  onChooseBrand?: (
    option: InternalSourceOption
  ) => void;
 };
 






function formatPrice(value: number) {
 return new Intl.NumberFormat("en-US", {
   style: "currency",
   currency: "USD",
   minimumFractionDigits: 2,
   maximumFractionDigits: 2,
 }).format(value);
}

function formatCapsuleText(
 capsulesPerDay: number,
 monthlyCapsules: number
) {
 return `${capsulesPerDay} capsule${
   capsulesPerDay === 1 ? "" : "s"
 }/day • ${monthlyCapsules} capsule${
   monthlyCapsules === 1 ? "" : "s"
 }/month`;
}

export default function SupplementCard({
 supplement,
 onRemove,
 onChooseBrand,
}: Props) {
 const hasReadyPrice =
   supplement.pricingStatus === "ready";

 return (
   <article className="rounded-[18px] border border-[#DDD7CF] bg-[#FCFAF7] p-4">

     {/* Top Row */}

     <div className="flex items-start justify-between gap-4">

       <div className="min-w-0">

         <h3 className="truncate text-[18px] font-semibold text-[#081620]">
           {supplement.name}
         </h3>

       </div>

       <button
         type="button"
         onClick={onRemove}
         disabled={!supplement.removable}
         aria-label={`Remove ${supplement.name}`}
         className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[18px] leading-none text-[#8C1D40] transition hover:bg-[#F3E9DD] disabled:cursor-not-allowed disabled:opacity-40">

         ✕

       </button>

     </div>

     {/* Second Row */}

     <div className="mt-2 flex items-center justify-between gap-4">

       <div className="min-w-0">

         <p className="truncate text-[15px] font-medium text-[#5D686C]">
           {supplement.selectedBrand}
         </p>

       </div>

       <div className="shrink-0 text-right">

         <p className="text-[22px] font-semibold tracking-[-0.03em] text-[#081620]">

           {hasReadyPrice
             ? `${formatPrice(
                 supplement.customerMonthlyPrice
               )}/mo`
             : "--"}

         </p>

       </div>

     </div>

     {/* Third Row */}

     <div className="mt-1">

       <p className="text-[13px] text-[#6D777B]">

         {formatCapsuleText(
           supplement.capsulesPerDay,
           supplement.monthlyCapsuleQuantity
         )}

       </p>

     </div>

     {/* Compare Brands */}




     <BrandComparisonCard
 supplement={supplement}
 onChooseBrand={(option) =>
   onChooseBrand?.(option)
 }
/>






   </article>
 );
}