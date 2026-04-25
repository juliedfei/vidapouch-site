"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export default function Home() {
 const [menuOpen, setMenuOpen] = useState(false);

 return (
   <main className="min-h-screen bg-[#F3E9DD] text-[#0E171B]">
     <header className="sticky top-0 z-50 border-b border-[#D6CCBF] bg-[#EDE1D3]/90 backdrop-blur-md">
       <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 lg:px-10">
         <a href="/" className="shrink-0">
           <img
             src="/vidapouch_logo3.png"
             alt="Vidapouch logo"
             className="h-[42px] w-auto sm:h-[52px] lg:h-[60px]"
           />
         </a>

         <nav className="hidden items-center gap-5 min-[1024px]:flex min-[1150px]:gap-7">
           <a href="/product" className="nav-item">PRODUCT</a>
           <a href="/how-it-works" className="nav-item">HOW IT WORKS</a>
           <a href="/about" className="nav-item">ABOUT</a>
           <a href="/faq" className="nav-item">FAQ</a>
           <a
             href="/waitlist"
             className="whitespace-nowrap rounded-full bg-[#081620] px-6 py-3 text-[13px] tracking-[0.08em] text-white">

             GET EARLY ACCESS
           </a>
         </nav>

         <button
           type="button"
           onClick={() => setMenuOpen(true)}
           className="flex h-11 w-11 items-center justify-center rounded-full border border-[#CFC4B7] bg-[#F8F2EA]/80 text-[#081620] min-[1024px]:hidden"
           aria-label="Open menu">

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
             <img
               src="/vidapouch_logo3.png"
               alt="Vidapouch logo"
               className="h-[46px] w-auto"
             />

             <button
               type="button"
               onClick={() => setMenuOpen(false)}
               className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6CCBF] text-2xl leading-none text-[#081620]"
               aria-label="Close menu">

               ×
             </button>
           </div>

           <nav className="grid gap-6">
             <MobileNavLink href="/product" label="Product" />
             <MobileNavLink href="/how-it-works" label="How It Works" />
             <MobileNavLink href="/about" label="About" />
             <MobileNavLink href="/faq" label="FAQ" />
           </nav>

           <a
             href="/waitlist"
             className="mt-10 rounded-full bg-[#081620] px-7 py-4 text-center text-[13px] tracking-[0.08em] text-white">

             GET EARLY ACCESS
           </a>
         </aside>
       </div>
     )}

     <section className="relative overflow-hidden bg-[#F3E9DD] min-[1024px]:min-h-[calc(100svh-84px)]">
       <img
         src="/Hero-BG-final.png"
         alt=""
         className="absolute inset-0 hidden h-full w-full object-cover object-right min-[1024px]:block"
       />

       <img
         src="/Hero-BG3.png"
         alt=""
         className="absolute inset-0 h-full w-full object-cover object-[70%_bottom] min-[1024px]:hidden"
       />

       <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(243,233,221,0.96)_0%,rgba(243,233,221,0.9)_48%,rgba(243,233,221,0.82)_100%)] min-[1024px]:bg-[linear-gradient(to_right,rgba(243,233,221,0.92)_0%,rgba(243,233,221,0.74)_36%,rgba(243,233,221,0.22)_66%,rgba(243,233,221,0)_86%)]" />

       <div className="relative mx-auto flex max-w-[1440px] px-5 py-14 sm:px-8 md:py-18 lg:px-10 min-[1024px]:min-h-[calc(100svh-84px)] min-[1024px]:items-center">
         <div className="mx-auto max-w-[640px] text-center min-[1024px]:mx-0 min-[1024px]:max-w-[560px] min-[1024px]:text-left">
           <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#8C1D40] sm:text-[12px]">
             LUXURY WELLNESS, SIMPLIFIED
           </p>

           <h1
             className="text-[46px] leading-[0.94] tracking-[-0.045em] text-[#081620] sm:text-[62px] min-[1024px]:text-[76px]"
             style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

             Your wellness.
             <br />
             On autopilot.
           </h1>

           <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-[1.65] text-[#3E4A4E] sm:text-[18px] min-[1024px]:mx-0">
             No more pill bottles. No more guesswork. Personalized daily
             supplement pouches, built around your routine and delivered ready
             to take.
           </p>

           <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row min-[1024px]:justify-start">
             <a
               href="/waitlist"
               className="rounded-full bg-[#081620] px-8 py-4 text-center text-[13px] tracking-[0.08em] text-white sm:text-[14px]">

               GET EARLY ACCESS
             </a>

             <a
               href="/how-it-works"
               className="rounded-full border border-[#1B2529] bg-white/35 px-8 py-4 text-center text-[13px] tracking-[0.08em] text-[#1B2529] backdrop-blur-sm sm:text-[14px]">

               SEE HOW IT WORKS
             </a>
           </div>

           <div className="mx-auto mt-9 grid max-w-[620px] grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 min-[1024px]:mx-0">
             <FeatureItem icon={<LeafIcon />} line1="CLEAN" line2="TRUSTED" />
             <FeatureItem icon={<ShieldIcon />} line1="BUILT FOR" line2="YOUR ROUTINE" />
             <FeatureItem icon={<PersonIcon />} line1="READY WHEN" line2="YOU ARE" />
             <FeatureItem icon={<StarIcon />} line1="DESIGNED FOR" line2="SIMPLICITY" />
           </div>
         </div>
       </div>
     </section>

     <section className="bg-[#F3E9DD] px-5 pb-20 pt-16 sm:px-8 sm:pt-20 min-[1024px]:pt-20">
       <div className="mx-auto max-w-[1080px] rounded-[34px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-6 py-9 shadow-[0_24px_70px_rgba(20,15,10,0.08)] sm:px-10 sm:py-12">
         <div className="mx-auto max-w-[760px] text-center">
           <p className="text-[11px] uppercase tracking-[0.24em] text-[#8C1D40]">
             YOUR DAY, ORGANIZED
           </p>

           <h2
             className="mx-auto mt-4 max-w-[650px] text-[36px] leading-[1.06] tracking-[-0.035em] sm:text-[46px]"
             style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

             One pouch at a time.
           </h2>

           <p className="mx-auto mt-4 max-w-[590px] text-[16px] leading-7 text-[#475357] sm:text-[17px]">
             Morning to night, your supplements are pre-sorted into simple,
             time-based pouches — ready when your routine is.
           </p>
         </div>

         <div className="mt-8 overflow-hidden rounded-[26px] border border-[#DDD7CF] bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
           <img
             src="/vidapouch_day_strip2.png"
             alt="Vidapouch daily strip of supplement pouches organized from morning to evening"
             className="h-auto w-full object-cover"
           />
         </div>
       </div>
     </section>
   </main>
 );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
 return (
   <a
     href={href}
     className="border-b border-[#DDD7CF] pb-5 text-[18px] uppercase tracking-[0.16em] text-[#081620]">

     {label}
   </a>
 );
}

