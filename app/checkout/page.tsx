"use client";

import { useEffect, useState } from "react";
import type { Supplement } from "@/components/routine-builder/types";

type SavedPouchPlan = {
 morning: Supplement[];
 evening: Supplement[];
};

function formatPrice(value: number) {
 return new Intl.NumberFormat("en-US", {
   style: "currency",
   currency: "USD",
   maximumFractionDigits: 0,
 }).format(value);
}

export default function CheckoutPage() {
 const [plan, setPlan] = useState<SavedPouchPlan>({
   morning: [],
   evening: [],
 });

 useEffect(() => {
   const savedPlan = window.localStorage.getItem("vidapouch_checkout_plan");

   if (!savedPlan) return;

   try {
     setPlan(JSON.parse(savedPlan));
   } catch {
     setPlan({ morning: [], evening: [] });
   }
 }, []);

 const allSupplements = [...plan.morning, ...plan.evening];

 const monthlyTotal = allSupplements.reduce(
   (total, supplement) => total + (supplement.monthlyPrice || 0),
   0
 );

 return (
   <main className="min-h-screen bg-[#F3E9DD] px-4 py-8 text-[#0E171B] sm:px-8 sm:py-10">
     <section className="mx-auto max-w-[980px] rounded-[28px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-5 py-8 shadow-[0_24px_70px_rgba(20,15,10,0.08)] sm:rounded-[34px] sm:px-10 sm:py-10">
       <a
         href="/routine-builder"
         className="text-[13px] uppercase tracking-[0.14em] text-[#8C1D40]">

         ← Back to routine
       </a>

       <p className="mt-8 text-[10px] uppercase tracking-[0.24em] text-[#8C1D40] sm:text-[11px]">
         Vidapouch Checkout
       </p>

       <h1
         className="mt-4 text-[38px] leading-[1.02] tracking-[-0.04em] text-[#081620] sm:text-[58px]"
         style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

         Review your monthly pouch.
       </h1>

       <p className="mt-5 max-w-[680px] text-[16px] leading-8 text-[#475357] sm:text-[17px]">
         Your selected supplements will be organized into ready-to-take morning
         and evening packets and prepared as a monthly subscription.
       </p>

       <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
         <div className="rounded-[26px] border border-[#DDD7CF] bg-white/45 p-5">
           <h2
             className="text-[28px] tracking-[-0.03em]"
             style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

             Your pouch plan
           </h2>

           <div className="mt-5 grid gap-5 md:grid-cols-2">
             <PouchColumn title="Morning pouch" items={plan.morning} />
             <PouchColumn title="Evening pouch" items={plan.evening} />
           </div>
         </div>

         <aside className="rounded-[26px] border border-[#DDD7CF] bg-[#081620] p-5 text-white">
           <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
             Monthly total
           </p>

           <p
             className="mt-3 text-[42px] leading-none tracking-[-0.04em]"
             style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

             {formatPrice(monthlyTotal)}
             <span className="ml-2 text-[15px] font-normal tracking-normal text-white/60">
               / month
             </span>
           </p>

           <p className="mt-3 text-sm leading-6 text-white/65">
             {allSupplements.length} selected item
             {allSupplements.length === 1 ? "" : "s"} across your daily
             pouches.
           </p>

           <div className="mt-6 rounded-2xl border border-white/15 bg-white/8 p-4">
             <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">
               Subscription details
             </p>

             <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/70">
               <li>Monthly delivery</li>
               <li>Morning and evening packets</li>
               <li>Pause, cancel, or update anytime</li>
             </ul>
           </div>

           <button
             type="button"
             className="mt-6 w-full cursor-pointer rounded-full bg-white px-6 py-4 text-[13px] uppercase tracking-[0.08em] text-[#081620]">

             Continue to Payment
           </button>

           <p className="mt-4 text-xs leading-5 text-white/45">
             Payment processing will be connected in the next step.
           </p>
         </aside>
       </div>
     </section>
   </main>
 );
}

function PouchColumn({
 title,
 items,
}: {
 title: string;
 items: Supplement[];
}) {
 return (
   <div className="rounded-[22px] border border-[#DDD7CF] bg-[#F8F2EA]/75 p-4">
     <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C1D40]">
       {title}
     </p>

     <div className="mt-4 grid gap-3">
       {items.length > 0 ? (
         items.map((item, index) => (
           <div
             key={`${item.id || item.name}-${index}`}
             className="rounded-2xl border border-[#DDD7CF] bg-white/55 px-4 py-4">

             <p className="font-medium text-[#081620]">{item.name}</p>

             <p className="mt-1 text-sm leading-6 text-[#5D686C]">
               {item.dosage || "Dosage not added"}
               {item.monthlyPrice
                 ? ` · ${formatPrice(item.monthlyPrice)} / month`
                 : ""}
             </p>
           </div>
         ))
       ) : (
         <p className="text-sm leading-6 text-[#5D686C]">
           No supplements selected.
         </p>
       )}
     </div>
   </div>
 );
}