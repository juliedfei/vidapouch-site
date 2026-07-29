"use client";

import {
 useState,
} from "react";

type SalesMode =
 | "STRIPE"
 | "WAITLIST"
 | "PAUSED";

type Props = {
 initialSalesMode:
   SalesMode;

 initialNotes:
   string | null;
};

const SALES_MODE_OPTIONS: {
 value:
   SalesMode;

 title:
   string;

 description:
   string;
}[] = [
 {
   value:
     "STRIPE",

   title:
     "Stripe checkout",

   description:
     "Customers can complete checkout and pay through Stripe.",
 },
 {
   value:
     "WAITLIST",

   title:
     "Waitlist",

   description:
     "Customers submit their contact information and complete supplement routine without paying.",
 },
 {
   value:
     "PAUSED",

   title:
     "Paused",

   description:
     "New checkout and waitlist submissions are temporarily unavailable.",
 },
];

export default function CommerceSettingsPanel({
 initialSalesMode,
 initialNotes,
}: Props) {
 const [
   salesMode,
   setSalesMode,
 ] = useState<SalesMode>(
   initialSalesMode
 );

 const [
   notes,
   setNotes,
 ] = useState(
   initialNotes ??
     ""
 );

 const [
   isSaving,
   setIsSaving,
 ] = useState(
   false
 );

 const [
   message,
   setMessage,
 ] = useState<
   string |
   null
>(null);

 const [
   error,
   setError,
 ] = useState<
   string |
   null
>(null);

 async function saveSettings() {
   setMessage(
     null
   );

   setError(
     null
   );

   setIsSaving(
     true
   );

   try {
     const response =
       await fetch(
         "/api/admin/commerce-settings",
         {
           method:
             "PATCH",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               salesMode,
               notes,
             }),
         }
       );

     const data =
       await response.json() as {
         success?:
           boolean;

         error?:
           string;
       };

     if (
       !response.ok ||
       !data.success
     ) {
       throw new Error(
         data.error ??
         "Unable to save the sales mode."
       );
     }

     setMessage(
       "Sales mode saved."
     );
   } catch (
     caughtError
   ) {
     setError(
       caughtError instanceof Error
         ? caughtError.message
         : "Unable to save the sales mode."
     );
   } finally {
     setIsSaving(
       false
     );
   }
 }

 return (
   <section className="rounded-3xl border border-[#DED4C9] bg-white p-6 shadow-sm sm:p-8">
     <div>
       <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
         Customer purchasing
       </p>

       <h2 className="mt-2 text-2xl font-semibold text-[#26211D]">
         Sales mode
       </h2>

       <p className="mt-3 max-w-3xl leading-7 text-[#665C54]">
         Choose what customers see when they finish building their VidaPouch.
         Changing this setting does not remove Stripe or delete existing
         orders and waitlist requests.
       </p>
     </div>

     <div className="mt-6 grid gap-4 lg:grid-cols-3">
       {SALES_MODE_OPTIONS.map(
         (
           option
         ) => {
           const isSelected =
             salesMode ===
             option.value;

           return (
             <button
               key={
                 option.value
               }
               type="button"
               onClick={() => {
                 setSalesMode(
                   option.value
                 );

                 setMessage(
                   null
                 );
               }}
               className={`rounded-2xl border p-5 text-left transition ${
                 isSelected
                   ? "border-[#26211D] bg-[#F3EEE8] ring-2 ring-[#26211D]/10"
                   : "border-[#DED4C9] bg-white hover:bg-[#FAF7F3]"
               }`}>

               <div className="flex items-center gap-3">
                 <span
                   aria-hidden="true"
                   className={`h-4 w-4 rounded-full border ${
                     isSelected
                       ? "border-[#26211D] bg-[#26211D] ring-4 ring-[#26211D]/10"
                       : "border-[#A99B8E] bg-white"
                   }`}
                 />

                 <span className="font-semibold text-[#26211D]">
                   {option.title}
                 </span>
               </div>

               <p className="mt-3 text-sm leading-6 text-[#665C54]">
                 {option.description}
               </p>
             </button>
           );
         }
       )}
     </div>

     <label
       className="mt-6 block text-sm font-medium text-[#302A25]"
       htmlFor="commerce-notes">

       Internal notes
     </label>

     <textarea
       id="commerce-notes"
       value={
         notes
       }
       onChange={(
         event
       ) => {
         setNotes(
           event.target.value
         );
       }}
       className="mt-2 min-h-28 w-full rounded-xl border border-[#CFC3B7] px-4 py-3 text-[#26211D] outline-none transition focus:border-[#8B6F58] focus:ring-2 focus:ring-[#8B6F58]/20"
       placeholder="Optional note explaining why the current sales mode is active."
     />

     {message ? (
       <p className="mt-4 text-sm font-medium text-green-700">
         {message}
       </p>
     ) : null}

     {error ? (
       <p className="mt-4 text-sm font-medium text-red-700">
         {error}
       </p>
     ) : null}

     <button
       type="button"
       disabled={
         isSaving
       }
       onClick={() => {
         void saveSettings();
       }}
       className="mt-6 rounded-full bg-[#26211D] px-6 py-3 font-semibold text-white transition hover:bg-[#40372F] disabled:cursor-not-allowed disabled:opacity-60">

       {isSaving
         ? "Saving..."
         : "Save sales mode"}
     </button>
   </section>
 );
}
