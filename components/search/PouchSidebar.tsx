"use client";

import Image from "next/image";
import { useState } from "react";

type PouchItem = {
 id: string;
 name: string;
 monthlyPrice: number;
};

type PouchSidebarProps = {
 /*
  * SearchWorkspace will use this callback to widen
  * the search-results column when the pouch collapses.
  */
 onCollapsedChange?: (
   isCollapsed: boolean
 ) => void;

 /*
  * Replace this with real pouch state later.
  * When false, the sidebar does not render.
  */
 hasSelections?: boolean;
};

const MORNING_ITEMS: PouchItem[] = [
 {
   id: "vitamin-d3",
   name: "Vitamin D3",
   monthlyPrice: 3.2,
 },
 {
   id: "omega-3",
   name: "Omega-3",
   monthlyPrice: 11.4,
 },
 {
   id: "b-complex",
   name: "B-Complex",
   monthlyPrice: 6.8,
 },
];

const EVENING_ITEMS: PouchItem[] = [
 {
   id: "magnesium-glycinate",
   name: "Magnesium Glycinate",
   monthlyPrice: 8.14,
 },
 {
   id: "l-theanine",
   name: "L-Theanine",
   monthlyPrice: 4.2,
 },
 {
   id: "apigenin",
   name: "Apigenin",
   monthlyPrice: 2.84,
 },
];

const SUPPLEMENT_COST = 36.58;
const SERVICE_COST = 19;
const MONTHLY_TOTAL =
 SUPPLEMENT_COST + SERVICE_COST;

const RETAIL_VALUE = 84.12;
const ESTIMATED_SAVINGS =
 RETAIL_VALUE - MONTHLY_TOTAL;

function formatPrice(value: number) {
 return `$${value.toFixed(2)}`;
}

function SunIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[17px] w-[17px]">

     <circle
       cx="12"
       cy="12"
       r="3.5"
       stroke="currentColor"
       strokeWidth="1.5"
     />

     <path
       d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
     />
   </svg>
 );
}

function MoonIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[17px] w-[17px]">

     <path
       d="M19.4 15.1A8 8 0 0 1 8.9 4.6 8.2 8.2 0 1 0 19.4 15.1Z"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function PouchIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[19px] w-[19px]">

     <path
       d="M7 4.5h10l1 15H6l1-15Z"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinejoin="round"
     />

     <path
       d="M8 8h8"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
     />

     <path
       d="M10 12.2h4"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
     />
   </svg>
 );
}

