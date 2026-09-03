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
           "Content-Type": "application/json",
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
       flex
       min-h-[calc(100vh-80px)]
       items-center
       bg-[#F8F2EA]
       px-5
       py-10
       sm:px-8
       sm:py-14
     ">

     <div
       className="
         mx-auto
         w-full
         max-w-[760px]
         rounded-[32px]
         border
         border-[#D8CCBE]
         bg-white
         px-7
         py-10
         text-center
         shadow-[0_24px_70px_rgba(31,26,22,0.10)]
         sm:px-12
         sm:py-14
         lg:px-16
         lg:py-16
       ">

       {submissionState === "success" ? (
         <div
           role="status"
           className="
             mx-auto
             max-w-[520px]
             py-8
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

           <h2
             className="
               mt-4
               text-[38px]
               leading-[1.08]
               tracking-[-0.03em]
               text-[#183126]
               sm:text-[48px]
             "
             style={{
               fontFamily:
                 'Georgia, "Times New Roman", serif',
             }}>

             You're on the list!
           </h2>

           <p
             className="
               mt-5
               text-[16px]
               leading-7
               text-[#5C666A]
             ">

             Thank you for joining VidaPouch.
             We'll be in touch soon to help you
             get started.
           </p>
         </div>
       ) : (
         <>
           <p
             className="
               text-[12px]
               font-semibold
               uppercase
               tracking-[0.18em]
               text-[#8C1D40]
             ">

             VIDAPOUCH
           </p>

           <h1
             className="
               mx-auto
               mt-4
               max-w-[650px]
               text-[40px]
               leading-[1.04]
               tracking-[-0.04em]
               text-[#183126]
               sm:text-[54px]
               lg:text-[60px]
             "
             style={{
               fontFamily:
                 'Georgia, "Times New Roman", serif',
             }}>

             Get all your supplements starting at
             $59.99/month.*
           </h1>

           <p
             className="
               mt-5
               text-[22px]
               font-semibold
               leading-7
               text-[#8C1D40]
               sm:text-[24px]
             ">

             Get your first month on us.
           </p>

           <p
             className="
               mx-auto
               mt-4
               max-w-[550px]
               text-[15px]
               leading-6
               text-[#5C666A]
               sm:text-[16px]
             ">

             We source the supplements you take
             and organize them into convenient
             daily pouches.
           </p>

           <p
             className="
               mx-auto
               mt-3
               text-[12px]
               leading-5
               text-[#7B8488]
             ">

             *Plans vary based on the number of
             supplements.{" "}
             <button
               type="button"
               onClick={() => setShowPricing(true)}
               className="
                 font-medium
                 text-[#183126]
                 underline
                 underline-offset-4
                 transition
                 hover:text-[#8C1D40]
               ">

               View full pricing
             </button>
           </p>

           <form
             onSubmit={handleSubmit}
             className="
               mx-auto
               mt-8
               grid
               max-w-[500px]
               gap-4
               text-left
             ">

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
                   mt-2
                   w-full
                   rounded-2xl
                   border
                   border-[#CFC4B7]
                   bg-[#FCFAF7]
                   px-4
                   py-3.5
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
                   mt-2
                   w-full
                   rounded-2xl
                   border
                   border-[#CFC4B7]
                   bg-[#FCFAF7]
                   px-4
                   py-3.5
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
                   mt-2
                   w-full
                   rounded-2xl
                   border
                   border-[#CFC4B7]
                   bg-[#FCFAF7]
                   px-4
                   py-3.5
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
                   px-4
                   py-3
                   text-center
                   text-[13px]
                   text-red-700
                 ">

                 {errorMessage}
               </p>
             ) : null}

             <button
               type="submit"
               disabled={
                 submissionState === "submitting"
               }
               className="
                 mt-2
                 w-full
                 rounded-full
                 bg-[#8C1D40]
                 px-8
                 py-4
                 text-[13px]
                 font-semibold
                 tracking-[0.08em]
                 text-white
                 transition
                 hover:bg-[#721632]
                 disabled:cursor-not-allowed
                 disabled:opacity-60
               ">

               {submissionState === "submitting"
                 ? "JOINING..."
                 : "GET MY FREE MONTH"}
             </button>

             <p
               className="
                 text-center
                 text-[11px]
                 leading-5
                 text-[#7B8488]
               ">

               No charge today. No commitment.
               Free first month applies to any
               VidaPouch tier.
             </p>
           </form>
         </>
       )}
     </div>

     {showPricing && (
       <div
         className="
           fixed
           inset-0
           z-50
           flex
           items-center
           justify-center
           bg-black/40
           px-5
         "
         onClick={() => setShowPricing(false)}>

         <div
           className="
             relative
             w-full
             max-w-[620px]
             rounded-[28px]
             bg-white
             px-7
             py-8
             text-left
             shadow-2xl
             sm:px-10
             sm:py-10
           "
           onClick={(event) =>
             event.stopPropagation()
           }>

           <button
             type="button"
             onClick={() => setShowPricing(false)}
             className="
               absolute
               right-5
               top-5
               flex
               h-9
               w-9
               items-center
               justify-center
               rounded-full
               border
               border-[#D8CCBE]
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
               pr-10
               text-[32px]
               leading-tight
               text-[#081620]
             "
             style={{
               fontFamily:
                 'Georgia, "Times New Roman", serif',
             }}>

             Choose the plan that fits your routine.
           </h3>

           <div
             className="
               mt-7
               divide-y
               divide-[#D8CCBE]
             ">

             <div
               className="
                 flex
                 items-start
                 justify-between
                 gap-4
                 py-4
               ">

               <div>
                 <p
                   className="
                     font-semibold
                     text-[#183126]
                   ">

                   Essential
                 </p>

                 <p
                   className="
                     mt-1
                     text-[12px]
                     text-[#6B7477]
                   ">

                   Up to 3 supplements
                 </p>
               </div>

               <p
                 className="
                   shrink-0
                   font-semibold
                   text-[#081620]
                 ">

                 $59.99/mo
               </p>
             </div>

             <div
               className="
                 flex
                 items-start
                 justify-between
                 gap-4
                 py-4
               ">

               <div>
                 <p
                   className="
                     font-semibold
                     text-[#183126]
                   ">

                   Standard
                 </p>

                 <p
                   className="
                     mt-1
                     text-[12px]
                     text-[#6B7477]
                   ">

                   Up to 5 supplements
                 </p>
               </div>

               <p
                 className="
                   shrink-0
                   font-semibold
                   text-[#081620]
                 ">

                 $79.99/mo
               </p>
             </div>

             <div
               className="
                 flex
                 items-start
                 justify-between
                 gap-4
                 py-4
               ">

               <div>
                 <p
                   className="
                     font-semibold
                     text-[#183126]
                   ">

                   Premier
                 </p>

                 <p
                   className="
                     mt-1
                     text-[12px]
                     text-[#6B7477]
                   ">

                   Up to 8 supplements
                 </p>
               </div>

               <p
                 className="
                   shrink-0
                   font-semibold
                   text-[#081620]
                 ">

                 $99.99/mo
               </p>
             </div>

             <div
               className="
                 flex
                 items-start
                 justify-between
                 gap-4
                 py-4
               ">

               <div>
                 <p
                   className="
                     font-semibold
                     text-[#183126]
                   ">

                   Custom
                 </p>

                 <p
                   className="
                     mt-1
                     text-[12px]
                     text-[#6B7477]
                   ">

                   More than 8 supplements or
                   custom timing
                 </p>
               </div>

               <p
                 className="
                   shrink-0
                   font-semibold
                   text-[#081620]
                 ">

                 From $139.99/mo
               </p>
             </div>
           </div>

           <div
             className="
               mt-6
               rounded-2xl
               bg-[#F8F2EA]
               px-5
               py-4
               text-center
             ">

             <p
               className="
                 font-semibold
                 text-[#8C1D40]
               ">

               Your first month is free on any tier.
             </p>

             <p
               className="
                 mt-1
                 text-[12px]
                 leading-5
                 text-[#6B7477]
               ">

               Joining the waitlist does not charge
               you or enroll you in a paid plan.
             </p>
           </div>

           <button
             type="button"
             onClick={() => setShowPricing(false)}
             className="
               mt-6
               w-full
               rounded-full
               bg-[#8C1D40]
               px-6
               py-3.5
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