function FeatureItem({
 icon,
 line1,
 line2,
}: {
 icon: ReactNode;
 line1: string;
 line2: string;
}) {
 return (
   <div className="flex flex-col items-center text-center">
     <div className="mb-2 h-7 w-7 text-[#132026] sm:h-8 sm:w-8">{icon}</div>
     <p className="text-[9px] uppercase tracking-[0.13em] text-[#1E2A2E] sm:text-[10px]">
       {line1}
     </p>
     <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-[#1E2A2E] sm:text-[10px]">
       {line2}
     </p>
   </div>
 );
}

function LeafIcon() {
 return (
   <svg viewBox="0 0 48 48" fill="none">
     <path
       d="M34.5 8.5C24.5 10 15.8 17.5 13 27.2C11.9 31.1 12 35.1 13.4 39.5C17.7 38.2 21.2 36.2 24 33.3C31.5 25.8 32.4 15.7 34.5 8.5Z"
       stroke="currentColor"
       strokeWidth="2"
     />
     <path
       d="M14 38.5C16 29.5 20.5 22.5 30.5 15.5"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
     />
   </svg>
 );
}

function ShieldIcon() {
 return (
   <svg viewBox="0 0 48 48" fill="none">
     <path
       d="M24 7L37 12V22C37 31.2 31.2 37.8 24 41C16.8 37.8 11 31.2 11 22V12L24 7Z"
       stroke="currentColor"
       strokeWidth="2"
     />
     <path
       d="M18 24L22.3 28.3L30.5 20.2"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
     />
   </svg>
 );
}

function PersonIcon() {
 return (
   <svg viewBox="0 0 48 48" fill="none">
     <circle cx="24" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
     <path
       d="M13 38C13 31.9 17.9 27 24 27C30.1 27 35 31.9 35 38"
       stroke="currentColor"
       strokeWidth="2"
     />
   </svg>
 );
}

function StarIcon() {
 return (
   <svg viewBox="0 0 48 48" fill="none">
     <path
       d="M24 8L28.7 17.6L39 19.1L31.5 26.4L33.3 36.7L24 31.8L14.7 36.7L16.5 26.4L9 19.1L19.3 17.6L24 8Z"
       stroke="currentColor"
       strokeWidth="2"
     />
   </svg>
 );
}
