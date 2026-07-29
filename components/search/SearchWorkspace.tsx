"use client";

import type {
 CSSProperties,
} from "react";

import {
 useEffect,
 useMemo,
 useState,
} from "react";

import type {
 SearchLayoutState,
} from "./types/searchLayout";

import {
 DEFAULT_SEARCH_FILTERS,
} from "./types/searchFilters";

import type {
 SearchFilterState,
} from "./types/searchFilters";

import type {
 SearchPouchItem,
 SearchPouchPurchaseOption,
 SearchPouchTimingPreference,
} from "./types/searchPouch";

import {
 DEFAULT_SEARCH_PLAN_ID,
 getRequiredSearchPlan,
 getSearchPlan,
 SEARCH_PLANS,
} from "./types/searchPlan";

import type {
 SearchPlanId,
 SearchPlanSelection,
} from "./types/searchPlan";

import TrustBar from "./TrustBar";
import SearchControls from "./SearchControls";
import SearchResults from "./SearchResults";
import PouchSidebar from "./PouchSidebar";
import MobileFilterSheet from "./MobileFilterSheet";

import {
 usePooledPouchPricing,
} from "./usePooledPouchPricing";

type SearchWorkspaceProps = {
 query:
   string;
};

const POUCH_SESSION_STORAGE_KEY =
 "vidapouch-checkout-state-v1";

function PouchIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[20px] w-[20px]">

     <path
       d="M7.5 4.5h9l1 3v11H6.5v-11l1-3Z"
       stroke="currentColor"
       strokeWidth="1.7"
       strokeLinejoin="round"
     />

     <path
       d="M7 8h10"
       stroke="currentColor"
       strokeWidth="1.7"
       strokeLinecap="round"
     />
   </svg>
 );
}

function FilterIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[18px] w-[18px]">

     <path
       d="M4 7h16M7 12h10M10 17h4"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
     />
   </svg>
 );
}

function LeftChevronIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[17px] w-[17px]">

     <path
       d="m14.5 7-5 5 5 5"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function RightChevronIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[17px] w-[17px]">

     <path
       d="m9.5 7 5 5-5 5"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function CloseIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[20px] w-[20px]">

     <path
       d="m7 7 10 10M17 7 7 17"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
     />
   </svg>
 );
}

function WarningIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[23px] w-[23px]">

     <path
       d="M12 3.5 21 19H3L12 3.5Z"
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinejoin="round"
     />

     <path
       d="M12 9v4.5M12 16.5h.01"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
     />
   </svg>
 );
}

