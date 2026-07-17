"use client";

import { useState } from "react";

const FORM_OPTIONS = [
 "Capsule",
 "Softgel",
 "Tablet",
 "Powder",
 "Gummy",
 "Liquid",
];

const DIETARY_OPTIONS = [
 "Vegan",
 "Vegetarian",
 "Gluten Free",
 "Dairy Free",
 "Soy Free",
 "Non-GMO",
];

const TESTING_OPTIONS = [
 "USP Verified",
 "NSF Certified",
 "ConsumerLab Tested",
 "Informed Choice",
];

function InfoIcon() {
 return (
   <span
     aria-hidden="true"
     className="
       inline-flex
       h-[15px]
       w-[15px]
       items-center
       justify-center
       rounded-full
       border
       border-[#6E6A65]
       text-[9px]
       font-bold
       leading-none
       text-[#6E6A65]
     ">

     i
   </span>
 );
}

type FilterCheckboxProps = {
 label: string;
 defaultChecked?: boolean;
};

function FilterCheckbox({
 label,
 defaultChecked = false,
}: FilterCheckboxProps) {
 const [checked, setChecked] =
   useState(defaultChecked);

 return (
   <label
     className="
       flex
       cursor-pointer
       items-center
       gap-[9px]
       py-[3px]
     ">

     <button
       type="button"
       role="checkbox"
       aria-checked={checked}
       onClick={() =>
         setChecked((current) => !current)
       }
       className={`
         flex
         h-[17px]
         w-[17px]
         shrink-0
         items-center
         justify-center
         rounded-[4px]
         border
         transition-colors
         ${
           checked
             ? "border-[#790818] bg-[#790818]"
             : "border-[#C9C2B9] bg-[#FFFCF8]"
         }
       `}>

       {checked && (
         <svg
           viewBox="0 0 12 12"
           className="h-[11px] w-[11px]"
           fill="none"
           aria-hidden="true">

           <path
             d="M2.3 6.2 4.8 8.5 9.7 3.5"
             stroke="white"
             strokeWidth="1.8"
             strokeLinecap="round"
             strokeLinejoin="round"
           />
         </svg>
       )}
     </button>

     <span
       className="
         text-[12px]
         font-medium
         leading-[17px]
         text-[#302E2B]
       ">

       {label}
     </span>
   </label>
 );
}

type FilterSectionProps = {
 number: number;
 title: string;
 showInfo?: boolean;
 children: React.ReactNode;
};

function FilterSection({
 number,
 title,
 showInfo = false,
 children,
}: FilterSectionProps) {
 return (
   <section>
     <div className="flex items-center gap-[6px]">
       <h3
         className="
           text-[12px]
           font-bold
           leading-[18px]
           text-[#242220]
         ">

         {number}. {title}
       </h3>

       {showInfo && <InfoIcon />}
     </div>

     <div className="mt-[9px]">
       {children}
     </div>
   </section>
 );
}

export default function FilterSidebar() {
 return (
   <aside
     className="
       w-full
       rounded-[12px]
       border
       border-[#E7DED3]
       bg-[#FBF8F3]
       px-[14px]
       py-[15px]
       shadow-[0_2px_10px_rgba(54,38,20,0.025)]
     ">

     <div className="flex items-center justify-between gap-3">
       <h2
         className="
           whitespace-nowrap
           font-serif
           text-[17px]
           font-semibold
           leading-none
           tracking-[-0.01em]
           text-[#241713]
         ">

         Filter Results
       </h2>

       <button
         type="button"
         className="
           shrink-0
           text-[10px]
           font-semibold
           text-[#74101D]
           underline
           underline-offset-2
         ">

         Reset all
       </button>
     </div>

     <div className="mt-[22px] space-y-[19px]">
       <FilterSection
         number={1}
         title="Daily Dose (per day)"
         showInfo>

         <input
           type="text"
           defaultValue="1 capsule"
           aria-label="Daily dose"
           className="
             h-[37px]
             w-full
             rounded-[6px]
             border
             border-[#DDD4CA]
             bg-[#FFFCF8]
             px-[11px]
             text-[12px]
             font-medium
             text-[#302D29]
             outline-none
             transition
             placeholder:text-[#8B857E]
             focus:border-[#8A1423]
           "
         />

         <p
           className="
             mt-[6px]
             whitespace-nowrap
             text-[9.5px]
             leading-[14px]
             text-[#6F6A64]
           ">

           Examples: 2 capsules, 400 mg, 1 tsp
         </p>
       </FilterSection>

       <FilterSection
         number={2}
         title="Form">

         <div className="space-y-[1px]">
           {FORM_OPTIONS.map((option) => (
             <FilterCheckbox
               key={option}
               label={option}
               defaultChecked={
                 option === "Capsule"
               }
             />
           ))}
         </div>
       </FilterSection>

       <FilterSection
         number={3}
         title="Dietary Preference">

         <div className="space-y-[1px]">
           {DIETARY_OPTIONS.map(
             (option) => (
               <FilterCheckbox
                 key={option}
                 label={option}
               />
             )
           )}
         </div>
       </FilterSection>

       <FilterSection
         number={4}
         title="Third-Party Tested">

         <div className="space-y-[1px]">
           {TESTING_OPTIONS.map(
             (option) => (
               <FilterCheckbox
                 key={option}
                 label={option}
               />
             )
           )}
         </div>
       </FilterSection>

       <FilterSection
         number={5}
         title="Brand">

         <div className="relative">
           <select
             defaultValue="all"
             aria-label="Brand"
             className="
               h-[37px]
               w-full
               appearance-none
               rounded-[6px]
               border
               border-[#DDD4CA]
               bg-[#FFFCF8]
               px-[11px]
               pr-9
               text-[12px]
               font-medium
               text-[#302D29]
               outline-none
               focus:border-[#8A1423]
             ">

             <option value="all">
               All Brands
             </option>

             <option value="thorne">
               Thorne
             </option>

             <option value="pure">
               Pure Encapsulations
             </option>

             <option value="now">
               NOW Foods
             </option>

             <option value="life-extension">
               Life Extension
             </option>

             <option value="nordic-naturals">
               Nordic Naturals
             </option>
           </select>

           <svg
             viewBox="0 0 20 20"
             fill="none"
             aria-hidden="true"
             className="
               pointer-events-none
               absolute
               right-[10px]
               top-1/2
               h-[15px]
               w-[15px]
               -translate-y-1/2
               text-[#4B4844]
             ">

             <path
               d="m6.5 8 3.5 3.5L13.5 8"
               stroke="currentColor"
               strokeWidth="1.7"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
           </svg>
         </div>
       </FilterSection>

       <FilterSection
         number={6}
         title="Price Range (per month)">

         <div className="flex items-center gap-[7px]">
           <div
             className="
               flex
               h-[37px]
               min-w-0
               flex-1
               items-center
               rounded-[6px]
               border
               border-[#DDD4CA]
               bg-[#FFFCF8]
               px-[9px]
             ">

             <span className="mr-[5px] text-[12px] text-[#44403B]">
               $
             </span>

             <input
               type="text"
               defaultValue="0"
               aria-label="Minimum price"
               className="
                 min-w-0
                 flex-1
                 bg-transparent
                 text-[12px]
                 font-medium
                 text-[#302D29]
                 outline-none
               "
             />
           </div>

           <span
             className="
               shrink-0
               text-[10px]
               text-[#69645E]
             ">

             to
           </span>

           <div
             className="
               flex
               h-[37px]
               min-w-0
               flex-1
               items-center
               rounded-[6px]
               border
               border-[#DDD4CA]
               bg-[#FFFCF8]
               px-[9px]
             ">

             <span className="mr-[5px] text-[12px] text-[#44403B]">
               $
             </span>

             <input
               type="text"
               defaultValue="100+"
               aria-label="Maximum price"
               className="
                 min-w-0
                 flex-1
                 bg-transparent
                 text-[12px]
                 font-medium
                 text-[#302D29]
                 outline-none
               "
             />
           </div>
         </div>

         <div className="mt-[13px] px-[2px]">
           <div
             className="
               relative
               h-[3px]
               rounded-full
               bg-[#86101F]
             ">

             <span
               className="
                 absolute
                 left-0
                 top-1/2
                 h-[14px]
                 w-[14px]
                 -translate-y-1/2
                 rounded-full
                 bg-[#86101F]
               "
             />

             <span
               className="
                 absolute
                 right-0
                 top-1/2
                 h-[14px]
                 w-[14px]
                 -translate-y-1/2
                 rounded-full
                 bg-[#86101F]
               "
             />
           </div>
         </div>
       </FilterSection>
     </div>
   </aside>
 );
}
