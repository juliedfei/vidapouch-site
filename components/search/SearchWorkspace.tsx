"use client";

import {
 useEffect,
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

import {
 usePooledPouchPricing,
} from "./usePooledPouchPricing";

type SearchWorkspaceProps = {
 query:
   string;
};

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
   selectedPlanId,
   setSelectedPlanId,
 ] =
   useState<SearchPlanSelection>(
     DEFAULT_SEARCH_PLAN_ID
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

 /*
  * Recalculate the complete current pouch whenever:
  *
  * - a product is added;
  * - a product is removed;
  * - a product quantity changes;
  * - the selected tier changes;
  * - an automatic tier upgrade occurs.
  *
  * The hook cancels or ignores stale requests, so
  * a calculation from an earlier tier cannot replace
  * a newer result.
  */
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

 useEffect(
   () => {
     if (
       !deselectConfirmationOpen
     ) {
       return;
     }

     function handleKeyDown(
       event:
         KeyboardEvent
     ) {
       if (
         event.key ===
         "Escape"
       ) {
         setDeselectConfirmationOpen(
           false
         );
       }
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

 function togglePouch() {
   setLayout(
     (current) => ({
       ...current,

       pouchOpen:
         !current.pouchOpen,
     })
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
   /*
    * Clicking the active plan again means the
    * customer wants to return to the standalone
    * VidaSearch experience.
    */
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

   /*
    * Do not allow a smaller plan that cannot hold
    * the supplements already selected.
    */
   if (
     pouchItems.length >
     requestedPlan
       .supplementLimit
   ) {
     return;
   }

   /*
    * Changing this state triggers an entirely new
    * pooled calculation using the requested tier.
    * No result from the previous tier is retained.
    */
   setSelectedPlanId(
     planId
   );
 }

 function addPouchItem(
   item:
     SearchPouchItem
 ) {
   /*
    * VidaSearch remains fully usable without
    * selecting a VidaPouch plan.
    */
   if (
     selectedPlan ===
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

       /*
        * Premier currently supports up to eight
        * supplements. More complex routines use
        * the custom builder.
        */
       if (
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

       /*
        * Essential upgrades automatically to
        * Complete at supplement four.
        *
        * Complete upgrades automatically to
        * Premier at supplement six.
        *
        * Both the new plan and new pouch items are
        * used by the pooled-pricing hook on the next
        * render.
        */
       if (
         nextSupplementCount >
         selectedPlan
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
       }

       /*
        * Removing a supplement does not
        * automatically downgrade the plan.
        *
        * Pricing is still recalculated using the
        * remaining products and current selected
        * tier.
        */
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

 const gridColumns =
   layout.hasPouchItems
     ? `${filterWidth} minmax(0, 1fr) ${pouchWidth}`
     : `${filterWidth} minmax(0, 1fr)`;

 const pouchItemLabel =
   pouchItems.length ===
   1
     ? "supplement"
     : "supplements";

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
           items-start
           gap-4
           transition-[grid-template-columns]
           duration-300
           ease-in-out
         "
         style={{
           gridTemplateColumns:
             gridColumns,
         }}>

         <aside className="min-w-0">
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
         </aside>

         <section className="min-w-0">
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
               min-w-0
               overflow-hidden
               rounded-[12px]
               border
               border-[#E7DED3]
               bg-[#FBF8F3]
               shadow-[0_2px_10px_rgba(54,38,20,0.025)]
             "
             data-pricing-status={
               pooledPricing
                 ?.status ??
               "none"
             }
             data-pricing-loading={
               pooledPricingLoading
                 ? "true"
                 : "false"
             }
             data-pricing-error={
               pooledPricingError ??
               undefined
             }>

             {layout.pouchOpen ? (
               <div className="min-w-[340px]">
                 <button
                   type="button"
                   onClick={
                     togglePouch
                   }
                   aria-expanded="true"
                   aria-label="Collapse My Pouch"
                   className="
                     flex
                     h-[52px]
                     w-full
                     items-center
                     justify-between
                     border-b
                     border-[#E7DED3]
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

                 <div className="p-3">
                   
                   
                   
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
                   togglePouch
                 }
                 aria-expanded="false"
                 aria-label="Open My Pouch"
                 className="
                   flex
                   min-h-[520px]
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
           </aside>
         )}
       </div>
     </section>

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
                   <strong className="font-semibold text-[#302A26]">
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
