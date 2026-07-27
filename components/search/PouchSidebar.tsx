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

import PooledPricingSummary from "./PooledPricingSummary";

import type {
 SearchPouchItem,
 SearchPouchPooledPricing,
 SearchPouchTimingPreference,
} from "./types/searchPouch";

import type {
 SearchPlan,
} from "./types/searchPlan";


import {
  trackEvent,
 } from "@/lib/analytics/trackEvent";

type PouchSidebarProps = {
 items:
   SearchPouchItem[];

 selectedPlan:
   SearchPlan;

 /*
  * Customer-safe result returned by the pooled
  * pricing API for the complete current pouch.
  */
 pooledPricing?:
   SearchPouchPooledPricing | null;

 pooledPricingLoading?:
   boolean;

 pooledPricingError?:
   string | null;

 onRemoveItem: (
   itemId:
     string
 ) => void;

 onTimingChange: (
   itemId:
     string,

   timingPreference:
     SearchPouchTimingPreference
 ) => void;
};

type TimingConfirmationMap =
 Record<
   string,
   string>
;

const TIMING_CONFIRMATION_DURATION =
 5000;

function formatPrice(
 value:
   number
) {
 return new Intl.NumberFormat(
   "en-US",
   {
     style:
       "currency",

     currency:
       "USD",

     minimumFractionDigits:
       2,

     maximumFractionDigits:
       2,
   }
 ).format(
   value
 );
}

function getPluralUnitLabel(
 unitLabel:
   SearchPouchItem["unitLabel"],

 count:
   number
) {
 if (
   count ===
   1
 ) {
   return unitLabel;
 }

 switch (
   unitLabel
 ) {
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
     className="
       h-[17px]
       w-[17px]
     ">

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
     className="
       h-[17px]
       w-[17px]
     ">

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
     className="
       h-[17px]
       w-[17px]
     ">

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
     className="
       h-[14px]
       w-[14px]
     ">

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

function PlanIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="
       h-[15px]
       w-[15px]
     ">

     <rect
       x="5"
       y="4"
       width="14"
       height="16"
       rx="2"
       stroke="currentColor"
       strokeWidth="1.5"
     />

     <path
       d="M9 2.8v3M15 2.8v3M8.5 10h7M8.5 14h5"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
     />
   </svg>
 );
}

function ShieldIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="
       h-[15px]
       w-[15px]
     ">

     <path
       d="M12 3.5 19 6v5.2c0 4.4-2.8 7.4-7 9.3-4.2-1.9-7-4.9-7-9.3V6l7-2.5Z"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinejoin="round"
     />

     <path
       d="m9.2 12 1.8 1.8 3.8-4"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function InfoIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="
       h-[14px]
       w-[14px]
     ">

     <circle
       cx="12"
       cy="12"
       r="8.5"
       stroke="currentColor"
       strokeWidth="1.5"
     />

     <path
       d="M12 10.5v5M12 7.5h.01"
       stroke="currentColor"
       strokeWidth="1.7"
       strokeLinecap="round"
     />
   </svg>
 );
}

