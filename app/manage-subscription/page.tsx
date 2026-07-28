"use client";

import {
 FormEvent,
 useState,
} from "react";

export default function ManageSubscriptionPage() {
 const [
   email,
   setEmail,
 ] = useState("");

 const [
   error,
   setError,
 ] = useState<
   string |
   null
>(null);

 const [
   isLoading,
   setIsLoading,
 ] = useState(
   false
 );

 async function handleSubmit(
   event:
     FormEvent<HTMLFormElement>
 ) {
   event.preventDefault();

   setError(
     null
   );

   setIsLoading(
     true
   );

   try {
     const response =
       await fetch(
         "/api/stripe/customer-portal",
         {
           method:
             "POST",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               email,
             }),
         }
       );

     const data =
       await response.json() as {
         url?:
           string;

         error?:
           string;
       };

     if (
       !response.ok ||
       !data.url
     ) {
       throw new Error(
         data.error ??
         "Unable to open subscription management."
       );
     }

     window.location.href =
       data.url;
   } catch (
     error
   ) {
     setError(
       error instanceof Error
         ? error.message
         : "Unable to open subscription management."
     );
   } finally {
     setIsLoading(
       false
     );
   }
 }

 return (
   <main className="min-h-screen bg-[#F7F3EE] px-5 py-16">
     <div className="mx-auto max-w-xl rounded-3xl border border-[#DED4C9] bg-white p-8 shadow-sm sm:p-10">
       <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
         VidaPouch
       </p>

       <h1 className="mt-3 text-3xl font-semibold text-[#26211D]">
         Manage your subscription
       </h1>

       <p className="mt-4 leading-7 text-[#665C54]">
         Enter the email address used for your
         VidaPouch subscription. You will be taken
         to Stripe’s secure portal to update your
         payment method, view invoices, or cancel
         future renewals.
       </p>

       <form
         className="mt-8"
         onSubmit={
           handleSubmit
         }>

         <label
           className="block text-sm font-medium text-[#302A25]"
           htmlFor="subscription-email">

           Subscription email
         </label>

         <input
           id="subscription-email"
           type="email"
           autoComplete="email"
           required
           value={
             email
           }
           onChange={(
             event
           ) => {
             setEmail(
               event.target.value
             );
           }}
           className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-4 py-3 text-[#26211D] outline-none transition focus:border-[#8B6F58] focus:ring-2 focus:ring-[#8B6F58]/20"
           placeholder="you@example.com"
         />

         {error ? (
           <p className="mt-4 text-sm text-red-700">
             {error}
           </p>
         ) : null}

         <button
           type="submit"
           disabled={
             isLoading
           }
           className="mt-6 w-full rounded-full bg-[#26211D] px-5 py-3 font-semibold text-white transition hover:bg-[#40372F] disabled:cursor-not-allowed disabled:opacity-60">

           {isLoading
             ? "Opening secure portal..."
             : "Manage subscription"}
         </button>
       </form>
     </div>
   </main>
 );
}