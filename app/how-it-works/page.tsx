import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";


export default function HowItWorksPage() {
 return (
   <main className="min-h-screen bg-[#F5EDE3] text-[#0D171D]">
     <Navbar />

     {/* HERO */}
     <section className="border-b border-[#D9CFC4] px-6 pb-16 pt-14 text-center lg:pb-20 lg:pt-20">
       <div className="mx-auto max-w-[980px]">
         <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-[#8C1D40]">
           HOW IT WORKS
         </p>

         <h1
           className="mx-auto mt-5 max-w-[850px] text-[46px] leading-[1.02] tracking-[-0.045em] sm:text-[56px] lg:text-[72px]"
           style={{
             fontFamily: 'Georgia, "Times New Roman", serif',
           }}>

           A personalized supplement routine, built around you.
         </h1>

         <p className="mx-auto mt-6 max-w-[680px] text-[17px] leading-8 text-[#435057] sm:text-[18px]">
           Start the way that&apos;s easiest for you. Then we help organize,
           refine, and simplify your routine into ready-to-take daily pouches.
         </p>
       </div>
     </section>

     {/* THREE WAYS TO START */}
     <section className="px-6 py-16 lg:py-20">
       <div className="mx-auto max-w-[1180px]">
         <div className="text-center">
           <h2
             className="text-[34px] leading-tight tracking-[-0.035em] sm:text-[42px]"
             style={{
               fontFamily: 'Georgia, "Times New Roman", serif',
             }}>

             Three ways to get started
           </h2>

           <p className="mt-3 text-[16px] text-[#566267]">
             Choose the option that works best for you.
           </p>
         </div>

         <div className="mt-10 grid gap-5 lg:grid-cols-3">
           <StartCard
             label="A. CALL"
             icon={<PhoneIcon />}
             title="Call the VidaPouch Concierge"
             text="Speak with a real person who can learn about your current routine, the brands you trust, and what you need help organizing."
             cta="CALL THE CONCIERGE"
             href="tel:+15082438404"
             primary={false}
           />

           <StartCard
             label="B. USE VIDASEARCH"
             icon={<SparkleIcon />}
             title="Use VidaSearch"
             subtitle="Powered by AI"
             text="Explore supplements, compare brands, ask questions, and build a routine before adding it directly to VidaPouch."
             cta="START VIDASEARCH"
             href="https://vidasearch.com"
             primary
           />

           <StartCard
             label="C. EMAIL"
             icon={<MailIcon />}
             title="Email Us"
             text="Prefer to reach out in writing? Send us your questions and our team can help point you in the right direction."
             cta="EMAIL SUPPORT"
             href="mailto:concierge@vidapouch.com"
             primary={false}
           />
         </div>

         <div className="mt-7 flex items-center justify-center gap-3 text-center text-[13px] leading-6 text-[#667175]">
           <ShieldIcon />
           <span>
             Your information is handled privately. We&apos;re here to make the
             process simple.
           </span>
         </div>
       </div>
     </section>

     {/* PROCESS */}
     <section className="border-y border-[#DED4CA] bg-[#FBF7F1] px-6 py-18 lg:py-22">
       <div className="mx-auto max-w-[1180px]">
         <div className="text-center">
           <p className="text-[12px] font-medium uppercase tracking-[0.26em] text-[#8C1D40]">
             FROM ROUTINE TO POUCH
           </p>

           <h2
             className="mt-4 text-[36px] tracking-[-0.035em] sm:text-[46px]"
             style={{
               fontFamily: 'Georgia, "Times New Roman", serif',
             }}>

             Here&apos;s how VidaPouch works
           </h2>
         </div>

         <div className="relative mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
           <div className="absolute left-[12%] right-[12%] top-[27px] hidden h-px bg-[#D2C6BA] lg:block" />

           <ProcessStep
             number="01"
             icon={<ClipboardIcon />}
             title="Tell us about your routine"
             text="Share what you take today, how many supplements are in your routine, and the brands you already trust."
           />

           <ProcessStep
             number="02"
             icon={<ChatIcon />}
             title="Refine it with guidance"
             text="Use VidaSearch or work with the concierge to explore options, ask questions, and make adjustments."
           />

           <ProcessStep
             number="03"
             icon={<ClockIcon />}
             title="We organize it for your day"
             text="Your supplements are grouped into simple morning, evening, or custom time-based pouches."
           />

           <ProcessStep
             number="04"
             icon={<BoxIcon />}
             title="Delivered, ready to take"
             text="Your pouches arrive organized, labeled, and ready — helping eliminate bottles and daily sorting."
           />
         </div>
       </div>
     </section>




{/* YOUR SUPPLEMENTS, ORGANIZED AROUND YOUR LIFE */}
<section className="px-6 py-10 lg:py-12">
 <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-[28px] border border-[#D7CCC1] bg-[#F4E9DE] shadow-[0_18px_50px_rgba(25,18,12,0.06)] lg:h-[540px] lg:grid-cols-[0.92fr_1.08fr]">

{/* LEFT — APP IMAGE */}
<div className="relative h-[420px] overflow-hidden sm:h-[470px] lg:h-full">
 <img
   src="/images/how-it-works/app2.png"
   alt="VidaPouch app showing a personalized daily supplement routine"
   className="absolute inset-0 h-full w-full object-cover object-center"
 />
</div>

   {/* RIGHT — CONTENT */}
   <div className="flex h-full items-center px-7 py-7 sm:px-9 lg:px-11 lg:py-8">
     <div className="w-full">

       <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8C1D40]">
         SIMPLE. PERSONAL. ORGANIZED.
       </p>

       <h2
         className="mt-3 max-w-[500px] text-[32px] leading-[1.03] tracking-[-0.035em] sm:text-[38px] lg:text-[42px]"
         style={{
           fontFamily: 'Georgia, "Times New Roman", serif',
         }}>

         Your supplements, organized around your life.
       </h2>

       <p className="mt-4 max-w-[500px] text-[14px] leading-6 text-[#435057]">
         Scan your pouch anytime to review what&apos;s inside, see your routine,
         and manage everything in one simple place.
       </p>

       {/* FEATURES */}
       <div className="mt-6 space-y-4">

         <div className="flex items-center gap-3.5">
           <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-[#DDC9BC] bg-[#F7E8DF] text-[#8C1D40]">
             <CalendarFeatureIcon />
           </div>

           <div>
             <h3
               className="text-[17px] leading-tight text-[#142028]"
               style={{
                 fontFamily: 'Georgia, "Times New Roman", serif',
               }}>

               Stay on track
             </h3>

             <p className="mt-0.5 text-[12px] leading-5 text-[#47545A]">
               See today&apos;s pouches and keep your routine organized.
             </p>
           </div>
         </div>

         <div className="flex items-center gap-3.5">
           <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-[#DDC9BC] bg-[#F7E8DF] text-[#8C1D40]">
             <ChatFeatureIcon />
           </div>

           <div>
             <h3
               className="text-[17px] leading-tight text-[#142028]"
               style={{
                 fontFamily: 'Georgia, "Times New Roman", serif',
               }}>

               Get guidance
             </h3>

             <p className="mt-0.5 text-[12px] leading-5 text-[#47545A]">
               Ask VidaPouch AI questions and explore your routine.
             </p>
           </div>
         </div>

         <div className="flex items-center gap-3.5">
           <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-[#DDC9BC] bg-[#F7E8DF] text-[#8C1D40]">
             <AdjustFeatureIcon />
           </div>

           <div>
             <h3
               className="text-[17px] leading-tight text-[#142028]"
               style={{
                 fontFamily: 'Georgia, "Times New Roman", serif',
               }}>

               Your routine, your way
             </h3>

             <p className="mt-0.5 text-[12px] leading-5 text-[#47545A]">
               Review timing and make changes as your routine evolves.
             </p>
           </div>
         </div>
       </div>

       {/* PRIVACY */}
       <div className="mt-6 flex max-w-[410px] items-center gap-3 rounded-[13px] border border-[#DECFC3] bg-[#F8EEE6]/75 px-4 py-2.5">
         <div className="shrink-0 text-[#17252C]">
           <LockFeatureIcon />
         </div>

         <p className="text-[11px] leading-5 text-[#47545A]">
           Your routine information is kept private and secure.
         </p>
       </div>

     </div>
   </div>
 </div>
</section>






 


     {/* WHY NOT MULTIVITAMIN */}
     <section className="px-6 pb-20">
       <div className="mx-auto grid max-w-[1180px] gap-8 rounded-[34px] border border-[#D9CFC4] bg-[#FBF7F1] px-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-14">
         <div>
           <p className="text-[12px] font-medium uppercase tracking-[0.26em] text-[#8C1D40]">
             WHY NOT JUST A MULTIVITAMIN?
           </p>

           <h2
             className="mt-4 text-[36px] leading-[1.05] tracking-[-0.035em] sm:text-[46px]"
             style={{
               fontFamily: 'Georgia, "Times New Roman", serif',
             }}>

             Because your routine isn&apos;t one-size-fits-all.
           </h2>
         </div>

         <div className="rounded-[26px] border border-[#DDD3C8] bg-white/55 p-7 sm:p-8">
           <p className="text-[17px] leading-8 text-[#435057]">
             A multivitamin combines many ingredients into one fixed formula.
             VidaPouch works differently. It helps you organize individual
             supplements and brands into a routine that reflects what you
             actually choose to take.
           </p>
         </div>
       </div>
     </section>



{/* FINAL CTA — TWO WAYS TO BEGIN */}
<section className="px-6 pb-20 pt-6">
 <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[32px] bg-[#8C1D40] shadow-[0_24px_70px_rgba(35,10,18,0.16)]">
   <div className="grid lg:grid-cols-2">

     {/* LEFT — PERSONAL SUPPORT */}
     <div className="border-b border-white/15 px-8 py-10 sm:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
       <div className="grid h-full grid-cols-[58px_1fr] gap-5">

         <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-[#F8EBDD]">
           <HeartIcon />
         </div>

         <div className="grid h-full grid-rows-none lg:grid-rows-[auto_92px_112px_auto_auto]">






           <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#F1D7DE]">
             PERSONAL SUPPORT
           </p>

           <div className="flex items-start pt-3">
             <h2
               className="max-w-[430px] text-[32px] leading-[1.05] tracking-[-0.035em] text-[#FFF8F0] sm:text-[36px]"
               style={{
                 fontFamily: 'Georgia, "Times New Roman", serif',
               }}>

               We&apos;re building VidaPouch with you.
             </h2>
           </div>

           <div className="pt-3">
             <p className="max-w-[470px] text-[14px] leading-7 text-[#F4E7E2]">
               Want help getting started? Speak directly with the VidaPouch
               Concierge. We&apos;ll learn about your current routine, the brands
               you trust, and what you want organized into your VidaPouch.
             </p>
           </div>

           <div className="pt-5">
             <a
               href="tel:+18778481112"
               className="inline-flex min-w-[240px] justify-center rounded-full bg-[#FFF8F0] px-7 py-4 text-[12px] font-semibold tracking-[0.09em] text-[#8C1D40] transition hover:bg-white">

               CALL THE VIDAPOUCH CONCIERGE
             </a>
           </div>

           <p className="pt-3 text-[11px] leading-5 text-[#E8CFD5]">
             Personal guidance from the beginning.
           </p>

         </div>
       </div>
     </div>

     {/* RIGHT — VIDASEARCH */}
     <div className="bg-[#741831] px-8 py-10 sm:px-10 lg:px-12 lg:py-12">
       <div className="grid h-full grid-cols-[58px_1fr] gap-5">

         <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-[#F8EBDD]">
           <SparkleCTAIcon />
         </div>

         <div className="grid h-full grid-rows-none lg:grid-rows-[auto_92px_112px_auto_auto]">

           <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#F1D7DE]">
             FOUNDING MEMBER ACCESS
           </p>

           <div className="flex items-start pt-3">
             <h2
               className="max-w-[430px] text-[32px] leading-[1.05] tracking-[-0.035em] text-[#FFF8F0] sm:text-[36px]"
               style={{
                 fontFamily: 'Georgia, "Times New Roman", serif',
               }}>

               Be among the first to experience VidaPouch.
             </h2>
           </div>

           <div className="pt-3">
             <p className="max-w-[470px] text-[14px] leading-7 text-[#F4E7E2]">
               Become a Founding Member and receive your first month on us.
               Complete our short form, and we&apos;ll be in touch with your next steps.
             </p>
           </div>

           <div className="pt-5">
             
             
             
           <a
 href="/waitlist"
 className="inline-flex min-w-[240px] justify-center rounded-full border border-white/35 bg-transparent px-7 py-4 text-[12px] font-semibold tracking-[0.09em] text-white transition hover:bg-white/10">

 BECOME A FOUNDING MEMBER
</a>




           </div>

           <p className="pt-3 text-[11px] leading-5 text-[#E8CFD5]">
             No payment is required today.
           </p>

         </div>
       </div>
     </div>

   </div>
 </div>
</section>




{/*    
<Footer showCta={false} />*/}

<Footer />




   </main>
 );
}

function StartCard({
 label,
 icon,
 title,
 subtitle,
 text,
 cta,
 href,
 primary,
}: {
 label: string;
 icon: React.ReactNode;
 title: string;
 subtitle?: string;
 text: string;
 cta: string;
 href: string;
 primary: boolean;
}) {
 return (
   <div
     className={`flex min-h-[390px] flex-col items-center rounded-[28px] border px-7 py-8 text-center shadow-[0_14px_45px_rgba(20,15,10,0.04)] ${
       primary
         ? "border-[#CFAEB7] bg-[#FFF9F5]"
         : "border-[#DDD1C5] bg-[#FAF4ED]"
     }`}>

     <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#F3DDD8] text-[#8C1D40]">
       {icon}
     </div>

     <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8C1D40]">
       {label}
     </p>

     <h3
       className="mt-3 text-[27px] leading-[1.04]"
       style={{
         fontFamily: 'Georgia, "Times New Roman", serif',
       }}>

       {title}
     </h3>

     {subtitle && (
       <p className="mt-2 text-[12px] uppercase tracking-[0.12em] text-[#7A646B]">
         {subtitle}
       </p>
     )}

     <p className="mt-5 max-w-[300px] text-[15px] leading-7 text-[#47545A]">
       {text}
     </p>

     <div className="mt-auto pt-7">
       <a
         href={href}
         className={`inline-flex min-w-[190px] justify-center rounded-[12px] px-6 py-4 text-[12px] font-semibold tracking-[0.08em] transition ${
           primary
             ? "bg-[#9A203F] text-white hover:bg-[#7E1933]"
             : "border border-[#9A203F] bg-transparent text-[#8C1D40] hover:bg-[#F8E7E9]"
         }`}>

         {cta}
       </a>
     </div>
   </div>
 );
}

function ProcessStep({
 number,
 icon,
 title,
 text,
}: {
 number: string;
 icon: React.ReactNode;
 title: string;
 text: string;
}) {
 return (
   <div className="relative z-10 text-center">
     <div className="mx-auto flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[#D9C9BC] bg-[#FBF7F1] text-[18px] font-medium text-[#8C1D40]">
       {number}
     </div>

     <div className="mx-auto mt-6 flex h-[46px] w-[46px] items-center justify-center text-[#17252C]">
       {icon}
     </div>

     <h3
       className="mt-4 text-[21px] leading-tight"
       style={{
         fontFamily: 'Georgia, "Times New Roman", serif',
       }}>

       {title}
     </h3>

     <p className="mx-auto mt-3 max-w-[245px] text-[14px] leading-6 text-[#4F5A5F]">
       {text}
     </p>
   </div>
 );
}

function FeatureMini({
 icon,
 title,
 text,
}: {
 icon: React.ReactNode;
 title: string;
 text: string;
}) {
 return (
   <div>
     <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D3C4B5] bg-[#F8EEE5] text-[#15232A]">
       {icon}
     </div>

     <p className="mt-4 text-[14px] font-semibold text-[#16232A]">{title}</p>

     <p className="mt-1 text-[12px] leading-5 text-[#5C676B]">{text}</p>
   </div>
 );
}

function PouchLine({ label }: { label: string }) {
 return (
   <div className="flex items-center justify-between gap-4">
     <span>{label}</span>
     <span className="h-px flex-1 border-t border-dotted border-[#B7ADA3]" />
   </div>
 );
}

/* ICONS */

function PhoneIcon() {
 return (
   <svg
     width="34"
     height="34"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.7">

     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M3.5 5.5c0 8.3 6.7 15 15 15l2-3.5-4.5-2-2 2c-3.7-1.5-6.5-4.3-8-8l2-2-2-4.5-3.5 2z"
     />
   </svg>
 );
}

function SparkleIcon() {
 return (
   <svg
     width="35"
     height="35"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.6">

     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM6 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
     />
   </svg>
 );
}

function MailIcon() {
 return (
   <svg
     width="34"
     height="34"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.7">

     <rect x="3" y="5" width="18" height="14" rx="2" />
     <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
   </svg>
 );
}

function ShieldIcon() {
 return (
   <svg
     width="20"
     height="20"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M12 3 5 6v5c0 4.6 2.7 7.9 7 10 4.3-2.1 7-5.4 7-10V6l-7-3z"
     />
     <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
   </svg>
 );
}

function ShieldIconLarge() {
 return (
   <svg
     width="23"
     height="23"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M12 3 5 6v5c0 4.6 2.7 7.9 7 10 4.3-2.1 7-5.4 7-10V6l-7-3z"
     />
     <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
   </svg>
 );
}

function ClipboardIcon() {
 return (
   <svg
     width="34"
     height="34"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <rect x="5" y="4" width="14" height="17" rx="2" />
     <path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" />
   </svg>
 );
}

function ChatIcon() {
 return (
   <svg
     width="36"
     height="36"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M4 5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
     />
     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M9 9h5M9 12h3"
     />
   </svg>
 );
}

function ClockIcon() {
 return (
   <svg
     width="36"
     height="36"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <circle cx="12" cy="12" r="9" />
     <path strokeLinecap="round" d="M12 7v5l3 2" />
   </svg>
 );
}

function BoxIcon() {
 return (
   <svg
     width="36"
     height="36"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <path d="m4 7 8-4 8 4-8 4-8-4z" />
     <path d="M4 7v10l8 4 8-4V7M12 11v10" />
   </svg>
 );
}

function CalendarIcon() {
 return (
   <svg
     width="22"
     height="22"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <rect x="4" y="5" width="16" height="15" rx="2" />
     <path d="M8 3v4M16 3v4M4 9h16M8 13h2M12 13h2M8 16h2" />
   </svg>
 );
}

function LeafIcon() {
 return (
   <svg
     width="23"
     height="23"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M20 4c-8 0-13 3.6-13 9 0 3 2.1 5 5 5 5.3 0 8-5 8-14z"
     />
     <path strokeLinecap="round" d="M4 20c3-5 7-8 12-10" />
   </svg>
 );
}

function HeartIcon() {
 return (
   <svg
     width="30"
     height="30"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.5">

     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"
     />
   </svg>
 );
}


function CalendarFeatureIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6">
 
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path
        strokeLinecap="round"
        d="M8 3v4M16 3v4M3 9h18"
      />
    </svg>
  );
 }
 
 function ChatFeatureIcon() {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6">
 
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
      />
      <path
        strokeLinecap="round"
        d="M8 9h8M8 12h5"
      />
    </svg>
  );
 }
 
 function AdjustFeatureIcon() {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6">
 
      <path
        strokeLinecap="round"
        d="M4 7h7M15 7h5M4 12h3M11 12h9M4 17h9M17 17h3"
      />
      <circle cx="13" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="17" r="2" />
    </svg>
  );
 }
 
 function LockFeatureIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5">
 
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path
        strokeLinecap="round"
        d="M8 10V7a4 4 0 0 1 8 0v3"
      />
    </svg>
  );
 }

 function SparkleCTAIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5">
 
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
      />
    </svg>
  );
 }
 