type TimingMenuOptionProps = {
 label:
   string;

 onSelect:
   () => void;
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
   itemId:
     string
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
   useState(
     false
   );

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
       py-[12px]
       last:border-b-0
     ">

     <div
       className="
         flex
         items-start
         gap-3
       ">

       <div
         className="
           flex
           h-[52px]
           w-[42px]
           shrink-0
           items-center
           justify-center
           overflow-hidden
           rounded-[7px]
           bg-white
           p-1
         ">

         {item.imageUrl ? (
           <img
             src={
               item.imageUrl
             }
             alt=""
             aria-hidden="true"
             className="
               h-full
               w-full
               object-contain
             "
             referrerPolicy="no-referrer"
           />
         ) : (
           <span
             className="
               text-[9px]
               font-semibold
               text-[#8C1D40]
             ">

             {item.brand
               .slice(
                 0,
                 2
               )
               .toUpperCase()}
           </span>
         )}
       </div>

       <div className="min-w-0 flex-1">
         <div
           className="
             flex
             items-start
             justify-between
             gap-2
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

                 <div
                   className="
                     my-1
                     border-t
                     border-[#EEE6DE]
                   "
                 />

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

         {/*
          * No price, Pending badge, or Priced
          * Together badge is displayed beside an
          * individual supplement.
          *
          * Customer pricing appears only once in
          * the pooled plan summary.
          */}
         <div
           className="
             mt-[7px]
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
       </div>
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
 title:
   string;

 icon:
   ReactNode;

 items:
   SearchPouchItem[];

 timingConfirmations:
   TimingConfirmationMap;

 onRemoveItem: (
   itemId:
     string
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
   items.length ===
   0
 ) {
   return null;
 }

 return (
   <section
     className="
       px-[17px]
       py-[14px]
     ">

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

       <span
         className="
           flex
           h-[20px]
           min-w-[20px]
           items-center
           justify-center
           rounded-full
           bg-[#7D0E1C]
           px-[5px]
           text-[9px]
           font-bold
           text-white
         ">

         {items.length}
       </span>
     </div>

     <div className="mt-[7px]">
       {items.map(
         (item) => (
           <ItemRow
             key={
               item.id
             }
             item={
               item
             }
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

function ShippingRow() {
 return (
   <div
     className="
       flex
       items-center
       justify-between
       gap-3
     ">

     <span
       className="
         text-[12px]
         text-[#6E6862]
       ">

       Shipping
     </span>

     <span
       className="
         text-[11px]
         font-medium
         text-[#6E6862]
       ">

       Calculated at checkout
     </span>
   </div>
 );
}

export default function PouchSidebar({
 items,
 selectedPlan,
 pooledPricing = null,
 pooledPricingLoading = false,
 pooledPricingError = null,
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
   itemId:
     string,

   message:
     string
 ) {
   const existingTimer =
     confirmationTimers
       .current[itemId];

   if (
     existingTimer
   ) {
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
   itemId:
     string
 ) {
   const existingTimer =
     confirmationTimers
       .current[itemId];

   if (
     existingTimer
   ) {
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



 function handleCheckoutReview() {
  trackEvent(
    "checkout_review_clicked",
    {
      selected_plan:
        selectedPlan.id,
 
      selected_plan_name:
        selectedPlan.name,
 
      monthly_plan_price:
        selectedPlan.monthlyPrice,
 
      supplement_count:
        items.length,
 
      supplement_limit:
        selectedPlan.supplementLimit,
 
      pooled_monthly_total:
        pooledPricing?.totalMonthlyPrice ??
        null,
 
      has_morning_pouch:
        morningItems.length >
        0,
 
      has_evening_pouch:
        eveningItems.length >
        0,
    }
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

 const progressPercentage =
   Math.min(
     100,
     (
       items.length /
       selectedPlan
         .supplementLimit
     ) *
       100
   );

 /*
  * Checkout remains unavailable while pooled pricing
  * is refreshing, unavailable, disabled, or unable
  * to calculate a reliable current total.
  */
 const checkoutDisabled =
   items.length ===
     0 ||
   pooledPricingLoading ||
   pooledPricingError !==
     null ||
   pooledPricing ===
     null ||
   pooledPricing.status ===
     "disabled" ||
   pooledPricing.status ===
     "undetermined";

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

     <section
       className="
         border-b
         border-[#EAE1D7]
         px-[17px]
         py-[15px]
       ">

       <p
         className="
           text-[10px]
           font-medium
           text-[#716A63]
         ">

         Your Plan
       </p>

       <div
         className="
           mt-[5px]
           flex
           items-center
           justify-between
           gap-3
         ">

         <h3
           className="
             font-serif
             text-[18px]
             font-semibold
             text-[#7D0E1C]
           ">

           {selectedPlan.name} Plan
         </h3>

         <p
           className="
             shrink-0
             text-[12px]
             font-bold
             text-[#7D0E1C]
           ">

           {formatPrice(
             selectedPlan
               .monthlyPrice
           )} / month
         </p>
       </div>

       <div
         className="
           mt-[12px]
           flex
           items-center
           gap-2
           text-[#706963]
         ">

         <PlanIcon />

         <p
           className="
             text-[10.5px]
             font-medium
           ">

           {items.length} of{" "}
           {selectedPlan.supplementLimit} supplements selected
         </p>
       </div>

       <p
         className="
           mt-[10px]
           text-[9.5px]
           font-medium
           text-[#77706A]
         ">

         Plan selection progress
       </p>

       <div
         className="
           mt-[6px]
           h-[8px]
           overflow-hidden
           rounded-full
           bg-[#EDE4DC]
         ">

         <div
           className="
             h-full
             rounded-full
             bg-[#8C1D40]
             transition-[width]
             duration-300
           "
           style={{
             width:
               `${progressPercentage}%`,
           }}
         />
       </div>
     </section>

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
       <div
         className="
           border-t
           border-[#EAE1D7]
         "
       />
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

     <div
       className="
         border-t
         border-[#EAE1D7]
       "
     />

     <section
       className="
         px-[17px]
         py-[15px]
       ">

       <PooledPricingSummary
         pricing={
           pooledPricing
         }
         loading={
           pooledPricingLoading
         }
         error={
           pooledPricingError
         }
       />

       <div
         className="
           my-[13px]
           border-t
           border-[#E5DCD2]
         "
       />

       <ShippingRow />

       <button
         type="button"

         onClick={
          handleCheckoutReview
         }



         disabled={
           checkoutDisabled
         }
         title={
           checkoutDisabled
             ? "Your current monthly total must be available before checkout."
             : undefined
         }
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
           disabled:cursor-not-allowed
           disabled:bg-[#B7AAA6]
           disabled:text-[#F7F3F1]
         ">

         {pooledPricingLoading
           ? "Updating Monthly Total…"
           : "Review Pouches & Checkout"}
       </button>

       {checkoutDisabled && (
         <div
           className="
             mt-[10px]
             flex
             items-start
             gap-1.5
             text-[#766F69]
           ">

           <span
             className="
               mt-[1px]
               shrink-0
             ">

             <InfoIcon />
           </span>

           <p
             className="
               text-[9px]
               leading-[1.45]
             ">

             {items.length ===
             0
               ? "Add at least one supplement to continue."
               : "Checkout will become available after the complete pouch price is calculated."}
           </p>
         </div>
       )}

       <div
         className="
           mt-[12px]
           flex
           items-center
           justify-center
           gap-2
           text-[#716A63]
         ">

         <ShieldIcon />

         <p className="text-[10px]">
           Secure, private, and personalized.
         </p>
       </div>
     </section>

     <div
       className="
         border-t
         border-[#EAE1D7]
       "
     />

     <section
       className="
         px-[17px]
         py-[14px]
       ">

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