"use client";

import {
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
 getSearchPlan,
} from "./types/searchPlan";

import type {
 SearchPlanId,
} from "./types/searchPlan";

import TrustBar from "./TrustBar";
import SearchControls from "./SearchControls";
import SearchResults from "./SearchResults";
import PouchSidebar from "./PouchSidebar";

type SearchWorkspaceProps = {
 query: string;
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

export default function SearchWorkspace({
 query,
}: SearchWorkspaceProps) {
 const [
   layout,
   setLayout,
 ] =
   useState<SearchLayoutState>({
     hasSearched: false,
     filtersOpen: false,
     pouchOpen: false,
     hasPouchItems: false,
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
   useState<SearchPlanId>(
     DEFAULT_SEARCH_PLAN_ID
   );

 const selectedPlan =
   getSearchPlan(
     selectedPlanId
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

 function changePlan(
   planId:
     SearchPlanId
 ) {
   setSelectedPlanId(
     planId
   );
 }

 function addPouchItem(
   item:
     SearchPouchItem
 ) {
   setPouchItems(
     (currentItems) => {
       const alreadyAdded =
         currentItems.some(
           (currentItem) =>
             currentItem.id ===
             item.id
         );

       if (alreadyAdded) {
         return currentItems;
       }

       if (
         currentItems.length >=
         selectedPlan.supplementLimit
       ) {
         return currentItems;
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
   itemId: string
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

       return nextItems;
     }
   );
 }

 function updatePouchItemTiming(
   itemId: string,
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
                 item.recommendedTiming,

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

 return (
   <section className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
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

       {layout.hasPouchItems && (
         <aside
           className="
             min-w-0
             overflow-hidden
             rounded-[12px]
             border
             border-[#E7DED3]
             bg-[#FBF8F3]
             shadow-[0_2px_10px_rgba(54,38,20,0.025)]
           ">

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
 );
}