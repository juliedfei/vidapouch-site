import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";


export default function AboutPage() {


 return (
   <main className="min-h-screen bg-[#F3E9DD] text-[#0E171B]">
     <Navbar />

     <section className="bg-[linear-gradient(180deg,#F3E9DD_0%,#EFE2D4_100%)] px-6 pb-8 pt-16 text-center lg:pb-8 lg:pt-22">



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
           Vidapouch organizes the supplements you choose into personalized daily pouches,
           built around your routine and designed to evolve with your goals - because taking care of
           yourself should be that easy.
         </p>

         <div
 className="mx-auto mt-10 flex w-full max-w-[760px] items-center gap-5 lg:max-w-[850px]"
 aria-hidden="true">

 <span className="h-px flex-1 bg-[#8C1D40]" />

 <svg
   width="22"
   height="22"
   viewBox="0 0 24 24"
   fill="none"
   stroke="#8C1D40"
   strokeWidth="1.5">

   <path
     strokeLinecap="round"
     strokeLinejoin="round"
     d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"
   />
 </svg>

 <span className="h-px flex-1 bg-[#8C1D40]" />
</div>



         
       </div>
     </section>

     <section className="bg-[#EFE2D4] px-6 pb-20 pt-10">

       <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
         <div>
           <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
             WHY IT STARTED
           </p>

           <h2
             className="mt-4 text-[38px] leading-[1.06] tracking-[-0.035em] lg:text-[56px]"
             style={{ fontFamily: "Georgia, serif" }}>

             VidaPouch began with my mom.
           </h2>
         </div>

         <div className="rounded-[32px] border border-[#D6CCBF] bg-[#F8F2EA]/90 p-8 shadow-[0_24px_70px_rgba(20,15,10,0.07)]">
           
           
           
         <p className="text-[17px] leading-8 text-[#475357]">
 She lives with SCA6, a form of hereditary cerebellar ataxia, and
 takes nine different supplements as part of her daily routine. I
 watched her open bottle after bottle, one at a time, every day—and
 kept thinking: why should something so important require so much
 time and effort?
</p>

<p className="mt-5 text-[17px] leading-8 text-[#475357]">
 I created VidaPouch to organize those supplements into simple,
 ready-to-take daily pouches. As everyday tasks become more
 difficult, I want her routine to become easier.
</p>

<p className="mt-5 text-[17px] leading-8 text-[#475357]">
 That idea grew into something larger: a simpler way for anyone to
 manage the supplements they choose to take—without sorting bottles,
 remembering complicated timing, or packing an entire collection
 when traveling.
</p>

<p
 className="mt-5 text-[20px] leading-8 text-[#0E171B]"
 style={{ fontFamily: "Georgia, serif" }}>

 Why overcomplicate something that could be simple? If a routine
 matters, it should fit into your life—not take precious time away
 from it.
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

        {/*} <a
           href="/waitlist"
           className="mt-8 inline-block rounded-full bg-[#081620] px-8 py-4 text-[14px] tracking-[0.08em] text-white">

           GET EARLY ACCESS
         </a>*/}
       </div>
     </section>

     <Footer />
   </main>
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
