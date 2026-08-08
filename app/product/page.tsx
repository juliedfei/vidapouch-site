import Navbar from "@/components/home/Navbar";

export default function ProductPage() {
 return (
   <main className="min-h-screen bg-[#F3E9DD] text-[#0E171B]">
     <Navbar />

     {/* HERO */}
     <section className="relative overflow-hidden border-b border-[#DDD2C5] bg-[#F3E9DD]">
       <div className="relative min-h-[680px] lg:min-h-[720px]">
         <img
           src="/images/product/product_hero.png"
           alt="VidaPouch personalized morning pouch beside a glass of water"
           className="absolute inset-0 h-full w-full object-cover object-[center_82%]"
         />

         {/* Soft left-side wash so copy remains readable */}
         <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(243,233,221,0.99)_0%,rgba(243,233,221,0.97)_24%,rgba(243,233,221,0.88)_36%,rgba(243,233,221,0.48)_49%,rgba(243,233,221,0.10)_62%,rgba(243,233,221,0)_72%)]" />

         <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1440px] items-center px-6 pb-32 pt-8 sm:px-10 lg:min-h-[720px] lg:px-16 lg:pb-36 lg:pt-10 xl:px-20">
           <div className="max-w-[590px]">
             <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-[#8C1D40]">
               THE PRODUCT
             </p>

             <h1
               className="mt-5 text-[48px] leading-[0.98] tracking-[-0.045em] sm:text-[58px] lg:text-[68px] xl:text-[74px]"
               style={{ fontFamily: "Georgia, serif" }}>

               Your supplements,
               <br />
               organized around
               <br />
               your day.
             </h1>

             <p className="mt-7 max-w-[480px] text-[18px] leading-[1.7] text-[#465256]">
               Personalized daily pouches that make your supplement routine
               easier to follow — without the bottles, sorting, or guesswork.
             </p>

             <a
               href="/how-it-works"
               className="mt-8 inline-flex items-center gap-4 rounded-full bg-[#8C1D40] px-7 py-4 text-[12px] font-medium uppercase tracking-[0.13em] text-white transition hover:bg-[#741733]">

               See How It Works
               <span aria-hidden="true">→</span>
             </a>
           </div>
         </div>
       </div>

       {/* HERO BENEFIT STRIP */}
       <div className="relative z-20 mx-auto -mt-14 max-w-[1320px] px-5 pb-10 sm:px-8 lg:px-12">
         <div className="grid overflow-hidden rounded-[28px] border border-[#DCCFC0] bg-[#F9F4ED]/95 shadow-[0_24px_70px_rgba(38,26,18,0.08)] backdrop-blur-md md:grid-cols-3">
           <HeroBenefit
             icon="◷"
             title="Organized by time of day"
             text="Morning and evening — simple, clear, and easy to follow."
           />

           <HeroBenefit
             icon="◇"
             title="Brands you trust"
             text="Built around carefully sourced, high-quality supplements."
           />

           <HeroBenefit
             icon="♡"
             title="Made for real life"
             text="Less sorting. Fewer bottles. One routine that fits your day."
             last
           />
         </div>
       </div>
     </section>

     {/* MORNING + EVENING */}
<section className="relative overflow-hidden bg-[#EFE2D4]">
 <div className="relative min-h-[560px] lg:min-h-[620px]">
   <img
     src="/images/product/product_morning_evening.png"
     alt="VidaPouch morning and evening personalized supplement pouches"
     className="absolute inset-0 h-full w-full object-cover object-[82%_center]"
   />

   {/* Soft cream wash behind the copy */}
   <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(239,226,212,0.99)_0%,rgba(239,226,212,0.96)_24%,rgba(239,226,212,0.84)_37%,rgba(239,226,212,0.42)_50%,rgba(239,226,212,0.08)_63%,rgba(239,226,212,0)_74%)]" />

   <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1440px] items-center px-6 py-16 sm:px-10 lg:min-h-[620px] lg:px-16 xl:px-20">
     <div className="max-w-[500px]">
       <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-[#8C1D40]">
         YOUR DAY, ALREADY ORGANIZED
       </p>

       <h2
         className="mt-5 text-[42px] leading-[1.03] tracking-[-0.04em] sm:text-[50px] lg:text-[58px]"
         style={{ fontFamily: "Georgia, serif" }}>

         A routine built
         <br />
         around your day.
       </h2>

       <p className="mt-6 max-w-[440px] text-[17px] leading-8 text-[#475357]">
         Your daily supplements are grouped into morning and evening pouches,
         so you always know what to take and when to take it.
       </p>

       <p className="mt-4 max-w-[440px] text-[14px] leading-7 text-[#697478]">
         Need additional timing? Custom memberships can accommodate more
         complex routines, including midday or other scheduled doses.
       </p>
     </div>
   </div>
 </div>
</section>

{/* WHAT YOU RECEIVE */}
<section className="bg-[#F6EEE5] px-6 py-16 lg:py-20">
 <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">

   {/* PRODUCT IMAGE */}
   <div className="flex justify-center lg:justify-start">
     <div className="aspect-square w-full max-w-[500px] overflow-hidden rounded-[28px]">
       <img
         src="/images/product/product_box.png"
         alt="Open VidaPouch box with personalized morning and evening supplement pouches"
         className="h-full w-full object-cover object-[62%_center]"
       />
     </div>
   </div>

   {/* COPY */}
   <div className="max-w-[560px]">
     <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#8C1D40]">
       WHAT YOU RECEIVE
     </p>

     <h2
       className="mt-3 text-[40px] leading-[1.02] tracking-[-0.04em] sm:text-[46px] lg:text-[50px]"
       style={{ fontFamily: "Georgia, serif" }}>

       A personalized system
       <br />
       of timed pouches.
     </h2>

     <p className="mt-4 max-w-[540px] text-[16px] leading-7 text-[#475357]">
       Each pouch contains the supplements for that moment in your day, so
       staying consistent becomes part of your routine instead of another task
       to manage.
     </p>

     <div className="mt-6 space-y-4">
       <TimingRow
         symbol="☀"
         title="Morning"
         text="Your morning supplements grouped together and ready to start your day."
       />

       <TimingRow
         symbol="☾"
         title="Evening"
         text="Your evening supplements organized for the end of your day."
       />

       <TimingRow
         symbol="+"
         title="Custom timing"
         text="Additional timing is available for more complex routines."
       />
     </div>
   </div>
 </div>
</section>





     

     {/* BRAND SOURCING */}
     <section className="bg-[#F3E9DD] px-6 py-20 lg:py-24">
       <div className="mx-auto max-w-[1180px] rounded-[36px] border border-[#D9CDBF] bg-[#F8F2EA] px-7 py-10 shadow-[0_24px_70px_rgba(30,20,15,0.05)] sm:px-10 lg:px-14 lg:py-14">
         <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr]">
           <div>
             <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-[#8C1D40]">
               KEEP THE BRANDS YOU TRUST
             </p>

             <h2
               className="mt-5 text-[40px] leading-[1.04] tracking-[-0.04em] sm:text-[48px] lg:text-[54px]"
               style={{ fontFamily: "Georgia, serif" }}>

               Familiar brands.
               <br />
               Careful sourcing.
             </h2>

             <p className="mt-6 max-w-[480px] text-[16px] leading-8 text-[#475357]">
               Tell us what you take today, including the brands you trust. We
               prioritize premium and practitioner-grade options while
               building a routine that feels familiar to you.
             </p>
           </div>

           <div>
             <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
               <BrandCircle>
                 <img
                   src="/images/product/brand_thorne.png"
                   alt="Thorne"
                   className="max-h-[42px] max-w-[105px] object-contain"
                 />
               </BrandCircle>

               <BrandCircle>
                 <img
                   src="/images/product/brand_pure_encapsulations.webp"
                   alt="Pure Encapsulations"
                   className="max-h-[46px] max-w-[120px] object-contain"
                 />
               </BrandCircle>

               <BrandCircle>
                 <img
                   src="/images/product/brand_designs_for_health.png"
                   alt="Designs for Health"
                   className="max-h-[48px] max-w-[120px] object-contain"
                 />
               </BrandCircle>

               <BrandCircle>
                 <img
                   src="/images/product/brand_metagenics.webp"
                   alt="Professional Formulas"
                   className="max-h-[44px] max-w-[115px] object-contain"
                 />
               </BrandCircle>

               <BrandCircle>
                 <img
                   src="/images/product/brand_nordic_naturals.png"
                   alt="Jacobs"
                   className="max-h-[44px] max-w-[105px] object-contain"
                 />
               </BrandCircle>

               <BrandCircle>
                 <img
                   src="/images/product/brand_ortho_molecular.avif"
                   alt="Ortho Molecular Products"
                   className="max-h-[46px] max-w-[120px] object-contain"
                 />
               </BrandCircle>
             </div>

             <p className="mt-5 text-center text-[11px] leading-5 text-[#7A8386]">
               Brand examples are illustrative. Availability may vary by
               routine and sourcing.
             </p>
           </div>
         </div>
       </div>
     </section>

{/* CONNECTED POUCH */}
<section className="bg-[#F6EEE5] py-20">
 <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-6 lg:grid-cols-[0.95fr_1.05fr]">

   {/* IMAGE */}
<div className="flex justify-center">
 <div className="flex aspect-square w-full max-w-[430px] items-center justify-center rounded-[30px] bg-[#E8D9C8] p-8 shadow-[0_20px_60px_rgba(30,20,15,0.08)]">
   <img
     src="/images/product/product_pouch_back.png"
     alt="Back of VidaPouch pouch showing QR code"
     className="max-h-[360px] w-auto object-contain drop-shadow-[0_18px_30px_rgba(30,20,15,0.12)]"
   />
 </div>
</div>

   {/* TEXT */}
   <div className="max-w-[540px]">
     <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-[#8C1D40]">
       A POUCH THAT STAYS CONNECTED
     </p>

     <h2
       className="mt-4 text-[50px] leading-[0.98] tracking-[-0.04em]"
       style={{ fontFamily: "Georgia, serif" }}>

       More than packaging.
       <br />
       A routine interface.
     </h2>

     <p className="mt-5 text-[17px] leading-8 text-[#475357]">
       Scan your pouch to stay connected to your routine—from reminders and
       ingredient information to future adjustments as your needs change.
     </p>

     <div className="mt-8 space-y-5">
       <CompactFeature
         icon="◷"
         title="Scan to set reminders"
         text="Stay consistent without having to think about timing."
       />

       <CompactFeature
         icon="⌘"
         title="Scan to adjust your routine"
         text="Update your routine whenever your schedule or goals change."
       />

       <CompactFeature
         icon="i"
         title="Know what you're taking"
         text="See every supplement and quantity inside your pouch."
       />
     </div>
   </div>
 </div>
</section>
     

{/* INSERT CARD HERO */}
<section className="bg-[#EFE2D4] px-6 py-16 lg:py-20">
 <div className="mx-auto max-w-[1180px]">
   <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">

     {/* TEXT */}
     <div className="max-w-[500px]">
       <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-[#8C1D40]">
         YOUR INSERT CARD
       </p>

       <h2
         className="mt-4 text-[42px] leading-[1.03] tracking-[-0.04em] sm:text-[48px] lg:text-[54px]"
         style={{ fontFamily: "Georgia, serif" }}>

         Clarity in every box.
         <br />
         Confidence in every dose.
       </h2>

       <p className="mt-5 max-w-[470px] text-[16px] leading-7 text-[#475357]">
         Every VidaPouch includes a personalized insert card that clearly shows
         each supplement, exact quantity, and your daily routine—making every
         pouch effortless to understand.
       </p>
     </div>

     {/* IMAGE */}
     <div className="flex justify-center lg:justify-end">
       <div className="w-full max-w-[620px] overflow-hidden rounded-[28px]">
         <img
           src="/images/product/insert_card.png"
           alt="VidaPouch personalized insert card"
           className="block h-auto w-full"
         />
       </div>
     </div>

   </div>
 </div>
</section>



{/* MEMBERSHIPS */}
<section className="bg-[#F3E9DD] px-6 py-20 lg:py-24">
 <div className="mx-auto max-w-[1180px]">

   {/* HEADER */}
   <div className="text-center">
     <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#8C1D40]">
       BUILT AROUND YOUR ROUTINE
     </p>

     <h2
       className="mx-auto mt-5 max-w-[820px] text-[42px] leading-[1.03] tracking-[-0.04em] sm:text-[50px] lg:text-[58px]"
       style={{
         fontFamily: 'Georgia, "Times New Roman", serif',
       }}>

       Choose the membership that fits how much you take.
     </h2>

     <p className="mx-auto mt-5 max-w-[670px] text-[16px] leading-7 text-[#475357]">
       From simple daily routines to more complete plans, your VidaPouch
       membership is based on the number of supplements in your routine.
     </p>
   </div>

   {/* MEMBERSHIP CARDS */}
   <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

     <MembershipTierCard
       name="Essential"
       count="Up to 3 supplements"
       price="$59.99"
       description="A simple, streamlined daily routine."
       tone="essential"
       icon="leaf"
     />

     <MembershipTierCard
       name="Standard"
       count="Up to 5 supplements"
       price="$79.99"
       description="More flexibility for your everyday routine."
       tone="standard"
       icon="sun"
     />

     <MembershipTierCard
       name="Premier"
       count="Up to 8 supplements"
       price="$99.99"
       description="For more complete supplement routines."
       tone="premier"
       icon="crown"
       featured
     />

     <MembershipTierCard
       name="Custom"
       count="More than 8 supplements"
       price="From $139.99"
       description="For complex routines or unique timing needs."
       tone="custom"
       icon="sliders"
     />

   </div>

   {/* FOUNDING MEMBER OFFER */}
   <div className="mt-9 overflow-hidden rounded-[24px] border border-[#D8CBBF] bg-[#FBF7F2] shadow-[0_14px_40px_rgba(20,15,10,0.05)]">
     <div className="flex flex-col items-center justify-between gap-7 px-7 py-7 text-center sm:px-9 lg:flex-row lg:text-left">

       {/* LEFT */}
       <div className="flex items-center gap-5">
         <div className="hidden h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border border-[#D9C7B7] bg-white text-[#B88A2F] sm:flex">
           <GiftIcon />
         </div>

         <div>
           <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8C1D40]">
             FOUNDING MEMBER OFFER
           </p>

           <h3
             className="mt-2 max-w-[650px] text-[27px] leading-tight text-[#0E171B] sm:text-[31px]"
             style={{
               fontFamily: 'Georgia, "Times New Roman", serif',
             }}>

             Become a Founding Member and save 20% on your first year.
           </h3>

           <p className="mt-2 text-[13px] leading-6 text-[#5F676B]">
             Founding Member enrollment is currently open for a limited time.
           </p>
         </div>
       </div>

       {/* RIGHT */}
       <div className="flex shrink-0 flex-col items-center gap-2.5 lg:items-end">
         <a
           href="tel:+15082438404"
           className="inline-flex min-w-[250px] justify-center rounded-full bg-[#8C1D40] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#731735]">

           CALL THE VIDAPOUCH CONCIERGE
         </a>

         <p className="text-[10px] text-[#7A8185]">
           Ask about current Founding Member benefits.
         </p>
       </div>

     </div>
   </div>

 </div>
</section>






     {/* FINAL CTA */}
     <section className="bg-[#8C1D40] px-6 py-20 text-white lg:py-24">
       <div className="mx-auto max-w-[850px] text-center">
         <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-white/75">
           GET STARTED WITh VIDASEARCH
         </p>

         <h2
           className="mx-auto mt-5 max-w-[720px] text-[42px] leading-[1.04] tracking-[-0.04em] sm:text-[50px] lg:text-[58px]"
           style={{ fontFamily: "Georgia, serif" }}>

           Make taking your supplements the easiest part of your day.
         </h2>

         <p className="mx-auto mt-6 max-w-[600px] text-[17px] leading-8 text-white/80">
           Explore and choose the supplements you'd like organized into your VidaPouch.
           VidaSearch helps you compare brands, build your routine, and get started
           in just a few minutes.
         </p>

         <a
           href="https://www.vidasearch.com"
           className="mt-9 inline-flex items-center gap-4 rounded-full bg-white px-8 py-4 text-[12px] font-medium uppercase tracking-[0.13em] text-[#8C1D40] transition hover:bg-[#F6EEE5]">

           GET STARTED
           <span aria-hidden="true">→</span>
         </a>
       </div>
     </section>
   </main>
 );
}

