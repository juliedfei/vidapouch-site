"use client";

import { useState } from "react";

export default function AboutPage() {
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
           <a href="/why-vidapouch" className="nav-item">WHY VIDAPOUCH</a>
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
             <MobileNavLink href="/why-vidapouch" label="Why VidaPouch" />
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

     <section className="bg-[linear-gradient(180deg,#F3E9DD_0%,#EFE2D4_100%)] px-6 py-16 text-center lg:py-22">
       <div className="mx-auto max-w-[1120px]">
         <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
           ABOUT VIDAPOUCH
         </p>

         <h1
           className="mx-auto mt-4 max-w-[850px] text-[44px] leading-[1.02] tracking-[-0.04em] lg:text-[68px]"
           style={{ fontFamily: "Georgia, serif" }}>

           Wellness should feel less overwhelming.
         </h1>

         <p className="mx-auto mt-6 max-w-[680px] text-[18px] leading-[1.7] text-[#3E4A4E]">
           Vidapouch was created for the people who want to take care of
           themselves — but need the routine to feel clearer, calmer, and easier
           to follow.
         </p>
       </div>
     </section>

     <section className="bg-[#EFE2D4] px-6 py-20">
       <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
         <div>
           <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
             WHY IT STARTED
           </p>

           <h2
             className="mt-4 text-[38px] leading-[1.06] tracking-[-0.035em] lg:text-[56px]"
             style={{ fontFamily: "Georgia, serif" }}>

             Because routines can become complicated fast.
           </h2>
         </div>

         <div className="rounded-[32px] border border-[#D6CCBF] bg-[#F8F2EA]/90 p-8 shadow-[0_24px_70px_rgba(20,15,10,0.07)]">
           <p className="text-[17px] leading-8 text-[#475357]">
             The idea for Vidapouch came from watching people I love manage
             supplement routines that were important, but difficult to keep
             organized. Multiple bottles. Different timing. Doctor-guided
             recommendations. Family members trying to help. What should have
             felt supportive started to feel overwhelming.
           </p>

           <p className="mt-5 text-[17px] leading-8 text-[#475357]">
             Vidapouch is built around a simple belief: if a routine matters,
             it should be easier to follow.
           </p>
         </div>
       </div>
     </section>

     <section className="bg-[#F3E9DD] px-6 py-20">
       <div className="mx-auto max-w-[980px] text-center">
         <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
           WHAT WE BELIEVE
         </p>

         <h2
           className="mx-auto mt-4 max-w-[760px] text-[38px] leading-[1.05] tracking-[-0.035em] lg:text-[56px]"
           style={{ fontFamily: "Georgia, serif" }}>

           Wellness should fit into your life — not take it over.
         </h2>

         <div className="mt-12 grid gap-5 md:grid-cols-3">
           <BeliefCard
             title="Clarity"
             text="You should know what you’re taking and why it belongs in your routine."
           />
           <BeliefCard
             title="Consistency"
             text="The easier a routine is to follow, the more realistic it becomes."
           />
           <BeliefCard
             title="Support"
             text="Your goals can change, and your routine should be able to evolve with you."
           />
         </div>
       </div>
     </section>

     <section className="bg-[#EFE2D4] px-6 py-20">
       <div className="mx-auto grid max-w-[1120px] items-center gap-10 rounded-[36px] border border-[#D6CCBF] bg-[#F8F2EA]/90 px-8 py-14 shadow-[0_30px_90px_rgba(20,15,10,0.08)] lg:grid-cols-[1fr_1fr] lg:px-12">
         <div>
           <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
             THE NAME
           </p>

           <h2
             className="mt-4 text-[38px] leading-[1.06] tracking-[-0.035em] lg:text-[54px]"
             style={{ fontFamily: "Georgia, serif" }}>

             Vida means life.
           </h2>

           <p className="mt-5 text-[17px] leading-8 text-[#475357]">
             Vidapouch is a pouch designed around the life someone is trying to
             live — more energy, more calm, better consistency, fewer scattered
             bottles, and a routine that feels possible.
           </p>
         </div>

         <div className="rounded-[30px] border border-[#DDD7CF] bg-white/55 p-8 text-center">
           <img
             src="/vidapouch_pouch.png"
             alt="Vidapouch pouch"
             className="mx-auto w-full max-w-[280px] object-contain drop-shadow-2xl"
           />
           <p className="mt-6 text-[13px] uppercase tracking-[0.2em] text-[#8C1D40]">
             A pouch full of possibility
           </p>
         </div>
       </div>
     </section>

     <section className="bg-[#F3E9DD] px-6 py-20">
       <div className="mx-auto max-w-[900px] rounded-[32px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-8 py-12 text-center shadow-[0_30px_80px_rgba(20,15,10,0.08)]">
         <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
           OUR PROMISE
         </p>

         <h2
           className="mx-auto mt-4 max-w-[680px] text-[38px] leading-[1.08] tracking-[-0.035em] lg:text-[54px]"
           style={{ fontFamily: "Georgia, serif" }}>

           We’re building for real routines, not perfect ones.
         </h2>

         <p className="mx-auto mt-5 max-w-[620px] text-[17px] leading-8 text-[#475357]">
           Vidapouch is here to make supplement routines easier to understand,
           easier to follow, and easier to adjust as life changes.
         </p>

         <p className="mx-auto mt-6 max-w-[620px] text-[13px] leading-6 text-[#687377]">
           Vidapouch is designed to help organize supplement routines. It does
           not diagnose, treat, cure, or prevent disease, and it is not a
           replacement for medical advice.
         </p>

         <a
           href="/waitlist"
           className="mt-8 inline-block rounded-full bg-[#081620] px-8 py-4 text-[14px] tracking-[0.08em] text-white">

           GET EARLY ACCESS
         </a>
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

function BeliefCard({ title, text }: { title: string; text: string }) {
 return (
   <div className="rounded-[28px] border border-[#D6CCBF] bg-[#F8F2EA]/90 p-7 shadow-[0_18px_50px_rgba(20,15,10,0.05)]">
     <h3
       className="text-[28px] leading-tight tracking-[-0.025em]"
       style={{ fontFamily: "Georgia, serif" }}>

       {title}
     </h3>
     <p className="mt-4 text-[16px] leading-7 text-[#475357]">{text}</p>
   </div>
 );
}