export default function SearchWorkspace({
 query,
}: SearchWorkspaceProps) {
 const [
   layout,
   setLayout,
 ] =
   useState<SearchLayoutState>({
     hasSearched:
       false,

     filtersOpen:
       false,

     pouchOpen:
       false,

     hasPouchItems:
       false,
   });

 const [
   mobilePouchOpen,
   setMobilePouchOpen,
 ] =
   useState(
     false
   );

 const [
   mobileFiltersOpen,
   setMobileFiltersOpen,
 ] =
   useState(
     false
   );

 const [
   filters,
   setFilters,
 ] =
   useState<SearchFilterState>(
     DEFAULT_SEARCH_FILTERS
   );

 const [
   availableBrands,
   setAvailableBrands,
 ] =
   useState<string[]>(
     []
   );

 const [
   pouchItems,
   setPouchItems,
 ] =
   useState<SearchPouchItem[]>(
     []
   );

 const [
   pouchStateRestored,
   setPouchStateRestored,
 ] =
   useState(
     false
   );

 const [
   selectedPlanId,
   setSelectedPlanId,
 ] =
   useState<SearchPlanSelection>(
     DEFAULT_SEARCH_PLAN_ID
   );

 const [
   purchaseOption,
   setPurchaseOption,
 ] =
   useState<SearchPouchPurchaseOption>(
     "one-time"
   );

 const [
   deselectConfirmationOpen,
   setDeselectConfirmationOpen,
 ] =
   useState(
     false
   );

 const selectedPlan =
   getSearchPlan(
     selectedPlanId
   );

 const defaultStartingPlan =
   SEARCH_PLANS[0] ??
   null;

 const {
   pricing:
     pooledPricing,

   loading:
     pooledPricingLoading,

   error:
     pooledPricingError,
 } =
   usePooledPouchPricing({
     selectedPlanId,

     pouchItems,
   });

 const largestPlan =
   SEARCH_PLANS[
     SEARCH_PLANS.length -
       1
   ];

 const pouchTimingCounts =
   useMemo(
     () => {
       return pouchItems.reduce(
         (
           counts,
           item
         ) => {
           if (
             item.timing ===
             "morning"
           ) {
             counts.morning +=
               1;
           } else if (
             item.timing ===
             "evening"
           ) {
             counts.evening +=
               1;
           }

           return counts;
         },
         {
           morning:
             0,

           evening:
             0,
         }
       );
     },
     [
       pouchItems,
     ]
   );

 useEffect(
   () => {
     try {
       const savedState =
         window.sessionStorage.getItem(
           POUCH_SESSION_STORAGE_KEY
         );

       if (
         !savedState
       ) {
         setPouchStateRestored(
           true
         );

         return;
       }

       const parsedState =
         JSON.parse(
           savedState
         ) as {
           pouchItems?:
             SearchPouchItem[];

           selectedPlanId?:
             SearchPlanSelection;

           purchaseOption?:
             SearchPouchPurchaseOption;
         };

       if (
         Array.isArray(
           parsedState.pouchItems
         )
       ) {
         setPouchItems(
           parsedState.pouchItems
         );

         if (
           parsedState.pouchItems.length >
             0
         ) {
           setLayout(
             (current) => ({
               ...current,

               hasPouchItems:
                 true,

               pouchOpen:
                 true,
             })
           );
         }
       }

       if (
         parsedState.selectedPlanId ===
           null ||
         typeof parsedState.selectedPlanId ===
           "string"
       ) {
         setSelectedPlanId(
           parsedState.selectedPlanId
         );
       }

       if (
         parsedState.purchaseOption ===
           "one-time" ||
         parsedState.purchaseOption ===
           "subscription"
       ) {
         setPurchaseOption(
           parsedState.purchaseOption
         );
       }
     } catch (
       error
     ) {
       console.error(
         "Unable to restore saved VidaPouch state:",
         error
       );

       window.sessionStorage.removeItem(
         POUCH_SESSION_STORAGE_KEY
       );
     } finally {
       setPouchStateRestored(
         true
       );
     }
   },
   []
 );

 useEffect(
   () => {
     if (
       !pouchStateRestored
     ) {
       return;
     }

     try {
       window.sessionStorage.setItem(
         POUCH_SESSION_STORAGE_KEY,

         JSON.stringify({
           pouchItems,

           selectedPlanId,

           purchaseOption,
         })
       );
     } catch (
       error
     ) {
       console.error(
         "Unable to save VidaPouch state:",
         error
       );
     }
   },
   [
     pouchItems,
     selectedPlanId,
     purchaseOption,
     pouchStateRestored,
   ]
 );

 useEffect(
   () => {
     if (
       !deselectConfirmationOpen &&
       !mobilePouchOpen &&
       !mobileFiltersOpen
     ) {
       return;
     }

     function handleKeyDown(
       event:
         KeyboardEvent
     ) {
       if (
         event.key !==
         "Escape"
       ) {
         return;
       }

       if (
         deselectConfirmationOpen
       ) {
         setDeselectConfirmationOpen(
           false
         );

         return;
       }

       if (
         mobilePouchOpen
       ) {
         setMobilePouchOpen(
           false
         );

         return;
       }

       setMobileFiltersOpen(
         false
       );
     }

     window.addEventListener(
       "keydown",
       handleKeyDown
     );

     return () => {
       window.removeEventListener(
         "keydown",
         handleKeyDown
       );
     };
   },
   [
     deselectConfirmationOpen,
     mobilePouchOpen,
     mobileFiltersOpen,
   ]
 );

 useEffect(
   () => {
     if (
       !mobilePouchOpen &&
       !mobileFiltersOpen
     ) {
       return;
     }

     const previousOverflow =
       document.body.style.overflow;

     document.body.style.overflow =
       "hidden";

     return () => {
       document.body.style.overflow =
         previousOverflow;
     };
   },
   [
     mobilePouchOpen,
     mobileFiltersOpen,
   ]
 );

 function toggleFilters() {
   setLayout(
     (current) => ({
       ...current,

       filtersOpen:
         !current.filtersOpen,
     })
   );
 }

 function toggleDesktopPouch() {
   setLayout(
     (current) => ({
       ...current,

       pouchOpen:
         !current.pouchOpen,
     })
   );
 }

 function openMobilePouch() {
   setMobileFiltersOpen(
     false
   );

   setMobilePouchOpen(
     true
   );
 }

 function closeMobilePouch() {
   setMobilePouchOpen(
     false
   );
 }

 function openMobileFilters() {
   setMobilePouchOpen(
     false
   );

   setMobileFiltersOpen(
     true
   );
 }

 function closeMobileFilters() {
   setMobileFiltersOpen(
     false
   );
 }

 function clearPouchAndPlan() {
   setSelectedPlanId(
     null
   );

   setPouchItems(
     []
   );

   setLayout(
     (current) => ({
       ...current,

       hasPouchItems:
         false,

       pouchOpen:
         false,
     })
   );

   setMobilePouchOpen(
     false
   );

   setDeselectConfirmationOpen(
     false
   );
 }

 function cancelPlanDeselection() {
   setDeselectConfirmationOpen(
     false
   );
 }

 function changePlan(
   planId:
     SearchPlanId
 ) {
   if (
     selectedPlanId ===
     planId
   ) {
     if (
       pouchItems.length >
       0
     ) {
       setDeselectConfirmationOpen(
         true
       );

       return;
     }

     setSelectedPlanId(
       null
     );

     return;
   }

   const requestedPlan =
     getSearchPlan(
       planId
     );

   if (
     requestedPlan ===
     null
   ) {
     return;
   }

   if (
     pouchItems.length >
     requestedPlan
       .supplementLimit
   ) {
     return;
   }

   setSelectedPlanId(
     planId
   );
 }

 function addPouchItem(
   item:
     SearchPouchItem
 ) {
   const activePlan =
     selectedPlan ??
     defaultStartingPlan;

   if (
     activePlan ===
     null
   ) {
     return;
   }

   setPouchItems(
     (currentItems) => {
       const alreadyAdded =
         currentItems.some(
           (currentItem) =>
             currentItem.id ===
             item.id
         );

       if (
         alreadyAdded
       ) {
         return currentItems;
       }

       const nextSupplementCount =
         currentItems.length +
         1;

       if (
         !largestPlan ||
         nextSupplementCount >
         largestPlan
           .supplementLimit
       ) {
         return currentItems;
       }

       const requiredPlan =
         getRequiredSearchPlan(
           nextSupplementCount
         );

       if (
         requiredPlan ===
         null
       ) {
         return currentItems;
       }

       if (
         selectedPlan ===
         null
       ) {
         setSelectedPlanId(
           requiredPlan.id
         );
       } else if (
         nextSupplementCount >
         activePlan
           .supplementLimit
       ) {
         setSelectedPlanId(
           requiredPlan.id
         );
       }

       return [
         ...currentItems,
         item,
       ];
     }
   );

   setLayout(
     (current) => ({
       ...current,

       hasPouchItems:
         true,

       pouchOpen:
         true,
     })
   );
 }

 function removePouchItem(
   itemId:
     string
 ) {
   setPouchItems(
     (currentItems) => {
       const nextItems =
         currentItems.filter(
           (item) =>
             item.id !==
             itemId
         );

       if (
         nextItems.length ===
         0
       ) {
         setLayout(
           (current) => ({
             ...current,

             hasPouchItems:
               false,

             pouchOpen:
               false,
           })
         );

         setMobilePouchOpen(
           false
         );
       }

       return nextItems;
     }
   );
 }

 function updatePouchItemTiming(
   itemId:
     string,

   timingPreference:
     SearchPouchTimingPreference
 ) {
   setPouchItems(
     (currentItems) =>
       currentItems.map(
         (item) => {
           if (
             item.id !==
             itemId
           ) {
             return item;
           }

           if (
             timingPreference ===
             "vidapouch"
           ) {
             return {
               ...item,

               timing:
                 item
                   .recommendedTiming,

               timingPreference:
                 "vidapouch",
             };
           }

           return {
             ...item,

             timing:
               timingPreference,

             timingPreference,
           };
         }
       )
   );
 }

 const filterWidth =
   layout.filtersOpen
     ? "290px"
     : "52px";

 const pouchWidth =
   layout.hasPouchItems &&
   layout.pouchOpen
     ? "340px"
     : "52px";

 const desktopGridColumns =
   layout.hasPouchItems
     ? `${filterWidth} minmax(0, 1fr) ${pouchWidth}`
     : `${filterWidth} minmax(0, 1fr)`;

 const workspaceStyle = {
   "--workspace-columns":
     desktopGridColumns,
 } as CSSProperties;

 const pouchItemLabel =
   pouchItems.length ===
   1
     ? "supplement"
     : "supplements";

 const mobilePouchVisible =
   layout.hasPouchItems &&
   selectedPlan !==
     null;

 return (
   <>
     <section
       className="
         mx-auto
         max-w-[1440px]
         px-5
         py-8
         lg:px-10
       ">

       <div className="mt-6">
         <TrustBar />
       </div>

       <div
         className="
           mt-6
           grid
           grid-cols-1
           items-start
           gap-4
           transition-[grid-template-columns]
           duration-300
           ease-in-out
           lg:[grid-template-columns:var(--workspace-columns)]
         "
         style={
           workspaceStyle
         }>

         <aside
           className="
             hidden
             min-w-0
             w-full
             self-start
             lg:sticky
             lg:top-[96px]
             lg:block
           ">

           <div
             className="
               lg:max-h-[calc(100dvh-112px)]
               lg:overflow-y-auto
               lg:overscroll-contain
             ">

             <SearchControls
               open={
                 layout.filtersOpen
               }
               onToggle={
                 toggleFilters
               }
               filters={
                 filters
               }
               onFiltersChange={
                 setFilters
               }
               availableBrands={
                 availableBrands
               }
             />
           </div>
         </aside>

         <section
           className={`
             min-w-0
             ${
               mobilePouchVisible
                 ? "pb-28"
                 : ""
             }
             lg:pb-0
           `}>

           <div
             className="
               mb-4
               lg:hidden
             ">

             <button
               type="button"
               onClick={
                 openMobileFilters
               }
               aria-haspopup="dialog"
               aria-expanded={
                 mobileFiltersOpen
               }
               className="
                 flex
                 min-h-[48px]
                 w-full
                 items-center
                 justify-center
                 gap-2
                 rounded-[10px]
                 border
                 border-[#DCCFC3]
                 bg-white
                 px-4
                 text-[13px]
                 font-semibold
                 text-[#74101D]
                 shadow-[0_2px_8px_rgba(54,38,20,0.04)]
                 transition
                 hover:border-[#CDB9A9]
                 hover:bg-[#FBF8F3]
                 focus:outline-none
                 focus-visible:ring-2
                 focus-visible:ring-[#7D0E1C]
                 focus-visible:ring-offset-2
               ">

               <FilterIcon />
               Filters
             </button>
           </div>

           <SearchResults
             query={
               query
             }
             filters={
               filters
             }
             onFiltersChange={
               setFilters
             }
             onAvailableBrandsChange={
               setAvailableBrands
             }
             pouchItems={
               pouchItems
             }
             onAddToPouch={
               addPouchItem
             }
             selectedPlanId={
               selectedPlanId
             }
             selectedPlan={
               selectedPlan
             }
             onPlanChange={
               changePlan
             }
           />
         </section>

         {layout.hasPouchItems &&
           selectedPlan !==
             null && (
             <aside
               className="
                 hidden
                 min-w-0
                 self-start
                 lg:sticky
                 lg:top-[96px]
                 lg:block
               ">

               <div
                 className="
                   max-h-[calc(100dvh-112px)]
                   overflow-hidden
                   rounded-[12px]
                   border
                   border-[#E7DED3]
                   bg-[#FBF8F3]
                   shadow-[0_2px_10px_rgba(54,38,20,0.025)]
                 ">

                 {layout.pouchOpen ? (
                   <div
                     className="
                       flex
                       max-h-[calc(100dvh-112px)]
                       min-w-[340px]
                       flex-col
                     ">

                     <button
                       type="button"
                       onClick={
                         toggleDesktopPouch
                       }
                       aria-expanded="true"
                       aria-label="Collapse My Pouch"
                       className="
                         flex
                         h-[52px]
                         w-full
                         shrink-0
                         items-center
                         justify-between
                         border-b
                         border-[#E7DED3]
                         bg-[#FBF8F3]
                         px-4
                         text-[#302D29]
                         transition
                         hover:bg-[#F5EFE8]
                       ">

                       <span
                         className="
                           flex
                           items-center
                           gap-2
                           text-[13px]
                           font-semibold
                         ">

                         <PouchIcon />
                         My Pouch
                       </span>

                       <RightChevronIcon />
                     </button>

                     <div
                       className="
                         min-h-0
                         overflow-y-auto
                         overscroll-contain
                         p-3
                       ">

                       <PouchSidebar
                         items={
                           pouchItems
                         }
                         selectedPlan={
                           selectedPlan
                         }
                         pooledPricing={
                           pooledPricing
                         }
                         pooledPricingLoading={
                           pooledPricingLoading
                         }
                         pooledPricingError={
                           pooledPricingError
                         }
                         purchaseOption={
                           purchaseOption
                         }
                         onPurchaseOptionChange={
                           setPurchaseOption
                         }
                         onRemoveItem={
                           removePouchItem
                         }
                         onTimingChange={
                           updatePouchItemTiming
                         }
                       />
                     </div>
                   </div>
                 ) : (
                   <button
                     type="button"
                     onClick={
                       toggleDesktopPouch
                     }
                     aria-expanded="false"
                     aria-label="Open My Pouch"
                     className="
                       flex
                       min-h-[calc(100dvh-112px)]
                       w-[52px]
                       flex-col
                       items-center
                       gap-3
                       pt-4
                       text-[#74101D]
                       transition
                       hover:bg-[#F5EFE8]
                     ">

                     <PouchIcon />

                     <span
                       className="
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

                       {pouchItems.length}
                     </span>

                     <span
                       className="
                         [writing-mode:vertical-rl]
                         text-[10px]
                         font-bold
                         tracking-[0.12em]
                       ">

                       MY POUCH
                     </span>

                     <LeftChevronIcon />
                   </button>
                 )}
               </div>
             </aside>
           )}
       </div>
     </section>

     <MobileFilterSheet
       open={
         mobileFiltersOpen
       }
       onClose={
         closeMobileFilters
       }
       filters={
         filters
       }
       onFiltersChange={
         setFilters
       }
       availableBrands={
         availableBrands
       }
     />

     {mobilePouchVisible && (
       <div
         className="
           fixed
           inset-x-0
           bottom-0
           z-[70]
           border-t
           border-[#DDD2C7]
           bg-white/95
           px-4
           pt-3
           pb-[calc(12px+env(safe-area-inset-bottom))]
           shadow-[0_-10px_30px_rgba(35,25,18,0.12)]
           backdrop-blur-md
           lg:hidden
         ">

         <button
           type="button"
           onClick={
             openMobilePouch
           }
           aria-haspopup="dialog"
           aria-expanded={
             mobilePouchOpen
           }
           className="
             mx-auto
             flex
             min-h-[58px]
             w-full
             max-w-[640px]
             items-center
             justify-between
             gap-4
             rounded-[12px]
             border
             border-[#E3D8CD]
             bg-[#FBF8F3]
             px-4
             py-3
             text-left
             shadow-[0_4px_18px_rgba(45,30,20,0.08)]
             transition
             hover:border-[#D4C2B4]
             hover:bg-[#F8F2EB]
             focus:outline-none
             focus-visible:ring-2
             focus-visible:ring-[#7D0E1C]
             focus-visible:ring-offset-2
           ">

           <span
             className="
               flex
               min-w-0
               items-center
               gap-3
             ">

             <span
               className="
                 relative
                 flex
                 h-[38px]
                 w-[38px]
                 shrink-0
                 items-center
                 justify-center
                 rounded-full
                 bg-[#F1E4DE]
                 text-[#7D0E1C]
               ">

               <PouchIcon />

               <span
                 className="
                   absolute
                   -right-1.5
                   -top-1.5
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

                 {pouchItems.length}
               </span>
             </span>

             <span className="min-w-0">
               <span
                 className="
                   block
                   truncate
                   text-[13px]
                   font-semibold
                   text-[#302D29]
                 ">

                 Your VidaPouch ·{" "}
                 {pouchItems.length}{" "}
                 {pouchItemLabel}
               </span>

               <span
                 className="
                   mt-0.5
                   block
                   truncate
                   text-[11px]
                   text-[#6D7476]
                 ">

                 {pouchTimingCounts.morning} Morning
                 {" · "}
                 {pouchTimingCounts.evening} Evening
               </span>
             </span>
           </span>

           <span
             className="
               flex
               shrink-0
               items-center
               gap-1
               text-[12px]
               font-semibold
               text-[#7D0E1C]
             ">

             View
             <RightChevronIcon />
           </span>
         </button>
       </div>
     )}

     {mobilePouchVisible &&
       mobilePouchOpen && (
         <div
           className="
             fixed
             inset-0
             z-[90]
             bg-[rgba(16,20,22,0.5)]
             backdrop-blur-[2px]
             lg:hidden
           "
           role="presentation"
           onMouseDown={
             closeMobilePouch
           }>

           <section
             role="dialog"
             aria-modal="true"
             aria-labelledby="mobile-pouch-title"
             onMouseDown={
               (event) =>
                 event.stopPropagation()
             }
             className="
               absolute
               inset-x-0
               bottom-0
               flex
               max-h-[92dvh]
               flex-col
               overflow-hidden
               rounded-t-[24px]
               border-t
               border-[#E3D8CD]
               bg-[#FBF8F3]
               shadow-[0_-24px_70px_rgba(24,17,12,0.3)]
             ">

             <div
               className="
                 flex
                 shrink-0
                 flex-col
                 border-b
                 border-[#E7DED3]
                 bg-[#FBF8F3]
                 px-5
                 pb-4
                 pt-3
               ">

               <div
                 className="
                   mx-auto
                   mb-3
                   h-[5px]
                   w-[44px]
                   rounded-full
                   bg-[#D8CDC3]
                 "
                 aria-hidden="true"
               />

               <div
                 className="
                   flex
                   items-center
                   justify-between
                   gap-4
                 ">

                 <div
                   className="
                     flex
                     min-w-0
                     items-center
                     gap-3
                   ">

                   <span
                     className="
                       flex
                       h-[40px]
                       w-[40px]
                       shrink-0
                       items-center
                       justify-center
                       rounded-full
                       bg-[#F1E4DE]
                       text-[#7D0E1C]
                     ">

                     <PouchIcon />
                   </span>

                   <div className="min-w-0">
                     <h2
                       id="mobile-pouch-title"
                       className="
                         truncate
                         text-[20px]
                         leading-tight
                         text-[#281D1A]
                       "
                       style={{
                         fontFamily:
                           'Georgia, "Times New Roman", serif',
                       }}>

                       Your VidaPouch
                     </h2>

                     <p
                       className="
                         mt-1
                         text-[11px]
                         text-[#6D7476]
                       ">

                       {pouchItems.length}{" "}
                       {pouchItemLabel}
                       {" · "}
                       {pouchTimingCounts.morning} Morning
                       {" · "}
                       {pouchTimingCounts.evening} Evening
                     </p>
                   </div>
                 </div>

                 <button
                   type="button"
                   onClick={
                     closeMobilePouch
                   }
                   aria-label="Close Your VidaPouch"
                   className="
                     flex
                     h-[40px]
                     w-[40px]
                     shrink-0
                     items-center
                     justify-center
                     rounded-full
                     border
                     border-[#DED3C9]
                     bg-white
                     text-[#413B36]
                     transition
                     hover:bg-[#F5EFE8]
                     focus:outline-none
                     focus-visible:ring-2
                     focus-visible:ring-[#7D0E1C]
                     focus-visible:ring-offset-2
                   ">

                   <CloseIcon />
                 </button>
               </div>
             </div>

             <div
               className="
                 min-h-0
                 flex-1
                 overflow-y-auto
                 overscroll-contain
                 px-4
                 py-4
                 pb-[calc(20px+env(safe-area-inset-bottom))]
                 sm:px-5
               ">

               <PouchSidebar
                 items={
                   pouchItems
                 }
                 selectedPlan={
                   selectedPlan
                 }
                 pooledPricing={
                   pooledPricing
                 }
                 pooledPricingLoading={
                   pooledPricingLoading
                 }
                 pooledPricingError={
                   pooledPricingError
                 }
                 purchaseOption={
                   purchaseOption
                 }
                 onPurchaseOptionChange={
                   setPurchaseOption
                 }
                 onRemoveItem={
                   removePouchItem
                 }
                 onTimingChange={
                   updatePouchItemTiming
                 }
               />
             </div>
           </section>
         </div>
       )}

     {deselectConfirmationOpen && (
       <div
         className="
           fixed
           inset-0
           z-[100]
           flex
           items-center
           justify-center
           bg-[rgba(16,20,22,0.48)]
           px-5
           py-8
           backdrop-blur-[2px]
         "
         role="presentation"
         onMouseDown={
           cancelPlanDeselection
         }>

         <div
           role="dialog"
           aria-modal="true"
           aria-labelledby="deselect-plan-title"
           aria-describedby="deselect-plan-description"
           onMouseDown={
             (event) =>
               event.stopPropagation()
           }
           className="
             w-full
             max-w-[470px]
             overflow-hidden
             rounded-[16px]
             border
             border-[#E3D8CD]
             bg-white
             shadow-[0_24px_70px_rgba(24,17,12,0.24)]
           ">

           <div className="px-6 pb-5 pt-6 sm:px-7">
             <div
               className="
                 flex
                 items-start
                 gap-4
               ">

               <span
                 className="
                   flex
                   h-[46px]
                   w-[46px]
                   shrink-0
                   items-center
                   justify-center
                   rounded-full
                   bg-[#F8EDE8]
                   text-[#8C1D40]
                 ">

                 <WarningIcon />
               </span>

               <div className="min-w-0">
                 <h2
                   id="deselect-plan-title"
                   className="
                     text-[22px]
                     leading-tight
                     text-[#281D1A]
                   "
                   style={{
                     fontFamily:
                       'Georgia, "Times New Roman", serif',
                   }}>

                   Deselect VidaPouch plan?
                 </h2>

                 <p
                   id="deselect-plan-description"
                   className="
                     mt-3
                     text-[13px]
                     leading-[1.65]
                     text-[#5E6669]
                   ">

                   Your current pouch contains{" "}
                   <strong
                     className="
                       font-semibold
                       text-[#302A26]
                     ">

                     {pouchItems.length}{" "}
                     {pouchItemLabel}
                   </strong>
                   . Deselecting your plan will
                   remove them from My Pouch.
                 </p>

                 <p
                   className="
                     mt-2
                     text-[12px]
                     leading-[1.6]
                     text-[#727A7D]
                   ">

                   Your VidaSearch results, filters,
                   and bottle-buying options will
                   remain available.
                 </p>
               </div>
             </div>
           </div>

           <div
             className="
               flex
               flex-col-reverse
               gap-2.5
               border-t
               border-[#EEE6DE]
               bg-[#FCFAF8]
               px-6
               py-4
               sm:flex-row
               sm:justify-end
               sm:px-7
             ">

             <button
               type="button"
               onClick={
                 clearPouchAndPlan
               }
               className="
                 flex
                 min-h-[42px]
                 items-center
                 justify-center
                 rounded-[8px]
                 border
                 border-[#D7C5C5]
                 bg-white
                 px-4
                 text-[12px]
                 font-semibold
                 text-[#9A3030]
                 transition
                 hover:border-[#C99B9B]
                 hover:bg-[#FCF2F2]
                 focus:outline-none
                 focus-visible:ring-2
                 focus-visible:ring-[#9A3030]
                 focus-visible:ring-offset-2
               ">

               Deselect &amp; Clear Pouch
             </button>

             <button
               type="button"
               autoFocus
               onClick={
                 cancelPlanDeselection
               }
               className="
                 flex
                 min-h-[42px]
                 items-center
                 justify-center
                 rounded-[8px]
                 bg-[#7D0E1C]
                 px-5
                 text-[12px]
                 font-semibold
                 text-white
                 transition
                 hover:bg-[#65101A]
                 focus:outline-none
                 focus-visible:ring-2
                 focus-visible:ring-[#7D0E1C]
                 focus-visible:ring-offset-2
               ">

               Keep My Plan
             </button>
           </div>
         </div>
       </div>
     )}
   </>
 );
}