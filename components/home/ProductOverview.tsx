import ClarityCard from "./ClarityCard";

export default function ProductOverview() {
 return (
   <section className="bg-[#F3E9DD] px-5 pb-20 pt-16 sm:px-8 sm:pt-20 min-[1024px]:pt-20">
     <div className="mx-auto max-w-[1080px] rounded-[34px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-6 py-9 shadow-[0_24px_70px_rgba(20,15,10,0.08)] sm:px-10 sm:py-12">

       <div className="mx-auto max-w-[760px] text-center">

         <p className="text-[11px] uppercase tracking-[0.24em] text-[#8C1D40]">
           YOUR DAY, ORGANIZED
         </p>

         <h2
           className="mx-auto mt-4 max-w-[720px] text-[36px] leading-[1.06] tracking-[-0.035em] sm:text-[46px]"
           style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

           Your personalized supplement routine, simplified.
         </h2>

         <p className="mx-auto mt-4 max-w-[650px] text-[16px] leading-7 text-[#475357] sm:text-[17px]">
           Whether you already have a supplement routine or want help creating
           one, VidaPouch uses AI and our Supplement Concierge to organize
           everything into convenient daily pouches delivered to your door.
         </p>

       </div>

       <div className="mt-8 overflow-hidden rounded-[26px] border border-[#DDD7CF] bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
         <img
           src="/vidapouch_day_strip2.png"
           alt="VidaPouch daily strip"
           className="h-auto w-full object-cover"
         />
       </div>

       <div className="mt-8 grid gap-4 md:grid-cols-3">

         <ClarityCard
           title="1. Build your routine"
           text="Import your current supplements or let our AI and Supplement Concierge help create a personalized routine based on your goals."
         />

         <ClarityCard
           title="2. We organize everything"
           text="We organize your personalized routine into convenient daily pouches, ready to open whenever you need them."
         />

         <ClarityCard
           title="3. Delivered monthly"
           text="Your personalized pouches arrive at your door every month, making it simple to stay consistent."
         />

       </div>

       <p className="mx-auto mt-7 max-w-[720px] text-center text-[13px] leading-6 text-[#687377]">
         VidaPouch is designed to help organize supplement routines. It does
         not diagnose, treat, cure, or prevent disease, and it is not a
         replacement for medical advice.
       </p>

     </div>
   </section>
 );
}
