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
         lg:grid-cols-[0.92fr_1.08fr]
       ">

       <div
         className="
           bg-[#081620]
           px-7 py-10
           text-white
           sm:px-10 sm:py-12
           lg:px-12 lg:py-16
         ">

         <p
           className="
             text-[11px]
             uppercase
             tracking-[0.22em]
             text-[#E3C6CF]
             sm:text-[12px]
           ">

           FOUNDING MEMBER ACCESS
         </p>

         <h2
           className="
             mt-5
             text-[38px]
             leading-[1.04]
             tracking-[-0.035em]
             sm:text-[48px]
           "
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>

           Be among the first
           to experience VidaPouch.
         </h2>

         <p
           className="
             mt-6 max-w-[480px]
             text-[16px]
             leading-7
             text-[#D6DDE0]
           ">

           Become a Founding Member
           and get your first month
           on us. Tell us how to
           reach you, and the
           VidaPouch team will be
           in touch with your next
           steps.
         </p>

         <div
           className="
             mt-9 border-t
             border-white/15 pt-7
           ">

           
           
           
<div className="flex items-center gap-4">
 <img
   src="/images/home-v2/julie-concierge.png"
   alt="Julie, founder of VidaPouch"
   className="h-16 w-16 shrink-0 rounded-full border-2 border-white/25 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
 />

 <div>
   <p className="text-[13px] uppercase tracking-[0.12em] text-[#AAB7BC]">
     Prefer personal help?
   </p>

   <p className="mt-1 text-[14px] leading-5 text-[#D6DDE0]">
     Text or call Julie, founder of VidaPouch.
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
                 bg-white px-6 py-3
                 text-[12px]
                 font-medium
                 tracking-[0.08em]
                 text-[#081620]
                 transition
                 hover:bg-[#F3E9DD]
               ">

               TEXT THE CONCIERGE
             </a>

             <a
               href="tel:5082438404"
               className="
                 rounded-full
                 border
                 border-white/40
                 px-6 py-3
                 text-[12px]
                 font-medium
                 tracking-[0.08em]
                 text-white
                 transition
                 hover:bg-white/10
               ">

               CALL THE CONCIERGE
             </a>
           </div>

           <p
             className="
               mt-4 text-[15px]
               text-[#D6DDE0]
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

               YOU’RE REGISTERED
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

               Welcome to the
               Founding Member list.
             </h3>

             <p
               className="
                 mt-5 max-w-[470px]
                 text-[16px]
                 leading-7
                 text-[#5C666A]
               ">

               Thank you for your
               interest in VidaPouch.
               We’ll be in touch
               with your next steps.
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

               BECOME A FOUNDING MEMBER
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

               Complete the short
               form below. No payment
               is required today.
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
                   : "BECOME A FOUNDING MEMBER"}
               </button>
             </form>
           </>
         )}
       </div>
     </div>
   </section>
 );
}