"use client";

import Link from "next/link";

export default function SearchNavbar() {
 return (
   <header className="sticky top-0 z-50 bg-transparent backdrop-blur-md">
     <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-10">
       <Link href="/v2" className="shrink-0">
         <img
           src="/vidasearch_logo.png"
           alt="VidaSearch logo"
           className="h-[42px] w-auto sm:h-[52px] lg:h-[60px]"
         />
       </Link>

       <Link
         href="/"
         className="group hidden items-center gap-2 rounded-full border border-[#D9CCBE] bg-white/70 px-5 py-2 text-[13px] font-medium tracking-[0.06em] text-[#081620] backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-md sm:flex">

         <span className="text-[#7A6652]">Explore</span>

         <span className="font-semibold tracking-[0.08em]">
           VidaPouch
         </span>

         <span className="transition-transform duration-200 group-hover:translate-x-1">
           →
         </span>
       </Link>
     </div>
   </header>
 );
}
