"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
 const [menuOpen, setMenuOpen] = useState(false);

 return (
   <>
     <header className="sticky top-0 z-50 border-b border-[#D6CCBF] bg-[#EDE1D3]/90 backdrop-blur-md">
       <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 lg:px-10">
         <Link href="/" className="shrink-0">
           <img
             src="/vidapouch_logo3.png"
             alt="VidaPouch logo"
             className="h-[42px] w-auto sm:h-[52px] lg:h-[60px]"
           />
         </Link>

         <nav className="hidden items-center gap-5 min-[1024px]:flex min-[1150px]:gap-7">
           <Link href="/product" className="nav-item">
             PRODUCT
           </Link>

           <Link href="/how-it-works" className="nav-item">
             HOW IT WORKS
           </Link>

           <Link href="/about" className="nav-item">
             ABOUT
           </Link>

           <Link href="/faq" className="nav-item">
             FAQ
           </Link>

           <Link
             href="/waitlist"
             className="whitespace-nowrap rounded-full bg-[#081620] px-6 py-3 text-[13px] tracking-[0.08em] text-white">

             GET EARLY ACCESS
           </Link>
         </nav>

         <button
           type="button"
           onClick={() => setMenuOpen(true)}
           className="flex h-11 w-11 items-center justify-center rounded-full border border-[#CFC4B7] bg-[#F8F2EA]/80 text-[#081620] min-[1024px]:hidden"
           aria-label="Open menu"
           aria-expanded={menuOpen}>

           <span className="grid gap-1.5">
             <span className="block h-px w-5 bg-[#081620]" />
             <span className="block h-px w-5 bg-[#081620]" />
             <span className="block h-px w-5 bg-[#081620]" />
           </span>
         </button>
       </div>
     </header>

     {menuOpen && (
       <div className="fixed inset-0 z-[100] min-[1024px]:hidden">
         <button
           type="button"
           aria-label="Close menu overlay"
           onClick={() => setMenuOpen(false)}
           className="absolute inset-0 bg-[#081620]/30"
         />

         <aside className="absolute right-0 top-0 flex h-full w-[82%] max-w-[360px] flex-col bg-[#F8F2EA] px-7 py-6 shadow-[-20px_0_70px_rgba(0,0,0,0.18)]">
           <div className="mb-10 flex items-center justify-between">
             <Link href="/" onClick={() => setMenuOpen(false)}>
               <img
                 src="/vidapouch_logo3.png"
                 alt="VidaPouch logo"
                 className="h-[46px] w-auto"
               />
             </Link>

             <button
               type="button"
               onClick={() => setMenuOpen(false)}
               className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6CCBF] text-2xl leading-none text-[#081620]"
               aria-label="Close menu">

               ×
             </button>
           </div>

           <nav className="grid gap-6">
             <MobileNavLink
               href="/product"
               label="Product"
               closeMenu={() => setMenuOpen(false)}
             />

             <MobileNavLink
               href="/how-it-works"
               label="How It Works"
               closeMenu={() => setMenuOpen(false)}
             />

             <MobileNavLink
               href="/about"
               label="About"
               closeMenu={() => setMenuOpen(false)}
             />

             <MobileNavLink
               href="/faq"
               label="FAQ"
               closeMenu={() => setMenuOpen(false)}
             />
           </nav>

           <Link
             href="/waitlist"
             onClick={() => setMenuOpen(false)}
             className="mt-10 rounded-full bg-[#081620] px-7 py-4 text-center text-[13px] tracking-[0.08em] text-white">

             GET EARLY ACCESS
           </Link>
         </aside>
       </div>
     )}
   </>
 );
}

type MobileNavLinkProps = {
 href: string;
 label: string;
 closeMenu: () => void;
};

function MobileNavLink({
 href,
 label,
 closeMenu,
}: MobileNavLinkProps) {
 return (
   <Link
     href={href}
     onClick={closeMenu}
     className="border-b border-[#DDD7CF] pb-5 text-[18px] uppercase tracking-[0.16em] text-[#081620]">

     {label}
   </Link>
 );
}
