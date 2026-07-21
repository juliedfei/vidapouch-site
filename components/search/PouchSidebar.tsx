"use client";

import {
 useEffect,
 useRef,
 useState,
} from "react";

import type {
 ReactNode,
} from "react";

import Image from "next/image";

import type {
 SearchPouchItem,
 SearchPouchTimingPreference,
} from "./types/searchPouch";

type PouchSidebarProps = {
 items:
   SearchPouchItem[];

 onRemoveItem: (
   itemId: string
 ) => void;

 onTimingChange: (
   itemId: string,
   timingPreference:
     SearchPouchTimingPreference
 ) => void;
};

type TimingConfirmationMap =
 Record<
   string,
   string>
;

const SERVICE_COST = 19;

const TIMING_CONFIRMATION_DURATION =
 5000;

function formatPrice(
 value: number
) {
 return `$${value.toFixed(2)}`;
}

function getPluralUnitLabel(
 unitLabel:
   SearchPouchItem["unitLabel"],
 count: number
) {
 if (count === 1) {
   return unitLabel;
 }

 switch (unitLabel) {
   case "capsule":
     return "capsules";

   case "tablet":
     return "tablets";

   case "caplet":
     return "caplets";

   case "softgel":
     return "softgels";

   case "gummy":
     return "gummies";

   case "serving":
     return "servings";

   case "unit":
   default:
     return "units";
 }
}

function getUnitsPerDayLabel(
 item:
   SearchPouchItem
) {
 const unitLabel =
   getPluralUnitLabel(
     item.unitLabel,
     item.unitsPerDay
   );

 return `${item.unitsPerDay} ${unitLabel} per day`;
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

function MoreIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="currentColor"
     aria-hidden="true"
     className="h-[17px] w-[17px]">

     <circle
       cx="5"
       cy="12"
       r="1.5"
     />

     <circle
       cx="12"
       cy="12"
       r="1.5"
     />

     <circle
       cx="19"
       cy="12"
       r="1.5"
     />
   </svg>
 );
}