function ChevronIcon({
 direction,
}: {
 direction: "left" | "right";
}) {
 return (
   <svg
     viewBox="0 0 20 20"
     fill="none"
     aria-hidden="true"
     className="h-[17px] w-[17px]">

     <path
       d={
         direction === "left"
           ? "m12 5-5 5 5 5"
           : "m8 5 5 5-5 5"
       }
       stroke="currentColor"
       strokeWidth="1.7"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

type ItemRowProps = {
 item: PouchItem;
};

function ItemRow({
 item,
}: ItemRowProps) {
 return (
   <div
     className="
       flex
       items-center
       justify-between
       gap-3
       py-[4px]
     ">

     <span
       className="
         min-w-0
         truncate
         text-[12px]
         font-medium
         leading-[17px]
         text-[#38332E]
       ">

       {item.name}
     </span>

     <span
       className="
         shrink-0
         text-[12px]
         font-semibold
         tabular-nums
         text-[#74101D]
       ">

       {formatPrice(
         item.monthlyPrice
       )}
     </span>
   </div>
 );
}

type PouchSectionProps = {
 title: string;
 icon: React.ReactNode;
 items: PouchItem[];
};

function PouchSection({
 title,
 icon,
 items,
}: PouchSectionProps) {
 return (
   <section className="px-[17px] py-[14px]">
     <div
       className="
         flex
         items-center
         gap-[9px]
       ">

       <span
         className="
           flex
           h-[27px]
           w-[27px]
           shrink-0
           items-center
           justify-center
           rounded-full
           bg-[#F5EBDD]
           text-[#A56D20]
         ">

         {icon}
       </span>

       <h3
         className="
           min-w-0
           truncate
           text-[13px]
           font-bold
           leading-[18px]
           text-[#2A211E]
         ">

         {title}
       </h3>
     </div>

     <div className="mt-[9px]">
       {items.map((item) => (
         <ItemRow
           key={item.id}
           item={item}
         />
       ))}
     </div>
   </section>
 );
}

type PriceRowProps = {
 label: string;
 value: string;
 emphasized?: boolean;
 savings?: boolean;
};

function PriceRow({
 label,
 value,
 emphasized = false,
 savings = false,
}: PriceRowProps) {
 return (
   <div
     className="
       flex
       items-center
       justify-between
       gap-3
     ">

     <span
       className={
         emphasized
           ? `
               text-[13px]
               font-semibold
               text-[#2A211E]
             `
           : savings
             ? `
                 text-[12px]
                 font-semibold
                 text-[#5D554E]
               `
             : `
                 text-[12px]
                 text-[#6E6862]
               `
       }>

       {label}
     </span>

     <span
       className={
         emphasized
           ? `
               shrink-0
               text-[22px]
               font-bold
               tracking-[-0.02em]
               tabular-nums
               text-[#7D0E1C]
             `
           : savings
             ? `
                 shrink-0
                 text-[13px]
                 font-bold
                 tabular-nums
                 text-[#7D0E1C]
               `
             : `
                 shrink-0
                 text-[13px]
                 font-semibold
                 tabular-nums
                 text-[#2A211E]
               `
       }>

       {value}
     </span>
   </div>
 );
}

export default function PouchSidebar({
 onCollapsedChange,
 hasSelections = true,
}: PouchSidebarProps) {
 const [
   isCollapsed,
   setIsCollapsed,
 ] = useState(false);

 const totalItemCount =
   MORNING_ITEMS.length +
   EVENING_ITEMS.length;

 function updateCollapsedState(
   nextValue: boolean
 ) {
   setIsCollapsed(nextValue);
   onCollapsedChange?.(nextValue);
 }

 if (!hasSelections) {
   return null;
 }

 /*
  * The outer element remains full height in both states.
  * Only its width changes.
  */
 if (isCollapsed) {
   return (
     <aside
       className="
         sticky
         top-6
         flex
         h-full
         min-h-[580px]
         w-[54px]
         justify-self-end
         overflow-hidden
         rounded-[12px]
         border
         border-[#E5DCD2]
         bg-[#FBF8F3]
         shadow-[0_8px_24px_rgba(44,30,18,0.05)]
       ">

       <button
         type="button"
         onClick={() =>
           updateCollapsedState(false)
         }
         aria-label="Expand My Pouch"
         className="
           flex
           h-full
           min-h-[580px]
           w-full
           flex-col
           items-center
           px-[8px]
           py-[15px]
           text-[#75101D]
           transition-colors
           hover:bg-[#F6F0E9]
         ">

         <ChevronIcon direction="left" />

         <span
           className="
             mt-[17px]
             flex
             h-[32px]
             w-[32px]
             items-center
             justify-center
             rounded-full
             bg-[#F2E6D9]
             text-[#8A5C23]
           ">

           <PouchIcon />
         </span>

         <span
           className="
             mt-[13px]
             flex
             h-[23px]
             min-w-[23px]
             items-center
             justify-center
             rounded-full
             bg-[#7D0E1C]
             px-[6px]
             text-[10px]
             font-bold
             text-white
           ">

           {totalItemCount}
         </span>

         <span
           className="
             mt-[17px]
             [writing-mode:vertical-rl]
             rotate-180
             text-[10px]
             font-semibold
             tracking-[0.08em]
             text-[#403A35]
           ">

           My Pouch
         </span>

         <span
           aria-hidden="true"
           className="
             mt-auto
             mb-[2px]
             h-[42px]
             w-px
             bg-[#E4D9CE]
           "
         />
       </button>
     </aside>
   );
 }

 return (
   <aside
     className="
       sticky
       top-6
       h-fit
       min-h-[580px]
       w-full
       overflow-hidden
       rounded-[12px]
       border
       border-[#E5DCD2]
       bg-[#FBF8F3]
       shadow-[0_8px_24px_rgba(44,30,18,0.05)]
     ">

     {/* Header */}

     <header
       className="
         border-b
         border-[#EAE1D7]
         px-[17px]
         py-[15px]
       ">

       <div
         className="
           flex
           items-start
           justify-between
           gap-3
         ">

         <div className="min-w-0">
           <div
             className="
               flex
               items-center
               gap-[8px]
             ">

             <h2
               className="
                 font-serif
                 text-[20px]
                 font-semibold
                 leading-none
                 tracking-[-0.02em]
                 text-[#4F1118]
               ">

               My Pouch
             </h2>

             <span
               className="
                 flex
                 h-[22px]
                 min-w-[22px]
                 items-center
                 justify-center
                 rounded-full
                 bg-[#7D0E1C]
                 px-[6px]
                 text-[10px]
                 font-bold
                 text-white
               ">

               {totalItemCount}
             </span>
           </div>

           <p
             className="
               mt-[6px]
               max-w-[190px]
               text-[10.5px]
               leading-[15px]
               text-[#6E6862]
             ">

             Your personalized monthly
             supplement routine.
           </p>
         </div>

         <button
           type="button"
           onClick={() =>
             updateCollapsedState(true)
           }
           aria-label="Collapse My Pouch"
           className="
             flex
             h-[29px]
             w-[29px]
             shrink-0
             items-center
             justify-center
             rounded-full
             border
             border-[#DED4CA]
             bg-[#FFFDF9]
             text-[#5B524C]
             transition
             hover:border-[#BFA99A]
             hover:text-[#74101D]
           ">

           <ChevronIcon direction="right" />
         </button>
       </div>
     </header>

     {/* Morning */}

     <PouchSection
       title="Morning Pouch"
       icon={<SunIcon />}
       items={MORNING_ITEMS}
     />

     <div className="border-t border-[#EAE1D7]" />

     {/* Evening */}

     <PouchSection
       title="Evening Pouch"
       icon={<MoonIcon />}
       items={EVENING_ITEMS}
     />

     <div className="border-t border-[#EAE1D7]" />

     {/* Pricing */}

     <section className="px-[17px] py-[15px]">
       <div className="space-y-[8px]">
         <PriceRow
           label="Supplement Cost"
           value={formatPrice(
             SUPPLEMENT_COST
           )}
         />

         <PriceRow
           label="VidaPouch Service"
           value={formatPrice(
             SERVICE_COST
           )}
         />
       </div>

       <div
         className="
           my-[13px]
           border-t
           border-[#E5DCD2]
         "
       />

       <PriceRow
         label="Monthly Total"
         value={formatPrice(
           MONTHLY_TOTAL
         )}
         emphasized
       />

       <div
         className="
           mt-[13px]
           space-y-[7px]
           border-t
           border-[#E5DCD2]
           pt-[12px]
         ">

         <PriceRow
           label="Retail Value"
           value={formatPrice(
             RETAIL_VALUE
           )}
         />

         <PriceRow
           label="You Save"
           value={formatPrice(
             ESTIMATED_SAVINGS
           )}
           savings
         />
       </div>

       <button
         type="button"
         className="
           mt-[15px]
           flex
           h-[45px]
           w-full
           items-center
           justify-center
           rounded-[10px]
           bg-[#7D0E1C]
           px-4
           text-[13px]
           font-semibold
           text-white
           transition-colors
           hover:bg-[#65101A]
           focus:outline-none
           focus-visible:ring-2
           focus-visible:ring-[#7D0E1C]
           focus-visible:ring-offset-2
         ">

         Review Pouches & Checkout
       </button>
     </section>

     <div className="border-t border-[#EAE1D7]" />

     {/* Concierge */}

     <section className="px-[17px] py-[14px]">
       <div
         className="
           flex
           items-center
           gap-[6px]
         ">

<div
 className="
   shrink-0
 ">

<Image
 src="/images/icons/concierge.png"
 alt="VidaPouch Concierge"
 width={56}
 height={56}

/>
</div>





         <div className="flex-1">
           <p
             className="
               text-[11px]
               font-semibold
               text-[#2F2925]
             ">

             Need help choosing?
           </p>

           <p
             className="
               mt-[2px]
               whitespace-nowrap
               text-[11px]
               leading-[16px]
               text-[#716A63]
             ">

             Talk with a VidaPouch
             concierge.
           </p>

           <a
             href="tel:180043876824"
             className="
               mt-[6px]
               inline-block
               text-[12px]
               font-semibold
               text-[#7D0E1C]
               transition-opacity
               hover:opacity-75
               hover:underline
             ">

             1 (800) GET-POUCH
           </a>
         </div>
       </div>
     </section>
   </aside>
 );
}