import FeatureItem from "./FeatureItem";

import {
 LeafIcon,
 ShieldIcon,
 PersonIcon,
 StarIcon,
} from "./HomeIcons";

const VIDASEARCH_URL =
 "https://vidasearch.com";

export default function Hero() {
 return (
   <section
     className="
       relative overflow-hidden
       bg-[#F3E9DD]
       min-[1024px]:min-h-[calc(100svh-84px)]
     ">




{/* Desktop background */}
<img
 src="/Hero-BG-final.png"
 alt=""
 aria-hidden="true"
 className="
   pointer-events-none
   absolute right-0 top-[-20px]
   hidden
   h-[96%] w-full
   object-contain
   object-right-top
   min-[1024px]:block
   min-[1280px]:top-[-30px]
   min-[1280px]:h-[98%]
 "
/>





     {/* Mobile background */}
     <img
       src="/Hero-BG-mobile.png"
       alt=""
       aria-hidden="true"
       className="
         pointer-events-none
         absolute inset-0
         h-full w-full
         object-cover object-top
         min-[1024px]:hidden
       "
     />

     {/* Desktop overlay */}
     <div
       className="
         pointer-events-none
         absolute inset-0 hidden
         min-[1024px]:block
         min-[1024px]:bg-[linear-gradient(to_right,rgba(243,233,221,0.98)_0%,rgba(243,233,221,0.92)_31%,rgba(243,233,221,0.58)_48%,rgba(243,233,221,0.12)_67%,rgba(243,233,221,0)_82%)]
       "
     />

     {/* Mobile overlay */}
     <div
       className="
         pointer-events-none
         absolute inset-0
         min-[1024px]:hidden
       "
       style={{
         background:
           "linear-gradient(to bottom, rgba(243,233,221,.15) 0%, rgba(243,233,221,.38) 48%, rgba(243,233,221,.84) 78%, rgba(243,233,221,1) 100%)",
       }}
     />

     <div
       className="
         relative mx-auto flex
         max-w-[1440px]
         px-5 pb-14 pt-16
         sm:px-8
         md:py-18
         lg:px-10
         min-[1024px]:min-h-[calc(100svh-84px)]
         min-[1024px]:items-center
         min-[1024px]:py-14
       ">

       <div
         className="
           mx-auto w-full max-w-[650px]
           text-center
           min-[1024px]:mx-0
           min-[1024px]:max-w-[590px]
           min-[1024px]:text-left
         ">

         {/* Eyebrow */}
         <p
           className="
             mb-4 text-[11px]
             uppercase tracking-[0.22em]
             text-[#8C1D40]
             sm:text-[12px]
           ">

           YOUR SUPPLEMENT ROUTINE, SIMPLIFIED
         </p>

         {/* Heading */}
         <h1
           className="
             text-[46px] leading-[0.94]
             tracking-[-0.045em]
             text-[#081620]
             sm:text-[62px]
             min-[1024px]:text-[72px]
             min-[1280px]:text-[76px]
           "
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>

           Your wellness.
           <br />
           On autopilot.
         </h1>

         {/* Main copy */}
         <p
           className="
             mx-auto mt-6 max-w-[575px]
             text-[17px] leading-[1.75]
             text-[#3E4A4E]
             sm:text-[18px]
             min-[1024px]:mx-0
           ">

{/*<strong>VidaPouch</strong> turns your supplements into personalized daily pouches - 
           organized for morning and evening and delivered to your door.
           <strong>VidaSearch</strong>, our AI-powered supplement search
           Join the waitlist or get help from a Supplement Concierge. */}


           <strong>VidaPouch</strong> turns your supplements into simple,
           personalized daily pouches. Use{" "}
           <strong>VidaSearch</strong>, our AI-powered supplement search
           assistant, to choose what goes inside, or get help from a Supplement Concierge.
         </p>

         {/* Supporting copy */}
         <p
           className="
             mx-auto mt-4 max-w-[570px]
             text-[15px] leading-7
             text-[#6B7478]
             min-[1024px]:mx-0
           ">

           Become a Founding Member and get your first month
           on us. No payment is required today.
         </p>

         {/* Mobile CTAs */}
         <div
           className="
             mt-8 flex flex-col
             items-center gap-3
             min-[1024px]:hidden
           ">

           <a
             href="#founding-member"
             className="
               w-full max-w-[340px]
               rounded-full bg-[#081620]
               px-8 py-4
               text-center text-[13px]
               font-medium tracking-[0.08em]
               text-white transition
               hover:bg-[#1B2529]
               focus-visible:outline-none
               focus-visible:ring-2
               focus-visible:ring-[#8C1D40]
               focus-visible:ring-offset-2
               focus-visible:ring-offset-[#F3E9DD]
             "
             aria-label="Become a VidaPouch Founding Member">

             BECOME A FOUNDING MEMBER
           </a>

           <a
             href={VIDASEARCH_URL}
             className="
               w-full max-w-[340px]
               rounded-full
               border border-[#1B2529]
               bg-white/35
               px-8 py-4
               text-center text-[13px]
               font-medium tracking-[0.08em]
               text-[#1B2529]
               backdrop-blur-sm
               transition
               hover:bg-white/60
               focus-visible:outline-none
               focus-visible:ring-2
               focus-visible:ring-[#8C1D40]
               focus-visible:ring-offset-2
               focus-visible:ring-offset-[#F3E9DD]
             ">

             BUILD MY VIDAPOUCH
           </a>

           <p
             className="
               mt-1 text-[12px]
               tracking-[0.04em]
               text-[#6B7478]
             ">

             Powered by VidaSearch
           </p>
         </div>

         {/* Desktop CTAs */}
         <div
           className="
             mt-8 hidden
             min-[1024px]:flex
             min-[1024px]:items-center
             min-[1024px]:justify-start
             min-[1024px]:gap-3
           ">

           <a
             href="#founding-member"
             className="
               rounded-full bg-[#081620]
               px-8 py-4
               text-center text-[13px]
               font-medium tracking-[0.08em]
               text-white transition
               hover:bg-[#1B2529]
               focus-visible:outline-none
               focus-visible:ring-2
               focus-visible:ring-[#8C1D40]
               focus-visible:ring-offset-2
               focus-visible:ring-offset-[#F3E9DD]
             "
             aria-label="Become a VidaPouch Founding Member">

             BECOME A FOUNDING MEMBER
           </a>

           <a
             href={VIDASEARCH_URL}
             className="
               rounded-full
               border border-[#1B2529]
               bg-white/35
               px-8 py-4
               text-center text-[13px]
               font-medium tracking-[0.08em]
               text-[#1B2529]
               backdrop-blur-sm
               transition
               hover:bg-white/60
               focus-visible:outline-none
               focus-visible:ring-2
               focus-visible:ring-[#8C1D40]
               focus-visible:ring-offset-2
               focus-visible:ring-offset-[#F3E9DD]
             ">

             BUILD MY VIDAPOUCH
           </a>
         </div>

         {/* VidaSearch attribution */}
         <a
           href={VIDASEARCH_URL}
           className="
             mt-3 hidden
             w-fit text-[12px]
             tracking-[0.04em]
             text-[#6B7478]
             transition
             hover:text-[#8C1D40]
             hover:underline
             min-[1024px]:inline-block
           "
           aria-label="Explore VidaSearch">

           Powered by VidaSearch
         </a>



{/* Concierge contact options */}
<div
 className="
   mt-5 text-center
   min-[1024px]:text-left
 ">

 <p className="text-[15px] text-[#5C666A]">
   Prefer personal help? Text or call a Supplement Concierge.
 </p>

 <div
   className="
     mt-2 flex flex-wrap
     items-center justify-center
     gap-x-4 gap-y-2
     min-[1024px]:justify-start
   ">

   <a
     href="sms:5082438404"
     className="
       text-[16px] font-semibold
       text-[#8C1D40]
       hover:underline
     ">

     TEXT THE CONCIERGE
   </a>

   <span
     aria-hidden="true"
     className="text-[#A39A91]">

     ·
   </span>

   <a
     href="tel:5082438404"
     className="
       text-[16px] font-semibold
       text-[#8C1D40]
       hover:underline
     ">

     CALL (508) 243-8404
   </a>
 </div>
</div>
         






         {/* Features */}
         <div
           className="
             mx-auto mt-9 grid
             max-w-[620px]
             grid-cols-2
             gap-x-6 gap-y-6
             sm:grid-cols-4
             min-[1024px]:mx-0
           ">

           <FeatureItem
             icon={<LeafIcon />}
             line1="AI-POWERED"
             line2="SEARCH"
           />

           <FeatureItem
             icon={<ShieldIcon />}
             line1="MONTHLY"
             line2="DELIVERY"
           />

           <FeatureItem
             icon={<PersonIcon />}
             line1="SUPPLEMENT"
             line2="CONCIERGE"
           />

           <FeatureItem
             icon={<StarIcon />}
             line1="PERSONALIZED"
             line2="FOR YOU"
           />
         </div>
       </div>
     </div>
   </section>
 );
}
