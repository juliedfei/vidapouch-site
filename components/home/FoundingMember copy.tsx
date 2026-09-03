"use client";

import {
 FormEvent,
 useState,
} from "react";

type SubmissionState =
 | "idle"
 | "submitting"
 | "success"
 | "error";

export default function FoundingMember() {
 const [
   submissionState,
   setSubmissionState,
 ] = useState<SubmissionState>("idle");

 const [
   errorMessage,
   setErrorMessage,
 ] = useState("");

 const [
  showPricing,
  setShowPricing,
 ] = useState(false);



 async function handleSubmit(
   event: FormEvent<HTMLFormElement>
 ) {
   event.preventDefault();

   setSubmissionState("submitting");
   setErrorMessage("");

   const form = event.currentTarget;
   const formData = new FormData(form);

   try {
     const response = await fetch(
       "/api/founding-member",
       {
         method: "POST",

         headers: {
           "Content-Type":
             "application/json",
         },

         body: JSON.stringify({
           customerName:
             formData.get("customerName"),

           customerEmail:
             formData.get("customerEmail"),

           customerPhone:
             formData.get("customerPhone"),
         }),
       }
     );

     const result =
       (await response.json()) as {
         success?: boolean;
         error?: string;
       };

     if (
       !response.ok ||
       !result.success
     ) {
       throw new Error(
         result.error ||
           "Unable to register right now."
       );
     }

     form.reset();
     setSubmissionState("success");
   } catch (error) {
     setErrorMessage(
       error instanceof Error
         ? error.message
         : "Unable to register right now."
     );

     setSubmissionState("error");
   }
 }

 return (
   <section
     id="founding-member"
     className="
       scroll-mt-24
       bg-[#F8F2EA]
       px-5 py-12
       sm:px-8 sm:py-16
       lg:px-10 lg:py-20
     ">

     <div
       className="
         mx-auto
         max-w-[1180px]
         overflow-hidden
         rounded-[32px]
         border border-[#D8CCBE]
         bg-white
         shadow-[0_24px_70px_rgba(31,26,22,0.10)]
       ">

       {/* HERO / FOUNDER INTRO */}
       <div
         className="
           grid
           bg-[#C8D8C2]
           lg:grid-cols-[0.95fr_1.05fr]
         ">

         <div
           className="
             px-7 py-10
             sm:px-10 sm:py-12
             lg:px-12 lg:py-16
           ">

           <p
             className="
               text-[11px]
               uppercase
               tracking-[0.22em]
               text-[#7D2945]
               sm:text-[12px]
             ">

             A WELCOME FROM JULIE
           </p>

           <div
             className="
               mt-5 flex
               items-center
               gap-5
             ">

             <img
               src="/images/home-v2/julie-concierge.png"
               alt="Julie, founder of VidaPouch"
               className="
                 h-20 w-20
                 shrink-0
                 rounded-full
                 border-2 border-white/70
                 object-cover
                 shadow-[0_8px_24px_rgba(24,49,38,0.14)]
                 sm:h-24 sm:w-24
               "
             />

             <div>
               <h2
                 className="
                   text-[30px]
                   leading-[1.08]
                   tracking-[-0.035em]
                   text-[#183126]
                   sm:text-[40px]
                 "
                 style={{
                   fontFamily:
                     'Georgia, "Times New Roman", serif',
                 }}>

                 “VidaPouch makes taking your supplements simple.”
               </h2>

               <p
                 className="
                   mt-3
                   text-[12px]
                   font-medium
                   uppercase
                   tracking-[0.12em]
                   text-[#5D3B47]
                 ">

                 Julie, Founder of VidaPouch
               </p>
             </div>
           </div>

           <p
             className="
               mt-7
               max-w-[530px]
               text-[16px]
               leading-7
               text-[#30332F]
             ">

             I created VidaPouch because managing
             multiple supplement bottles shouldn’t
             add more work to your day.
           </p>

           <p
             className="
               mt-4
               max-w-[530px]
               text-[16px]
               leading-7
               text-[#30332F]
             ">

             You tell us the supplements you take.
             We source them and organize them into
             convenient daily pouches for you.
           </p>

           <p
             className="
               mt-4
               max-w-[530px]
               text-[16px]
               leading-7
               text-[#30332F]
             ">

             No bottles to send us. No daily sorting.
             Just grab your pouch and go.
           </p>

           <p
             className="
               mt-5
               text-[18px]
               font-semibold
               leading-7
               text-[#8C1D40]
             ">

             That’s why your first month is on us.
           </p>
         </div>

         {/* PRODUCT TRANSFORMATION VISUAL */}
         <div
           className="
             flex
             items-center
             justify-center
             px-6 pb-10
             sm:px-10
             lg:px-10 lg:py-12
           ">

           <div
             className="
               w-full
               rounded-[28px]
               bg-white/55
               px-5 py-7
               sm:px-7 sm:py-8
             ">

             <p
               className="
                 text-center
                 text-[11px]
                 font-medium
                 uppercase
                 tracking-[0.18em]
                 text-[#7D2945]
               ">

               YOUR SUPPLEMENTS, MADE SIMPLE
             </p>

             <div
               className="
                 mt-5
                 flex
                 items-center
                 justify-center
                 gap-2
                 sm:gap-4
               ">

               <div
                 className="
                   flex min-w-0 flex-1
                   justify-center
                 ">

                 <img
                   src="/images/home-v2/supplement-bottles.PNG"
                   alt="Assorted supplement bottles"
                   className="
                     h-auto
                     max-h-[220px]
                     w-full
                     object-contain
                   "
                 />
               </div>

               <div
                 className="
                   flex h-10 w-10
                   shrink-0
                   items-center
                   justify-center
                   rounded-full
                   bg-[#183126]
                   text-xl
                   text-white
                   sm:h-12 sm:w-12
                 "
                 aria-hidden="true">

                 →
               </div>

               <div
                 className="
                   flex min-w-0 flex-1
                   justify-center
                 ">

                 <img
                   src="/images/home-v2/vidapouch-am-pm-pouches.PNG"
                   alt="VidaPouch morning and evening supplement pouches"
                   className="
                     h-auto
                     max-h-[240px]
                     w-full
                     object-contain
                   "
                 />
               </div>
             </div>

             <div
               className="
                 mt-5 grid
                 grid-cols-3
                 gap-2
                 text-center
               ">

               <div>
                 <div
                   className="
                     mx-auto flex
                     h-9 w-9
                     items-center
                     justify-center
                     rounded-full
                     border border-[#183126]/20
                     bg-white
                     text-[#183126]
                   ">

                   1
                 </div>

                 <p
                   className="
                     mt-2
                     text-[11px]
                     leading-4
                     text-[#39443F]
                   ">

                   Tell us what you take
                 </p>
               </div>

               <div>
                 <div
                   className="
                     mx-auto flex
                     h-9 w-9
                     items-center
                     justify-center
                     rounded-full
                     border border-[#183126]/20
                     bg-white
                     text-[#183126]
                   ">

                   2
                 </div>

                 <p
                   className="
                     mt-2
                     text-[11px]
                     leading-4
                     text-[#39443F]
                   ">

                   We source & organize
                 </p>
               </div>

               <div>
                 <div
                   className="
                     mx-auto flex
                     h-9 w-9
                     items-center
                     justify-center
                     rounded-full
                     border border-[#183126]/20
                     bg-white
                     text-[#183126]
                   ">

                   3
                 </div>

                 <p
                   className="
                     mt-2
                     text-[11px]
                     leading-4
                     text-[#39443F]
                   ">

                   Grab your pouch & go
                 </p>
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* SIGNUP SECTION */}
       <div
         className="
           grid
           lg:grid-cols-[0.9fr_1.1fr]
         ">

         {/* OFFER / VALUE */}
         <div
           className="
             border-b
             border-[#D8CCBE]
             bg-[#FBF8F4]
             px-7 py-10
             sm:px-10 sm:py-12
             lg:border-b-0
             lg:border-r
             lg:px-12 lg:py-16
           ">

           <p
             className="
               text-[12px]
               font-medium
               uppercase
               tracking-[0.18em]
               text-[#8C1D40]
             ">

             JOIN VIDAPOUCH
           </p>

           <h3
             className="
               mt-4
               text-[36px]
               leading-[1.08]
               tracking-[-0.025em]
               text-[#081620]
               sm:text-[44px]
             "
             style={{
               fontFamily:
                 'Georgia, "Times New Roman", serif',
             }}>

             Get your first month on us.
           </h3>

           <p
             className="
               mt-5
               max-w-[450px]
               text-[16px]
               leading-7
               text-[#5C666A]
             ">

             Personalized daily supplement pouches
             with plans starting at{" "}
             <span
               className="
                 font-semibold
                 text-[#081620]
               ">

               $59.99/month
             </span>{" "}
             after your free first month.
           </p>


           <button
 type="button"
 onClick={() => setShowPricing(true)}
 className="
   mt-2
   text-[13px]
   font-medium
   text-[#183126]
   underline
   underline-offset-4
   transition
   hover:text-[#8C1D40]
 ">

 View pricing
</button>




           <div
             className="
               mt-7
               space-y-4
             ">

             <div
               className="
                 flex items-start gap-3
               ">

               <div
                 className="
                   mt-0.5 flex
                   h-6 w-6
                   shrink-0
                   items-center
                   justify-center
                   rounded-full
                   bg-[#E5EEE1]
                   text-[12px]
                   font-bold
                   text-[#183126]
                 ">

                 ✓
               </div>

               <p
                 className="
                   text-[14px]
                   leading-6
                   text-[#394348]
                 ">

                 Your supplements organized into
                 convenient daily pouches.
               </p>
             </div>

             <div
               className="
                 flex items-start gap-3
               ">

               <div
                 className="
                   mt-0.5 flex
                   h-6 w-6
                   shrink-0
                   items-center
                   justify-center
                   rounded-full
                   bg-[#E5EEE1]
                   text-[12px]
                   font-bold
                   text-[#183126]
                 ">

                 ✓
               </div>

               <p
                 className="
                   text-[14px]
                   leading-6
                   text-[#394348]
                 ">

                 No need to send us your supplement
                 bottles.
               </p>
             </div>

             <div
               className="
                 flex items-start gap-3
               ">

               <div
                 className="
                   mt-0.5 flex
                   h-6 w-6
                   shrink-0
                   items-center
                   justify-center
                   rounded-full
                   bg-[#E5EEE1]
                   text-[12px]
                   font-bold
                   text-[#183126]
                 ">

                 ✓
               </div>

               <p
                 className="
                   text-[14px]
                   leading-6
                   text-[#394348]
                 ">

                 No charge today and no commitment
                 to a paid plan.
               </p>
             </div>
           </div>

           <div
             className="
               mt-8
               rounded-2xl
               border border-[#D8CCBE]
               bg-white
               px-5 py-4
             ">

             <p
               className="
                 text-[13px]
                 font-semibold
                 text-[#183126]
               ">

               First month free.
             </p>

             <p
               className="
                 mt-1
                 text-[12px]
                 leading-5
                 text-[#6B7477]
               ">

               Fill out the short form to join the
               waitlist. You will not be charged or
               enrolled today.
             </p>
           </div>
         </div>

         {/* FORM */}
         <div
           className="
             px-7 py-10
             sm:px-10 sm:py-12
             lg:px-12 lg:py-16
           ">

           {submissionState === "success" ? (
             <div
               role="status"
               className="
                 flex min-h-[430px]
                 flex-col
                 justify-center
               ">

               <p
                 className="
                   text-[12px]
                   font-medium
                   uppercase
                   tracking-[0.18em]
                   text-[#8C1D40]
                 ">

                 WELCOME TO VIDAPOUCH
               </p>

               <h3
                 className="
                   mt-4
                   text-[36px]
                   leading-tight
                   text-[#081620]
                 "
                 style={{
                   fontFamily:
                     'Georgia, "Times New Roman", serif',
                 }}>

                 You're on the list!
               </h3>

               <p
                 className="
                   mt-5
                   max-w-[470px]
                   text-[16px]
                   leading-7
                   text-[#5C666A]
                 ">

                 Thank you for joining VidaPouch.
                 We'll be in touch soon to help you
                 get started.
               </p>

               <a
                 href="https://vidasearch.com"
                 className="
                   mt-8 w-fit
                   rounded-full
                   bg-[#081620]
                   px-7 py-4
                   text-[12px]
                   font-medium
                   tracking-[0.08em]
                   text-white
                   transition
                   hover:bg-[#1B2529]
                 ">

                 EXPLORE VIDASEARCH
               </a>
             </div>
           ) : (
             <>
               <p
                 className="
                   text-[12px]
                   font-medium
                   uppercase
                   tracking-[0.18em]
                   text-[#8C1D40]
                 ">

                 JOIN THE WAITLIST
               </p>

               <h3
                 className="
                   mt-4
                   text-[32px]
                   leading-tight
                   text-[#081620]
                   sm:text-[38px]
                 "
                 style={{
                   fontFamily:
                     'Georgia, "Times New Roman", serif',
                 }}>

                 Ready for a simpler supplement
                 routine?
               </h3>

               <p
                 className="
                   mt-4
                   text-[15px]
                   leading-7
                   text-[#5C666A]
                 ">

                 Join the waitlist today and get your
                 first month of VidaPouch on us.
               </p>

               <form
                 onSubmit={handleSubmit}
                 className="mt-8 grid gap-5">

                 <div>
                   <label
                     htmlFor="customerName"
                     className="
                       block
                       text-[13px]
                       font-medium
                       text-[#28363C]
                     ">

                     Name
                   </label>

                   <input
                     id="customerName"
                     name="customerName"
                     type="text"
                     autoComplete="name"
                     maxLength={100}
                     className="
                       mt-2 w-full
                       rounded-2xl
                       border
                       border-[#CFC4B7]
                       bg-[#FCFAF7]
                       px-4 py-3.5
                       text-[#081620]
                       outline-none
                       transition
                       focus:border-[#8C1D40]
                       focus:ring-2
                       focus:ring-[#8C1D40]/15
                     "
                   />
                 </div>

                 <div>
                   <label
                     htmlFor="customerEmail"
                     className="
                       block
                       text-[13px]
                       font-medium
                       text-[#28363C]
                     ">

                     Email address
                   </label>

                   <input
                     id="customerEmail"
                     name="customerEmail"
                     type="email"
                     autoComplete="email"
                     maxLength={254}
                     required
                     className="
                       mt-2 w-full
                       rounded-2xl
                       border
                       border-[#CFC4B7]
                       bg-[#FCFAF7]
                       px-4 py-3.5
                       text-[#081620]
                       outline-none
                       transition
                       focus:border-[#8C1D40]
                       focus:ring-2
                       focus:ring-[#8C1D40]/15
                     "
                   />
                 </div>

                 <div>
                   <label
                     htmlFor="customerPhone"
                     className="
                       block
                       text-[13px]
                       font-medium
                       text-[#28363C]
                     ">

                     Phone number
                     <span
                       className="
                         ml-1
                         font-normal
                         text-[#7B8488]
                       ">

                       (optional)
                     </span>
                   </label>

                   <input
                     id="customerPhone"
                     name="customerPhone"
                     type="tel"
                     autoComplete="tel"
                     maxLength={30}
                     className="
                       mt-2 w-full
                       rounded-2xl
                       border
                       border-[#CFC4B7]
                       bg-[#FCFAF7]
                       px-4 py-3.5
                       text-[#081620]
                       outline-none
                       transition
                       focus:border-[#8C1D40]
                       focus:ring-2
                       focus:ring-[#8C1D40]/15
                     "
                   />
                 </div>

                 {submissionState === "error" ? (
                   <p
                     role="alert"
                     className="
                       rounded-xl
                       bg-red-50
                       px-4 py-3
                       text-[13px]
                       text-red-700
                     ">

                     {errorMessage}
                   </p>
                 ) : null}

                 <button
                   type="submit"
                   disabled={
                     submissionState ===
                     "submitting"
                   }
                   className="
                     mt-1
                     rounded-full
                     bg-[#8C1D40]
                     px-8 py-4
                     text-[13px]
                     font-medium
                     tracking-[0.08em]
                     text-white
                     transition
                     hover:bg-[#721632]
                     disabled:cursor-not-allowed
                     disabled:opacity-60
                   ">

                   {submissionState ===
                   "submitting"
                     ? "JOINING..."
                     : "GET MY FIRST MONTH FREE"}
                 </button>

                 <p
                   className="
                     text-center
                     text-[11px]
                     leading-5
                     text-[#7B8488]
                   ">

                   No charge today. Submitting this
                   form does not enroll you in a paid
                   plan.
                 </p>
               </form>

               {/* SECONDARY CONCIERGE CTA */}
               <div
                 className="
                   mt-8
                   border-t
                   border-[#D8CCBE]
                   pt-6
                   text-center
                 ">

                 <p
                   className="
                     text-[13px]
                     font-medium
                     text-[#28363C]
                   ">

                   Have a question first?
                 </p>

                 <p
                   className="
                     mt-1
                     text-[13px]
                     leading-5
                     text-[#6B7477]
                   ">

                   The VidaPouch Supplement Concierge
                   is here to help.
                 </p>

                 <div
                   className="
                     mt-4
                     flex
                     flex-wrap
                     justify-center
                     gap-3
                   ">

                   <a
                     href="sms:5082438404"
                     className="
                       rounded-full
                       border
                       border-[#183126]/25
                       px-5 py-2.5
                       text-[11px]
                       font-medium
                       tracking-[0.08em]
                       text-[#183126]
                       transition
                       hover:bg-[#F8F2EA]
                     ">

                     TEXT THE CONCIERGE
                   </a>

                   <a
                     href="tel:5082438404"
                     className="
                       rounded-full
                       border
                       border-[#183126]/25
                       px-5 py-2.5
                       text-[11px]
                       font-medium
                       tracking-[0.08em]
                       text-[#183126]
                       transition
                       hover:bg-[#F8F2EA]
                     ">

                     CALL
                   </a>
                 </div>
               </div>
             </>
           )}
         </div>
       </div>
     </div>


     {showPricing && (
 <div
   className="
     fixed inset-0 z-50
     flex items-center justify-center
     bg-black/40
     px-5
   "
   onClick={() => setShowPricing(false)}>

   <div
     className="
       relative
       w-full max-w-[620px]
       rounded-[28px]
       bg-white
       px-7 py-8
       shadow-2xl
       sm:px-10 sm:py-10
     "
     onClick={(event) => event.stopPropagation()}>

     <button
       type="button"
       onClick={() => setShowPricing(false)}
       className="
         absolute right-5 top-5
         flex h-9 w-9
         items-center justify-center
         rounded-full
         border border-[#D8CCBE]
         text-[20px]
         text-[#183126]
         transition
         hover:bg-[#F8F2EA]
       "
       aria-label="Close pricing">

       ×
     </button>

     <p
       className="
         text-[11px]
         font-medium
         uppercase
         tracking-[0.18em]
         text-[#8C1D40]
       ">

       VIDAPOUCH PLANS
     </p>

     <h3
       className="
         mt-3
         text-[32px]
         text-[#081620]
       "
       style={{
         fontFamily:
           'Georgia, "Times New Roman", serif',
       }}>

       Simple plans for your routine.
     </h3>

     <div className="mt-7 divide-y divide-[#D8CCBE]">
       <div className="flex justify-between py-4">
         <div>
           <p className="font-semibold text-[#183126]">
             Essential
           </p>
           <p className="mt-1 text-[12px] text-[#6B7477]">
             Up to 3 supplements
           </p>
         </div>
         <p className="font-semibold text-[#081620]">
           $59.99/mo
         </p>
       </div>

       <div className="flex justify-between py-4">
         <div>
           <p className="font-semibold text-[#183126]">
             Standard
           </p>
           <p className="mt-1 text-[12px] text-[#6B7477]">
             Up to 5 supplements
           </p>
         </div>
         <p className="font-semibold text-[#081620]">
           $79.99/mo
         </p>
       </div>

       <div className="flex justify-between py-4">
         <div>
           <p className="font-semibold text-[#183126]">
             Premier
           </p>
           <p className="mt-1 text-[12px] text-[#6B7477]">
             Up to 8 supplements
           </p>
         </div>
         <p className="font-semibold text-[#081620]">
           $99.99/mo
         </p>
       </div>

       <div className="flex justify-between py-4">
         <div>
           <p className="font-semibold text-[#183126]">
             Custom
           </p>
           <p className="mt-1 text-[12px] text-[#6B7477]">
             More than 8 or custom timing
           </p>
         </div>
         <p className="font-semibold text-[#081620]">
           From $139.99/mo
         </p>
       </div>
     </div>

     <div
       className="
         mt-6 rounded-2xl
         bg-[#F8F2EA]
         px-5 py-4
         text-center
       ">

       <p className="font-semibold text-[#8C1D40]">
         Your first month is on us.
       </p>
       <p className="mt-1 text-[12px] text-[#6B7477]">
         Joining the waitlist does not charge or enroll you.
       </p>
     </div>

     <button
       type="button"
       onClick={() => setShowPricing(false)}
       className="
         mt-6 w-full
         rounded-full
         bg-[#8C1D40]
         px-6 py-3.5
         text-[12px]
         font-medium
         tracking-[0.08em]
         text-white
         transition
         hover:bg-[#721632]
       ">

       GOT IT
     </button>
   </div>
 </div>
)}




   </section>
 );
}
