"use client";

import type {
 Dispatch,
 SetStateAction,
} from "react";

import type {
 SearchFilterState,
} from "./types/searchFilters";

import FilterSidebar from "./FilterSidebar";

type MobileFilterSheetProps = {
 open:
   boolean;

 onClose:
   () => void;

 filters:
   SearchFilterState;

 onFiltersChange:
   Dispatch<
     SetStateAction<
       SearchFilterState
>
>;

 availableBrands:
   string[];
};

function FilterIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[20px] w-[20px]">

     <path
       d="M4 7h16M7 12h10M10 17h4"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
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

export default function MobileFilterSheet({
 open,
 onClose,
 filters,
 onFiltersChange,
 availableBrands,
}: MobileFilterSheetProps) {
 if (
   !open
 ) {
   return null;
 }

 return (
   <div
     className="
       fixed
       inset-0
       z-[95]
       bg-[rgba(16,20,22,0.5)]
       backdrop-blur-[2px]
       lg:hidden
     "
     role="presentation"
     onMouseDown={
       onClose
     }>

     <section
       role="dialog"
       aria-modal="true"
       aria-labelledby="mobile-filters-title"
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
           shrink-0
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

               <FilterIcon />
             </span>

             <div>
               <h2
                 id="mobile-filters-title"
                 className="
                   text-[20px]
                   leading-tight
                   text-[#281D1A]
                 "
                 style={{
                   fontFamily:
                     'Georgia, "Times New Roman", serif',
                 }}>

                 Filters
               </h2>

               <p
                 className="
                   mt-1
                   text-[11px]
                   text-[#6D7476]
                 ">

                 Narrow your supplement results
               </p>
             </div>
           </div>

           <button
             type="button"
             onClick={
               onClose
             }
             aria-label="Close filters"
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
           sm:px-5
         ">

         <FilterSidebar
           filters={
             filters
           }
           onFiltersChange={
             onFiltersChange
           }
           availableBrands={
             availableBrands
           }
         />
       </div>

       <div
         className="
           shrink-0
           border-t
           border-[#E7DED3]
           bg-white
           px-4
           pt-3
           pb-[calc(12px+env(safe-area-inset-bottom))]
           sm:px-5
         ">

         <button
           type="button"
           onClick={
             onClose
           }
           className="
             flex
             min-h-[48px]
             w-full
             items-center
             justify-center
             rounded-[10px]
             bg-[#7D0E1C]
             px-5
             text-[13px]
             font-semibold
             text-white
             transition
             hover:bg-[#65101A]
             focus:outline-none
             focus-visible:ring-2
             focus-visible:ring-[#7D0E1C]
             focus-visible:ring-offset-2
           ">

           View Results
         </button>
       </div>
     </section>
   </div>
 );
}
