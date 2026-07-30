"use client";

import Link from "next/link";

const VIDA_SEARCH_URL =
 "https://vidasearch.com";

const WHY_VIDA_POUCH_URL =
 "https://vidapouch.com/why-vidapouch";

export default function SearchNavbar() {
 return (
   <header
     className=
       "sticky top-0 z-50 bg-transparent backdrop-blur-md">

     <div
       className=
         "mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 lg:px-10">

       <Link
         href={
           VIDA_SEARCH_URL
         }
         className=
           "shrink-0"
         aria-label=
           "Go to the VidaSearch homepage">

         <img
           src=
             "/vidasearch_logo.PNG"
           alt=
             "VidaSearch logo"
           className=
             "h-[42px] w-auto sm:h-[52px] lg:h-[60px]"
         />
       </Link>

       <nav
         aria-label=
           "VidaSearch navigation"
         className=
           "ml-auto hidden items-center gap-6 md:flex">
       </nav>

       <Link
         href={
           WHY_VIDA_POUCH_URL
         }
         className=
           "group flex items-center gap-2 rounded-full border border-[#D9CCBE] bg-white/70 px-4 py-2 text-[12px] font-medium tracking-[0.04em] text-[#081620] backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-md sm:px-5 sm:text-[13px] sm:tracking-[0.06em]">

         <span
           className=
             "hidden text-[#7A6652] sm:inline">

           Explore
         </span>

         <span
           className=
             "font-semibold tracking-[0.06em] sm:tracking-[0.08em]">

           VidaPouch
         </span>

         <span
           aria-hidden=
             "true"
           className=
             "transition-transform duration-200 group-hover:translate-x-1">

           →
         </span>
       </Link>
     </div>
   </header>
 );
}