function HeroBenefit({
 icon,
 title,
 text,
 last = false,
}: {
 icon: string;
 title: string;
 text: string;
 last?: boolean;
}) {
 return (
   <div
     className={`flex gap-4 px-7 py-7 md:px-8 ${
       last ? "" : "border-b border-[#DED3C7] md:border-b-0 md:border-r"
     }`}>

     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E2D1C1] bg-[#F3E6D9] text-[22px] text-[#8C1D40]">
       {icon}
     </div>

     <div>
       <h3
         className="text-[18px] leading-tight tracking-[-0.02em]"
         style={{ fontFamily: "Georgia, serif" }}>

         {title}
       </h3>

       <p className="mt-2 text-[13px] leading-6 text-[#596468]">{text}</p>
     </div>
   </div>
 );
}

function TimingRow({
  symbol,
  title,
  text,
 }: {
  symbol: string;
  title: string;
  text: string;
 }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFE3D5] text-[19px] text-[#8C1D40]">
        {symbol}
      </div>
 
      <div className="pt-0.5">
        <h3
          className="text-[20px] leading-tight tracking-[-0.025em]"
          style={{ fontFamily: "Georgia, serif" }}>
 
          {title}
        </h3>
 
        <p className="mt-1 max-w-[440px] text-[14px] leading-6 text-[#596468]">
          {text}
        </p>
      </div>
    </div>
  );
 }