function CheckIcon() {
 return (
   <svg
     viewBox="0 0 20 20"
     fill="none"
     aria-hidden="true"
     className="h-[14px] w-[14px]">

     <path
       d="m4.5 10.3 3.2 3.2 7.8-7.8"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

type TimingMenuOptionProps = {
 label: string;

 onSelect: () => void;
};

function TimingMenuOption({
 label,
 onSelect,
}: TimingMenuOptionProps) {
 return (
   <button
     type="button"
     role="menuitem"
     onClick={
       onSelect
     }
     className="
       w-full
       px-3
       py-2.5
       text-left
       text-[11px]
       font-medium
       text-[#3B3530]
       transition
       hover:bg-[#F7F1EB]
     ">

     {label}
   </button>
 );
}

type ItemRowProps = {
 item:
   SearchPouchItem;

 timingConfirmation:
   string | undefined;

 onRemoveItem: (
   itemId: string
 ) => void;

 onSelectTiming: (
   item:
     SearchPouchItem,
   timingPreference:
     SearchPouchTimingPreference
 ) => void;
};

function ItemRow({
 item,
 timingConfirmation,
 onRemoveItem,
 onSelectTiming,
}: ItemRowProps) {
 const [
   menuOpen,
   setMenuOpen,
 ] =
   useState(false);

 function selectTiming(
   timingPreference:
     SearchPouchTimingPreference
 ) {
   setMenuOpen(
     false
   );

   onSelectTiming(
     item,
     timingPreference
   );
 }

 function removeItem() {
   setMenuOpen(
     false
   );

   onRemoveItem(
     item.id
   );
 }

 const oppositeTiming =
   item.timing ===
   "morning"
     ? "evening"
     : "morning";

 const oppositeTimingLabel =
   oppositeTiming ===
   "morning"
     ? "Move to Morning"
     : "Move to Evening";

 return (
   <div
     className="
       relative
       border-b
       border-[#EEE5DC]
       py-[11px]
       last:border-b-0
     ">

     <div
       className="
         flex
         items-start
         justify-between
         gap-3
       ">

       <div className="min-w-0">
         <p
           className="
             text-[12px]
             font-semibold
             leading-[17px]
             text-[#302A26]
           ">

           {item.productName}
         </p>

         <p
           className="
             mt-[2px]
             text-[10px]
             font-medium
             text-[#706963]
           ">

           {item.brand}
         </p>
       </div>

       <div className="relative shrink-0">
         <button
           type="button"
           onClick={
             () =>
               setMenuOpen(
                 (current) =>
                   !current
               )
           }
           aria-expanded={
             menuOpen
           }
           aria-haspopup="menu"
           aria-label={`Manage ${item.productName}`}
           className="
             flex
             h-[27px]
             w-[31px]
             items-center
             justify-center
             rounded-[7px]
             border
             border-[#DED4CA]
             bg-[#FFFDF9]
             text-[#6F6862]
             transition
             hover:border-[#BFA99A]
             hover:bg-white
             hover:text-[#7D0E1C]
           ">

           <MoreIcon />
         </button>

         {menuOpen && (
           <div
             role="menu"
             className="
               absolute
               right-0
               top-[33px]
               z-30
               w-[190px]
               overflow-hidden
               rounded-[9px]
               border
               border-[#DDD2C7]
               bg-white
               py-1
               shadow-[0_10px_30px_rgba(47,31,20,0.16)]
             ">

             <TimingMenuOption
               label={
                 oppositeTimingLabel
               }
               onSelect={
                 () =>
                   selectTiming(
                     oppositeTiming
                   )
               }
             />

             {item.timingPreference !==
               "vidapouch" && (
               <TimingMenuOption
                 label="Let VidaPouch Choose"
                 onSelect={
                   () =>
                     selectTiming(
                       "vidapouch"
                     )
                 }
               />
             )}

             <div className="my-1 border-t border-[#EEE6DE]" />

             <button
               type="button"
               role="menuitem"
               onClick={
                 removeItem
               }
               className="
                 w-full
                 px-3
                 py-2.5
                 text-left
                 text-[11px]
                 font-medium
                 text-[#A23636]
                 transition
                 hover:bg-[#FCF2F2]
               ">

               Remove from VidaPouch
             </button>
           </div>
         )}
       </div>
     </div>

     <div
       className="
         mt-[7px]
         flex
         items-end
         justify-between
         gap-3
       ">

       <div
         className="
           min-w-0
           text-[10px]
           leading-[15px]
           text-[#706963]
         ">

         {item.dosage && (
           <p>
             {item.dosage}
             {item.form
               ? ` · ${item.form}`
               : ""}
           </p>
         )}

         <p>
           {getUnitsPerDayLabel(
             item
           )}
         </p>

         <p>
           {item.monthlyUnitCount} units monthly
         </p>
       </div>

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

     {timingConfirmation && (
       <div
         className="
           mt-[8px]
           flex
           items-center
           gap-1.5
           rounded-[6px]
           bg-[#F1F3EC]
           px-2
           py-1.5
           text-[#46514B]
           animate-[fadeOut_5s_ease-in-out_forwards]
         "
         role="status">

         <span className="shrink-0">
           <CheckIcon />
         </span>

         <p
           className="
             text-[9px]
             font-semibold
             leading-[13px]
           ">

           {timingConfirmation}
         </p>
       </div>
     )}
   </div>
 );
}

type PouchSectionProps = {
 title: string;

 icon:
   ReactNode;

 items:
   SearchPouchItem[];

 timingConfirmations:
   TimingConfirmationMap;

 onRemoveItem: (
   itemId: string
 ) => void;

 onSelectTiming: (
   item:
     SearchPouchItem,
   timingPreference:
     SearchPouchTimingPreference
 ) => void;
};

function PouchSection({
 title,
 icon,
 items,
 timingConfirmations,
 onRemoveItem,
 onSelectTiming,
}: PouchSectionProps) {
 if (
   items.length === 0
 ) {
   return null;
 }

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

     <div className="mt-[7px]">
       {items.map(
         (item) => (
           <ItemRow
             key={item.id}
             item={item}
             timingConfirmation={
               timingConfirmations[
                 item.id
               ]
             }
             onRemoveItem={
               onRemoveItem
             }
             onSelectTiming={
               onSelectTiming
             }
           />
         )
       )}
     </div>
   </section>
 );
}

type PriceRowProps = {
 label: string;

 value: string;

 emphasized?: boolean;
};

function PriceRow({
 label,
 value,
 emphasized = false,
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
 items,
 onRemoveItem,
 onTimingChange,
}: PouchSidebarProps) {
 const [
   timingConfirmations,
   setTimingConfirmations,
 ] =
   useState<TimingConfirmationMap>(
     {}
   );

 const confirmationTimers =
   useRef<
     Record<
       string,
       ReturnType<
         typeof setTimeout
>
>
>({});

 useEffect(
   () => {
     const activeTimers =
       confirmationTimers.current;

     return () => {
       Object.values(
         activeTimers
       ).forEach(
         (timer) =>
           clearTimeout(
             timer
           )
       );
     };
   },
   []
 );

 function showTimingConfirmation(
   itemId: string,
   message: string
 ) {
   const existingTimer =
     confirmationTimers
       .current[itemId];

   if (existingTimer) {
     clearTimeout(
       existingTimer
     );
   }

   setTimingConfirmations(
     (current) => ({
       ...current,

       [itemId]:
         message,
     })
   );

   confirmationTimers
     .current[itemId] =
     setTimeout(
       () => {
         setTimingConfirmations(
           (current) => {
             const next = {
               ...current,
             };

             delete next[
               itemId
             ];

             return next;
           }
         );

         delete confirmationTimers
           .current[itemId];
       },
       TIMING_CONFIRMATION_DURATION
     );
 }

 function handleSelectTiming(
   item:
     SearchPouchItem,
   timingPreference:
     SearchPouchTimingPreference
 ) {
   let confirmationMessage:
     string;

   if (
     timingPreference ===
     "vidapouch"
   ) {
     const restoredTiming =
       item.recommendedTiming ===
       "morning"
         ? "Morning"
         : "Evening";

     confirmationMessage =
       `VidaPouch timing restored to ${restoredTiming}`;
   } else {
     const selectedTiming =
       timingPreference ===
       "morning"
         ? "Morning"
         : "Evening";

     confirmationMessage =
       `Moved to ${selectedTiming}`;
   }

   showTimingConfirmation(
     item.id,
     confirmationMessage
   );

   onTimingChange(
     item.id,
     timingPreference
   );
 }

 function handleRemoveItem(
   itemId: string
 ) {
   const existingTimer =
     confirmationTimers
       .current[itemId];

   if (existingTimer) {
     clearTimeout(
       existingTimer
     );

     delete confirmationTimers
       .current[itemId];
   }

   setTimingConfirmations(
     (current) => {
       const next = {
         ...current,
       };

       delete next[
         itemId
       ];

       return next;
     }
   );

   onRemoveItem(
     itemId
   );
 }

 const morningItems =
   items.filter(
     (item) =>
       item.timing ===
       "morning"
   );

 const eveningItems =
   items.filter(
     (item) =>
       item.timing ===
       "evening"
   );

 const supplementCost =
   items.reduce(
     (
       total,
       item
     ) =>
       total +
       item.monthlyPrice,
     0
   );

 const monthlyTotal =
   supplementCost +
   SERVICE_COST;

 return (
   <aside
     className="
       w-full
       rounded-[12px]
       border
       border-[#E5DCD2]
       bg-[#FBF8F3]
       shadow-[0_8px_24px_rgba(44,30,18,0.05)]
     ">

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

           {items.length}
         </span>
       </div>

       <p
         className="
           mt-[6px]
           text-[10.5px]
           leading-[15px]
           text-[#6E6862]
         ">

         Your personalized monthly
         supplement routine.
       </p>
     </header>

     <PouchSection
       title="Morning Pouch"
       icon={
         <SunIcon />
       }
       items={
         morningItems
       }
       timingConfirmations={
         timingConfirmations
       }
       onRemoveItem={
         handleRemoveItem
       }
       onSelectTiming={
         handleSelectTiming
       }
     />

     {morningItems.length >
       0 &&
       eveningItems.length >
         0 && (
       <div className="border-t border-[#EAE1D7]" />
     )}

     <PouchSection
       title="Evening Pouch"
       icon={
         <MoonIcon />
       }
       items={
         eveningItems
       }
       timingConfirmations={
         timingConfirmations
       }
       onRemoveItem={
         handleRemoveItem
       }
       onSelectTiming={
         handleSelectTiming
       }
     />

     <div className="border-t border-[#EAE1D7]" />

     <section className="px-[17px] py-[15px]">
       <div className="space-y-[8px]">
         <PriceRow
           label="Supplement Cost"
           value={
             formatPrice(
               supplementCost
             )
           }
         />

         <PriceRow
           label="VidaPouch Service"
           value={
             formatPrice(
               SERVICE_COST
             )
           }
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
         value={
           formatPrice(
             monthlyTotal
           )
         }
         emphasized
       />

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

         Review Pouches &amp; Checkout
       </button>
     </section>

     <div className="border-t border-[#EAE1D7]" />

     <section className="px-[17px] py-[14px]">
       <div
         className="
           flex
           items-center
           gap-[12px]
         ">

         <div className="shrink-0">
           <Image
             src="/images/icons/concierge.png"
             alt="VidaPouch Concierge"
             width={36}
             height={36}
           />
         </div>

         <div className="min-w-0 flex-1">
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