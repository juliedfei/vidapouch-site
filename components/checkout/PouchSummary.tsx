"use client";

import Image from "next/image";

import SupplementCard from "./SupplementCard";

import type {
 CheckoutPouch,
} from "@/lib/checkout/checkoutTypes";

import type {
 PouchTiming,
} from "@/components/routine-builder/types";




import type {
  InternalSourceOption,
 } from "@/lib/checkout/checkoutTypes";
 
 type Props = {
  morning: CheckoutPouch;
  evening: CheckoutPouch;
 
  onRemove: (
    timing: PouchTiming,
    index: number
  ) => void;
 
  onChooseBrand: (
    supplementId: string,
    option: InternalSourceOption
  ) => void;
 };






export default function PouchSummary({
 morning,
 evening,
 onRemove,
 onChooseBrand,
}: Props) {
 return (
   <div className="space-y-6">
     <PouchCard
       pouch={morning}
       badge="/images/branding/am-badge.png"
       badgeWidth={44}
       badgeHeight={64}
       onRemove={onRemove}
       onChooseBrand={onChooseBrand}
     />

     <PouchCard
       pouch={evening}
       badge="/images/branding/pm-badge.png"
       badgeWidth={48}
       badgeHeight={70}
       onRemove={onRemove}
       onChooseBrand={onChooseBrand}
     />
   </div>
 );
}




type CardProps = {
  pouch: CheckoutPouch;
 
  badge: string;
  badgeWidth: number;
  badgeHeight: number;
 
  onRemove: (
    timing: PouchTiming,
    index: number
  ) => void;
 
  onChooseBrand: (
    supplementId: string,
    option: InternalSourceOption
  ) => void;
 };
 






function PouchCard({
 pouch,
 badge,
 badgeWidth,
 badgeHeight,
 onRemove,
 onChooseBrand,
}: CardProps) {
 return (
   <section className="rounded-[26px] border border-[#DDD7CF] bg-white p-6 shadow-[0_14px_38px_rgba(20,15,10,0.04)] sm:p-7">
     <div className="relative flex items-start justify-between gap-4">
       <div>
         <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8C1D40]">
           {pouch.label}
         </p>

         <p className="mt-2 text-sm text-[#5D686C]">
           Your personalized monthly
           pouch contents
         </p>
       </div>

       <div className="pointer-events-none absolute left-1/2 top-[-30px] -translate-x-1/2">
         <Image
           src={badge}
           alt={pouch.label}
           width={badgeWidth}
           height={badgeHeight}
           priority
           className="select-none"
         />
       </div>

       <span className="shrink-0 rounded-full border border-[#DDD7CF] bg-[#F8F2EA] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#5D686C]">
         {pouch.supplements.length} item
         {pouch.supplements.length === 1
           ? ""
           : "s"}
       </span>
     </div>

     <div className="mt-8 space-y-4">
       {pouch.supplements.length === 0 ? (
         <div className="rounded-2xl border border-dashed border-[#DDD7CF] bg-[#FCFAF7] p-5">
           <p className="text-sm text-[#5D686C]">
             No supplements are currently
             assigned to this pouch.
           </p>
         </div>
       ) : (
         pouch.supplements.map(
           (supplement, index) => (
             
             
             
            <SupplementCard
            key={supplement.id}
            supplement={supplement}
            onRemove={() =>
              onRemove(
                pouch.timing,
                index
              )
            }
            onChooseBrand={(option) =>
              onChooseBrand(
                supplement.id,
                option
              )
            }
           />
           




           )
         )
       )}
     </div>
   </section>
 );
}