function BrandCircle({ children }: { children: React.ReactNode }) {
 return (
   <div className="flex aspect-square items-center justify-center rounded-full border border-[#DDD1C3] bg-[#FAF6F0] p-6">
     {children}
   </div>
 );
}


function CompactFeature({
  icon,
  title,
  text,
 }: {
  icon: string;
  title: string;
  text: string;
 }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2D4C7] bg-[#F3E8DD] text-[17px] text-[#8C1D40]">
        {icon}
      </div>
 
      <div>
        <h3
          className="text-[22px] leading-tight tracking-[-0.02em]"
          style={{ fontFamily: "Georgia, serif" }}>
 
          {title}
        </h3>
 
        <p className="mt-1 text-[15px] leading-6 text-[#596468]">
          {text}
        </p>
      </div>
    </div>
  );
 }




 function MembershipTierCard({
  name,
  count,
  price,
  description,
  tone,
  icon,
  featured = false,
 }: {
  name: string;
  count: string;
  price: string;
  description: string;
  tone: "essential" | "standard" | "premier" | "custom";
  icon: "leaf" | "sun" | "crown" | "sliders";
  featured?: boolean;
 }) {
  const styles = {
    essential: {
      icon: "border-[#B9CCE5] bg-[#F3F7FC] text-[#4E78A9]",
      label: "text-[#4E78A9]",
      accent: "bg-[#7FA6D7]",
    },
 
    standard: {
      icon: "border-[#E0CEAD] bg-[#FCF7EF] text-[#A8792C]",
      label: "text-[#A8792C]",
      accent: "bg-[#C3984D]",
    },
 
    premier: {
      icon: "border-[#DEC0CA] bg-[#FBF2F4] text-[#8C1D40]",
      label: "text-[#8C1D40]",
      accent: "bg-[#8C1D40]",
    },
 
    custom: {
      icon: "border-[#BCD0C8] bg-[#F2F7F5] text-[#426F61]",
      label: "text-[#426F61]",
      accent: "bg-[#5D8778]",
    },
  };
 
  const selected = styles[tone];
 
  return (
    <div
      className={`relative flex min-h-[390px] flex-col rounded-[24px] border bg-white p-7 transition-shadow duration-300 ${
        featured
          ? "border-[#CFA7B5] shadow-[0_18px_45px_rgba(95,28,48,0.09)] ring-1 ring-[#8C1D40]/15"
          : "border-[#DDD7CF] shadow-[0_10px_30px_rgba(20,15,10,0.045)] hover:shadow-[0_18px_45px_rgba(20,15,10,0.08)]"
      }`}>
 
      {/* FEATURED BADGE */}
      {featured && (
        <div className="absolute right-5 top-5 rounded-full bg-[#8C1D40] px-3.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
          MOST POPULAR
        </div>
      )}
 
      {/* ICON */}
      <div
        className={`flex h-[62px] w-[62px] items-center justify-center rounded-full border ${selected.icon}`}>
 
        <MembershipIcon type={icon} />
      </div>
 
      {/* SUPPLEMENT COUNT */}
      <p
        className={`mt-7 text-[10px] font-semibold uppercase tracking-[0.22em] ${selected.label}`}>
 
        {count}
      </p>
 
      {/* NAME */}
      <h3
        className="mt-2 text-[31px] leading-tight text-[#101A20]"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
 
        {name}
      </h3>
 
      {/* ACCENT LINE */}
      <div className={`mt-4 h-[2px] w-10 rounded-full ${selected.accent}`} />
 
      {/* DESCRIPTION */}
      <p className="mt-5 min-h-[58px] text-[14px] leading-6 text-[#475357]">
        {description}
      </p>
 
      {/* PRICE */}
      <div className="mt-auto pt-8">
        <p
          className="text-[29px] leading-none tracking-[-0.025em] text-[#101A20]"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
 
          {price}
        </p>
 
        <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#667175]">
          per month
        </p>
      </div>
    </div>
  );
 }
 


 function MembershipIcon({
  type,
 }: {
  type: "leaf" | "sun" | "crown" | "sliders";
 }) {
  if (type === "leaf") {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5">
 
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 4c-7.5.4-12 4-12 9 0 3 2 5 5 5 4.8 0 7-4.8 7-14z"
        />
 
        <path
          strokeLinecap="round"
          d="M5 20c2.5-4.5 6-7.5 11-10"
        />
      </svg>
    );
  }
 
  if (type === "sun") {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5">
 
        <circle cx="12" cy="12" r="4" />
 
        <path
          strokeLinecap="round"
          d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"
        />
      </svg>
    );
  }
 
  if (type === "crown") {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5">
 
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 8l4 4 4-7 4 7 4-4-2 10H6L4 8z"
        />
 
        <path
          strokeLinecap="round"
          d="M7 21h10"
        />
      </svg>
    );
  }
 
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5">
 
      <path
        strokeLinecap="round"
        d="M4 7h6M14 7h6M4 12h10M18 12h2M4 17h3M11 17h9"
      />
 
      <circle cx="12" cy="7" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  );
 }
 

 




 
 function GiftIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5">
 
      <rect x="3" y="9" width="18" height="12" rx="2" />
 
      <path
        strokeLinecap="round"
        d="M12 9v12M3 13h18M2 6h20v3H2z"
      />
 
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6H8.5A2.5 2.5 0 1 1 11 3.5L12 6zM12 6h3.5A2.5 2.5 0 1 0 13 3.5L12 6z"
      />
    </svg>
  );
 }

