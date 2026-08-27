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
 ] = useState<SubmissionState>(
   "idle"
 );

 const [
   errorMessage,
   setErrorMessage,
 ] = useState("");

 async function handleSubmit(
   event: FormEvent<HTMLFormElement>
 ) {
   event.preventDefault();

   setSubmissionState(
     "submitting"
   );

   setErrorMessage("");

   const form =
     event.currentTarget;

   const formData =
     new FormData(form);

   try {
     const response =
       await fetch(
         "/api/founding-member",
         {
           method: "POST",

           headers: {
             "Content-Type":
               "application/json",
           },

           body: JSON.stringify({
             customerName:
               formData.get(
                 "customerName"
               ),

             customerEmail:
               formData.get(
                 "customerEmail"
               ),

             customerPhone:
               formData.get(
                 "customerPhone"
               ),
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

     setSubmissionState(
       "success"
     );
   } catch (error) {
     setErrorMessage(
       error instanceof Error
         ? error.message
         : "Unable to register right now."
     );

     setSubmissionState(
       "error"
     );
   }
 }

 return (
   <section
     id="founding-member"
     className="
       scroll-mt-24
       bg-[#F8F2EA]
       px-5 py-20
       sm:px-8
       lg:px-10 lg:py-24
     ">

     <div
       className="
         mx-auto grid
         max-w-[1180px]
         overflow-hidden
         rounded-[32px]
         border border-[#D8CCBE]
         bg-white
         shadow-[0_24px_70px_rgba(31,26,22,0.10)]
         lg:grid-cols-[1.08fr_0.92fr]
       ">

       
       
       
       
<div
 className="
   bg-[#C8D8C2]
   px-7 py-10
   text-[#183126]
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
   mt-5 grid
   grid-cols-[80px_1fr]
   items-center gap-5
   sm:grid-cols-[96px_1fr]
   sm:gap-6
 ">

 <img
   src="/images/home-v2/julie-concierge.png"
   alt="Julie, founder of VidaPouch"
   className="
     h-20 w-20
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
       text-[32px]
       leading-[1.08]
       tracking-[-0.035em]
       sm:text-[42px]
     "
     style={{
       fontFamily:
         'Georgia, "Times New Roman", serif',
     }}>

     “VidaPouch makes taking your supplements simple.”
   </h2>

   <p
     className="
       mt-3 text-[13px]
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
   mt-7 max-w-[560px]
   text-[16px]
   leading-7
   text-[#30332F]
 ">

 I created VidaPouch because managing multiple supplement bottles
 shouldn’t add more work to your day. Your supplements are organized
 into convenient daily pouches, making your routine simpler at home
 or on the go.
</p>

<p
 className="
   mt-5 max-w-[560px]
   text-[16px]
   leading-7
   text-[#30332F]
 ">

 I’m excited for you to experience this simpler way of taking
 your supplements.
</p>

<p
 className="
   mt-1
   text-[18px]
   font-semibold
   leading-7
   text-[#8C1D40]
 ">

 That’s why your first month is on us!
</p>




 <div
   className="
     mt-9 border-t
     border-[#171A17]/20 pt-7
   ">

   <div className="flex items-center gap-4">
   <div
 className="
   flex h-12 w-12 shrink-0
   items-center justify-center
   rounded-full
   bg-[#183126]
   text-white
 "
 aria-hidden="true">

 <svg
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="1.8"
   className="h-6 w-6">

   <path
     strokeLinecap="round"
     strokeLinejoin="round"
     d="M4 18v-6a8 8 0 0 1 16 0v6"
   />

   <path
     strokeLinecap="round"
     strokeLinejoin="round"
     d="M4 18a3 3 0 0 0 3 3h1v-6H7a3 3 0 0 0-3 3Z"
   />

   <path
     strokeLinecap="round"
     strokeLinejoin="round"
     d="M20 18a3 3 0 0 1-3 3h-1v-6h1a3 3 0 0 1 3 3Z"
   />
 </svg>
</div>

     <div>
       <p
         className="
           text-[13px]
           uppercase
           tracking-[0.12em]
           text-[#30332F]
         ">

         PREFER TO CHAT?
       </p>

       <p
         className="
           mt-1 text-[14px]
           leading-5
           text-[#30332F]
         ">

         Our Supplement Concierge is here to help.
       </p>
     </div>
   </div>

   <div
     className="
       mt-4 flex
       flex-wrap gap-3
     ">

     <a
       href="sms:5082438404"
       className="
         rounded-full
         bg-[#183126]
         px-6 py-3
         text-[12px]
         font-medium
         tracking-[0.08em]
         text-white
         transition
         hover:bg-[#284A39]
       ">

       TEXT THE CONCIERGE
     </a>

     <a
       href="tel:5082438404"
       className="
         rounded-full
         border
         border-[#183126]/25
         bg-[#F8F2EA]
         px-6 py-3
         text-[12px]
         font-medium
         tracking-[0.08em]
         text-[#183126]
         transition
         hover:bg-white
       ">

       CALL THE CONCIERGE
     </a>
   </div>

   <p
     className="
       mt-4 text-[15px]
       text-[#30332F]
     ">

     (508) 243-8404
   </p>
 </div>
</div>










       <div
         className="
           px-7 py-10
           sm:px-10 sm:py-12
           lg:px-12 lg:py-16
         ">

         {submissionState ===
         "success" ? (
           <div
             role="status"
             className="
               flex min-h-[390px]
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
                 mt-4 text-[36px]
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
                 mt-5 max-w-[470px]
                 text-[16px]
                 leading-7
                 text-[#5C666A]
               ">

               Thank you for joining VidaPouch. We'll be in touch soon 
               to help you get started.
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

               JOIN VIDAPOUCH
             </p>

             <h3
               className="
                 mt-4 text-[34px]
                 leading-tight
                 text-[#081620]
                 sm:text-[40px]
               "
               style={{
                 fontFamily:
                   'Georgia, "Times New Roman", serif',
               }}>

               Get your first
               month on us.
             </h3>

             <p
               className="
                 mt-4 text-[15px]
                 leading-7
                 text-[#5C666A]
               ">

               Complete the short form below, and we'll be in touch
               to help you get started.
             </p>

             <form
               onSubmit={
                 handleSubmit
               }
               className="mt-8 grid gap-5">

               <div>
                 <label
                   htmlFor="customerName"
                   className="
                     block text-[13px]
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
                     block text-[13px]
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
                     block text-[13px]
                     font-medium
                     text-[#28363C]
                   ">

                   Phone number
                   <span
                     className="
                       ml-1 font-normal
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

                 <p
                   className="
                     mt-2 text-[12px]
                     leading-5
                     text-[#7B8488]
                   ">

                   If provided, we’ll
                   use this number only
                   to follow up about
                   your VidaPouch request.
                 </p>
               </div>

               {submissionState ===
               "error" ? (
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
                   mt-1 rounded-full
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
                   ? "REGISTERING..."
                   : "JOIN VIDAPOUCH"}
               </button>
             </form>
           </>
         )}
       </div>
     </div>
   </section>
 );
}