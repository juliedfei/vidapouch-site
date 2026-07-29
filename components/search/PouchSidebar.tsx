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
  SearchPouchPurchaseOption,
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

   purchaseOption:
   SearchPouchPurchaseOption;
  
  onPurchaseOptionChange: (
   purchaseOption:
     SearchPouchPurchaseOption
  ) => void;



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

type VidaPouchSalesMode =
 | "STRIPE"
 | "WAITLIST"
 | "PAUSED";



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
  purchaseOption,
  onPurchaseOptionChange,
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


   const [
    salesMode,
    setSalesMode,
   ] = useState<VidaPouchSalesMode | null>(
    null
   );
   
   const [
    salesModeLoading,
    setSalesModeLoading,
   ] = useState(
    true
   );
   



   const [
    salesModeError,
    setSalesModeError,
   ] = useState<string | null>(
    null
   );


   const [
    waitlistFormOpen,
    setWaitlistFormOpen,
   ] = useState(
    false
   );
   
   const [
    waitlistName,
    setWaitlistName,
   ] = useState(
    ""
   );
   
   const [
    waitlistEmail,
    setWaitlistEmail,
   ] = useState(
    ""
   );
   
   const [
    waitlistPhone,
    setWaitlistPhone,
   ] = useState(
    ""
   );
   
   const [
    waitlistSubmitting,
    setWaitlistSubmitting,
   ] = useState(
    false
   );
   
   const [
    waitlistSuccess,
    setWaitlistSuccess,
   ] = useState(
    false
   );
   
   const [
    waitlistError,
    setWaitlistError,
   ] = useState<string | null>(
    null
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


 useEffect(
  () => {
    let isActive =
      true;
 
    async function loadSalesMode() {
      try {
        const response =
          await fetch(
            "/api/commerce-mode",
            {
              method:
                "GET",
 
              cache:
                "no-store",
            }
          );
 
        const data =
          await response.json() as {
            salesMode?:
              VidaPouchSalesMode;
 
            error?:
              string;
          };
 
        if (
          !response.ok ||
          !data.salesMode
        ) {
          throw new Error(
            data.error ??
            "Unable to load the current sales mode."
          );
        }
 
        if (
          isActive
        ) {
          setSalesMode(
            data.salesMode
          );
 
          setSalesModeError(
            null
          );
        }
      } catch (
        error
      ) {
        if (
          isActive
        ) {
          setSalesModeError(
            error instanceof Error
              ? error.message
              : "Unable to load the current sales mode."
          );
        }
      } finally {
        if (
          isActive
        ) {
          setSalesModeLoading(
            false
          );
        }
      }
    }
 
    void loadSalesMode();
 
    return () => {
      isActive =
        false;
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





async function handleCheckoutReview() {
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

 try {
   const response =
     await fetch(
       "/api/checkout",
       {
         method:
           "POST",

         headers: {
           "Content-Type":
             "application/json",
         },



         body:
         JSON.stringify({
          plan:
            selectedPlan.id,
         
          purchaseOption,
         
          pouchItems:
            items,
         }),
         



       }
     );

   const data =
     await response.json();

   if (
     !response.ok ||
     typeof data.url !==
       "string"
   ) {
     throw new Error(
       data.error ??
         "Unable to start checkout."
     );
   }

   window.location.href =
     data.url;
 } catch (
   error
 ) {
   console.error(
     "Unable to start Stripe checkout:",
     error
   );

   window.alert(
     "Checkout could not be started. Please try again."
   );
 }
}
 

async function handleWaitlistSubmit() {
  setWaitlistError(
    null
  );
 
  if (
    waitlistEmail
      .trim()
      .length ===
      0
  ) {
    setWaitlistError(
      "Please enter your email address."
    );
 
    return;
  }
 
  setWaitlistSubmitting(
    true
  );
 
  try {
    const response =
      await fetch(
        "/api/waitlist",
        {
          method:
            "POST",
 
          headers: {
            "Content-Type":
              "application/json",
          },
 
          body:
            JSON.stringify({
              plan:
                selectedPlan.id,
 
              purchaseOption,
 
              pouchItems:
                items,
 
              customerName:
                waitlistName,
 
              customerEmail:
                waitlistEmail,
 
              customerPhone:
                waitlistPhone,
            }),
        }
      );
 
    const data =
      await response.json() as {
        success?:
          boolean;
 
        waitlistEntryId?:
          string;
 
        error?:
          string;
      };
 
    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ??
        "Unable to join the VidaPouch waitlist."
      );
    }
 
    setWaitlistSuccess(
      true
    );
 
    setWaitlistFormOpen(
      false
    );
  } catch (
    error
  ) {
    setWaitlistError(
      error instanceof Error
        ? error.message
        : "Unable to join the VidaPouch waitlist."
    );
  } finally {
    setWaitlistSubmitting(
      false
    );
  }
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


<div className="mt-[14px]">
 <p
   className="
     text-[11px]
     font-semibold
     text-[#302A26]
   ">

   Purchase option
 </p>

 <div
   className="
     mt-[8px]
     grid
     gap-2
   ">

   <button
     type="button"
     onClick={
       () =>
         onPurchaseOptionChange(
           "one-time"
         )
     }
     aria-pressed={
       purchaseOption ===
       "one-time"
     }
     className={`
       w-full
       rounded-[9px]
       border
       px-3
       py-3
       text-left
       transition
       ${
         purchaseOption ===
         "one-time"
           ? "border-[#7D0E1C] bg-[#FFF8F6]"
           : "border-[#DED4CA] bg-white hover:border-[#BFA99A]"
       }
     `}>

     <div
       className="
         flex
         items-start
         gap-2.5
       ">

       <span
         className={`
           mt-[1px]
           flex
           h-[16px]
           w-[16px]
           shrink-0
           items-center
           justify-center
           rounded-full
           border
           ${
             purchaseOption ===
             "one-time"
               ? "border-[#7D0E1C]"
               : "border-[#BEB4AC]"
           }
         `}>

         {purchaseOption ===
           "one-time" && (
           <span
             className="
               h-[8px]
               w-[8px]
               rounded-full
               bg-[#7D0E1C]
             "
           />
         )}
       </span>

       <span className="min-w-0">
         <span
           className="
             block
             text-[11px]
             font-semibold
             text-[#302A26]
           ">

           One-time 30-day supply
         </span>

         <span
           className="
             mt-[2px]
             block
             text-[9.5px]
             leading-[14px]
             text-[#716A63]
           ">

           Charged once. No automatic renewal.
         </span>
       </span>
     </div>
   </button>

   <button
     type="button"
     onClick={
       () =>
         onPurchaseOptionChange(
           "subscription"
         )
     }
     aria-pressed={
       purchaseOption ===
       "subscription"
     }
     className={`
       w-full
       rounded-[9px]
       border
       px-3
       py-3
       text-left
       transition
       ${
         purchaseOption ===
         "subscription"
           ? "border-[#7D0E1C] bg-[#FFF8F6]"
           : "border-[#DED4CA] bg-white hover:border-[#BFA99A]"
       }
     `}>

     <div
       className="
         flex
         items-start
         gap-2.5
       ">

       <span
         className={`
           mt-[1px]
           flex
           h-[16px]
           w-[16px]
           shrink-0
           items-center
           justify-center
           rounded-full
           border
           ${
             purchaseOption ===
             "subscription"
               ? "border-[#7D0E1C]"
               : "border-[#BEB4AC]"
           }
         `}>

         {purchaseOption ===
           "subscription" && (
           <span
             className="
               h-[8px]
               w-[8px]
               rounded-full
               bg-[#7D0E1C]
             "
           />
         )}
       </span>

       <span className="min-w-0">
         <span
           className="
             block
             text-[11px]
             font-semibold
             text-[#302A26]
           ">

           Subscribe monthly
         </span>

         <span
           className="
             mt-[2px]
             block
             text-[9.5px]
             leading-[14px]
             text-[#716A63]
           ">

           Renews monthly at the same price. Cancel anytime.
         </span>
       </span>
     </div>
   </button>
 </div>
</div>






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
 onClick={() => {
   if (
     salesMode ===
       "STRIPE"
   ) {
     void handleCheckoutReview();

     return;
   }

   if (
     salesMode ===
       "WAITLIST"
   ) {
     setWaitlistFormOpen(
       true
     );

     setWaitlistError(
       null
     );

     return;
   }
 }}







 disabled={
  checkoutDisabled ||
  salesModeLoading ||
  salesModeError !==
    null ||
  salesMode ===
    null ||
  salesMode ===
    "PAUSED"
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
 : salesModeLoading
   ? "Loading…"
   : salesMode ===
       "WAITLIST"
     ? "Reserve My VidaPouch"
     : salesMode ===
         "PAUSED"
       ? "Orders Temporarily Paused"
       : "Review Pouches & Checkout"}

       </button>


       {waitlistFormOpen && (
 <div className="mt-[14px] rounded-[10px] border border-[#DED4CA] bg-white p-4">
   <p className="text-[12px] font-semibold text-[#302A26]">
     Reserve your VidaPouch
   </p>

   <p className="mt-1 text-[10px] leading-[15px] text-[#716A63]">
     Enter your contact information. We will save your selected plan and complete supplement routine without charging you.
   </p>

   <label
     htmlFor="waitlist-name"
     className="mt-4 block text-[10px] font-semibold text-[#302A26]">

     Name
   </label>

   <input
     id="waitlist-name"
     type="text"
     autoComplete="name"
     value={
       waitlistName
     }
     onChange={(
       event
     ) => {
       setWaitlistName(
         event.target.value
       );
     }}
     className="mt-1.5 w-full rounded-[8px] border border-[#CFC3B7] px-3 py-2.5 text-[11px] text-[#302A26] outline-none focus:border-[#7D0E1C]"
     placeholder="Your name"
   />

   <label
     htmlFor="waitlist-email"
     className="mt-3 block text-[10px] font-semibold text-[#302A26]">

     Email address
   </label>

   <input
     id="waitlist-email"
     type="email"
     autoComplete="email"
     required
     value={
       waitlistEmail
     }
     onChange={(
       event
     ) => {
       setWaitlistEmail(
         event.target.value
       );
     }}
     className="mt-1.5 w-full rounded-[8px] border border-[#CFC3B7] px-3 py-2.5 text-[11px] text-[#302A26] outline-none focus:border-[#7D0E1C]"
     placeholder="you@example.com"
   />

   <label
     htmlFor="waitlist-phone"
     className="mt-3 block text-[10px] font-semibold text-[#302A26]">

     Phone number
   </label>

   <input
     id="waitlist-phone"
     type="tel"
     autoComplete="tel"
     value={
       waitlistPhone
     }
     onChange={(
       event
     ) => {
       setWaitlistPhone(
         event.target.value
       );
     }}
     className="mt-1.5 w-full rounded-[8px] border border-[#CFC3B7] px-3 py-2.5 text-[11px] text-[#302A26] outline-none focus:border-[#7D0E1C]"
     placeholder="Optional"
   />

   {waitlistError ? (
     <p className="mt-3 text-[10px] leading-[15px] text-red-700">
       {waitlistError}
     </p>
   ) : null}

   <div className="mt-4 grid grid-cols-2 gap-2">
     <button
       type="button"
       disabled={
         waitlistSubmitting
       }
       onClick={() => {
         setWaitlistFormOpen(
           false
         );

         setWaitlistError(
           null
         );
       }}
       className="rounded-[8px] border border-[#CFC3B7] bg-white px-3 py-2.5 text-[11px] font-semibold text-[#302A26] disabled:opacity-60">

       Cancel
     </button>

     <button
       type="button"
       disabled={
         waitlistSubmitting
       }
       onClick={() => {
         void handleWaitlistSubmit();
       }}
       className="rounded-[8px] bg-[#7D0E1C] px-3 py-2.5 text-[11px] font-semibold text-white disabled:opacity-60">

       {waitlistSubmitting
         ? "Saving..."
         : "Join waitlist"}
     </button>
   </div>
 </div>
)}

{waitlistSuccess && (
 <div
   role="status"
   className="mt-[12px] rounded-[9px] border border-green-200 bg-green-50 px-3 py-3 text-[10px] leading-[15px] text-green-800">

   Your VidaPouch routine has been saved. We will contact you before any payment is collected.
 </div>
)}






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