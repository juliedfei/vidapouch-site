"use client";

import {
 useState,
} from "react";

import SearchBar from "./SearchBar";
import HealthGoalsModal from "./HealthGoalsModal";

import SleepIcon from "@/components/icons/SleepIcon";
import EnergyIcon from "@/components/icons/EnergyIcon";
import BrainIcon from "@/components/icons/BrainIcon";
import GutHealthIcon from "@/components/icons/GutHealthIcon";
import ImmunityIcon from "@/components/icons/ImmunityIcon";
import MoodIcon from "@/components/icons/MoodIcon";
import JointSupportIcon from "@/components/icons/JointSupportIcon";

type SearchLandingProps = {
 query:
   string;

 setQuery:
   (
     value:
       string
   ) => void;
};

const popularSearches = [
 "Sleep Support",
 "Magnesium",
 "Energy",
 "Gut Health",
 "Brain Fog",
];

const wellnessGoals = [
 {
   label:
     "Sleep",

   icon:
     SleepIcon,
 },
 {
   label:
     "Energy",

   icon:
     EnergyIcon,
 },
 {
   label:
     "Brain",

   icon:
     BrainIcon,
 },
 {
   label:
     "Gut Health",

   icon:
     GutHealthIcon,
 },
 {
   label:
     "Immunity",

   icon:
     ImmunityIcon,
 },
 {
   label:
     "Mood",

   icon:
     MoodIcon,
 },
 {
   label:
     "Joint Support",

   icon:
     JointSupportIcon,
 },
];

