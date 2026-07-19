"use client";

import FilterSidebar from "./FilterSidebar";

type SearchControlsProps = {
 open: boolean;
 onToggle: () => void;
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

export default function SearchControls({
 open,
 onToggle,
}: SearchControlsProps) {
 return (
   <div
     className="
       w-full
       overflow-hidden
       rounded-[12px]
       border
       border-[#E7DED3]
       bg-[#FBF8F3]
       shadow-[0_2px_10px_rgba(54,38,20,0.025)]
     ">

     {open ? (
       <div className="min-w-[290px]">
         <button
           type="button"
           onClick={onToggle}
           aria-expanded="true"
           aria-label="Collapse filters"
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

             <FilterIcon />
             Filters
           </span>

           <LeftChevronIcon />
         </button>

         <div className="p-3">
           <FilterSidebar />
         </div>
       </div>
     ) : (
       <button
         type="button"
         onClick={onToggle}
         aria-expanded="false"
         aria-label="Open filters"
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

         <FilterIcon />

         <span
           className="
             [writing-mode:vertical-rl]
             rotate-180
             text-[10px]
             font-bold
             tracking-[0.12em]
           ">

           FILTERS
         </span>

         <RightChevronIcon />
       </button>
     )}
   </div>
 );
}