export default function SearchLanding({
 query,
 setQuery,
}: SearchLandingProps) {
 const [
   isHealthGoalsModalOpen,
   setIsHealthGoalsModalOpen,
 ] =
   useState(
     false
   );

 function handleHealthTopicSelect(
   searchQuery:
     string
 ) {
   setQuery(
     searchQuery
   );

   setIsHealthGoalsModalOpen(
     false
   );
 }

 return (
   <>
     <section
       className=
         "relative overflow-hidden bg-[#F3E9DD]">

       <img
         src=
           "/images/home-v2/hero/hero.PNG"
         alt=""
         aria-hidden=
           "true"
         className="
           absolute
           inset-0
           h-full
           w-full
           object-cover
           object-center
           lg:object-right
         "
       />

       <div
         className="
           absolute
           inset-0
           hidden
           lg:block
           bg-[linear-gradient(to_right,rgba(243,233,221,0.98)_0%,rgba(243,233,221,0.93)_31%,rgba(243,233,221,0.68)_45%,rgba(243,233,221,0.16)_59%,rgba(243,233,221,0)_72%)]
         "
       />

       <div
         className="
           absolute
           inset-0
           lg:hidden
           bg-[linear-gradient(to_bottom,rgba(243,233,221,0.97)_0%,rgba(243,233,221,0.92)_68%,rgba(243,233,221,0.68)_100%)]
         "
       />

       <div
         className="
           relative
           mx-auto
           flex
           min-h-[475px]
           max-w-[1440px]
           items-center
           px-6
           py-8
           lg:px-10
           xl:px-[74px]
         ">

         <div
           className=
             "w-full max-w-[720px]">

           <p
             className="
               mb-3
               text-[10px]
               font-medium
               uppercase
               tracking-[0.24em]
               text-[#8C1D40]
             ">

             Supplement shopping, simplified
           </p>

           <h1
             className="
               max-w-[650px]
               text-[42px]
               leading-[0.98]
               tracking-[-0.045em]
               text-[#71162F]
               lg:text-[58px]
             "
             style={{
               fontFamily:
                 'Georgia, "Times New Roman", serif',
             }}>

             Search. Compare. Choose.
           </h1>

           <p
             className="
               mt-5
               max-w-[540px]
               text-[15px]
               leading-[1.65]
               text-[#303A3D]
               lg:text-[16px]
             ">

             Find the highest quality supplements, compare trusted brands, and choose how you want to get them.
           </p>

           <div
             className=
               "mt-6 w-full max-w-[590px]">

             <SearchBar
               value=
                 {query}
               onChange=
                 {setQuery}
               variant=
                 "hero"
             />
           </div>

           <div
             className=
               "mt-7">

             <div
               className=
                 "flex flex-wrap items-center gap-x-2 gap-y-2">

               <span
                 className=
                   "mr-1 text-[11px] font-semibold text-[#263235]">

                 Popular searches:
               </span>

               {popularSearches.map(
                 (
                   search
                 ) => (
                   <button
                     key=
                       {search}
                     type=
                       "button"
                     onClick=
                       {() =>
                         setQuery(
                           search
                         )
                       }
                     className="
                       rounded-[4px]
                       bg-[#F8F1E9]/90
                       px-2.5
                       py-1.5
                       text-[10px]
                       font-medium
                       leading-none
                       text-[#3E474A]
                       shadow-[0_1px_5px_rgba(36,49,53,0.04)]
                       transition
                       hover:bg-white
                     ">

                     {search}
                   </button>
                 )
               )}
             </div>
           </div>

           <div
             className=
               "mt-4">

             <p
               className=
                 "mb-2 text-[11px] font-semibold text-[#263235]">

               Browse health goals:
             </p>

             <div
               className="
                 flex
                 flex-wrap
                 max-w-[700px]
                 gap-x-1.5
                 gap-y-1.5
                 pb-1
               ">

               {wellnessGoals.map(
                 ({
                   label,
                   icon:
                     Icon,
                 }) => (
                   <button
                     key=
                       {label}
                     type=
                       "button"
                     onClick=
                       {() =>
                         setQuery(
                           label
                         )
                       }
                     className="
                       flex
                       h-[40px]
                       items-center
                       gap-1.5
                       rounded-[4px]
                       border
                       border-white/80
                       bg-white/88
                       px-2
                       text-left
                       shadow-[0_2px_8px_rgba(36,49,53,0.06)]
                       backdrop-blur-sm
                       transition
                       hover:-translate-y-px
                       hover:bg-white
                     ">

                     <span
                       className="
                         flex
                         flex-none
                         items-center
                         justify-center
                         text-[#B67A2E]
                       ">

                       <Icon
                         className=
                           "h-[18px] w-[18px]"
                       />
                     </span>

                     <span
                       className="
                         whitespace-nowrap
                         text-[11px]
                         font-medium
                         leading-none
                         text-[#263235]
                       ">

                       {label}
                     </span>
                   </button>
                 )
               )}

               <button
                 type=
                   "button"
                 onClick=
                   {() =>
                     setIsHealthGoalsModalOpen(
                       true
                     )
                   }
                 aria-haspopup=
                   "dialog"
                 aria-expanded=
                   {isHealthGoalsModalOpen}
                 className="
                   flex
                   h-[39px]
                   flex-none
                   items-center
                   justify-center
                   gap-1
                   rounded-[6px]
                   border
                   border-white/80
                   bg-white/88
                   min-w-[82px]
                   px-2.5
                   text-[11px]
                   font-semibold
                   leading-none
                   text-[#8C1D40]
                   shadow-[0_2px_8px_rgba(36,49,53,0.06)]
                   backdrop-blur-sm
                   transition
                   hover:-translate-y-px
                   hover:bg-white
                   focus:outline-none
                   focus:ring-4
                   focus:ring-[#8C1D40]/10
                 ">

                 View all
                 <span
                   aria-hidden=
                     "true">

                   ›
                 </span>
               </button>
             </div>
           </div>

           {/* <p className="mt-4 text-[11px] text-[#596366]">
             Not sure where to start?{" "}
             <a
               href="/routine-builder"
               className="
                 font-semibold
                 text-[#8C1D40]
                 hover:underline
                 hover:underline-offset-4
               ">

               Let VidaPouch build your routine
             </a>
           </p> */}
         </div>
       </div>
     </section>

     <HealthGoalsModal
       open=
         {isHealthGoalsModalOpen}
       onClose=
         {() =>
           setIsHealthGoalsModalOpen(
             false
           )
         }
       onSelect=
         {handleHealthTopicSelect}
     />
   </>
 );
}