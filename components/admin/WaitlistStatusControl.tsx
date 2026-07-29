"use client";

import {
 useState,
} from "react";

import {
 useRouter,
} from "next/navigation";

type WaitlistStatus =
 | "NEW"
 | "CONTACTED"
 | "READY_TO_ORDER"
 | "CONVERTED"
 | "DECLINED";

type WaitlistStatusControlProps = {
 entryId:
   string;

 currentStatus:
   WaitlistStatus;
};

const STATUS_OPTIONS: {
 value:
   WaitlistStatus;

 label:
   string;
}[] = [
 {
   value:
     "NEW",

   label:
     "New",
 },
 {
   value:
     "CONTACTED",

   label:
     "Contacted",
 },
 {
   value:
     "READY_TO_ORDER",

   label:
     "Ready to order",
 },
 {
   value:
     "CONVERTED",

   label:
     "Converted",
 },
 {
   value:
     "DECLINED",

   label:
     "Declined",
 },
];

export default function WaitlistStatusControl({
 entryId,
 currentStatus,
}: WaitlistStatusControlProps) {
 const router =
   useRouter();

 const [
   selectedStatus,
   setSelectedStatus,
 ] =
   useState<WaitlistStatus>(
     currentStatus
   );

 const [
   saving,
   setSaving,
 ] =
   useState(
     false
   );

 const [
   error,
   setError,
 ] =
   useState<string | null>(
     null
   );

 const hasChanges =
   selectedStatus !==
   currentStatus;

 async function saveStatus() {
   if (
     !hasChanges ||
     saving
   ) {
     return;
   }

   setSaving(
     true
   );

   setError(
     null
   );

   try {



    const response =
    await fetch(
      "/api/admin/waitlist-status",
      {
        method:
          "PATCH",
   
        headers: {
          "Content-Type":
            "application/json",
        },
   
        body:
          JSON.stringify({
            entryId,
   
            status:
              selectedStatus,
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
         "Unable to update the waitlist status."
       );
     }

     router.refresh();
   } catch (
     error
   ) {
     setError(
       error instanceof Error
         ? error.message
         : "Unable to update the waitlist status."
     );
   } finally {
     setSaving(
       false
     );
   }
 }

 return (
   <div className="mt-6 rounded-2xl border border-[#E6DED5] bg-[#FCFAF7] p-4">
     <label
       htmlFor={`waitlist-status-${entryId}`}
       className="block text-sm font-semibold text-[#26211D]">

       Customer status
     </label>

     <div className="mt-3 flex flex-col gap-3 sm:flex-row">
       <select
         id={`waitlist-status-${entryId}`}
         value={
           selectedStatus
         }
         disabled={
           saving
         }
         onChange={(
           event
         ) => {
           setSelectedStatus(
             event.target.value as WaitlistStatus
           );

           setError(
             null
           );
         }}
         className="min-h-11 flex-1 rounded-xl border border-[#CEC2B7] bg-white px-3 text-sm text-[#26211D] outline-none focus:border-[#7D0E1C] focus:ring-2 focus:ring-[#7D0E1C]/15 disabled:cursor-not-allowed disabled:opacity-60">

         {STATUS_OPTIONS.map(
           (
             option
           ) => (
             <option
               key={
                 option.value
               }
               value={
                 option.value
               }>

               {option.label}
             </option>
           )
         )}
       </select>

       <button
         type="button"
         disabled={
           !hasChanges ||
           saving
         }
         onClick={() => {
           void saveStatus();
         }}
         className="min-h-11 rounded-xl bg-[#7D0E1C] px-5 text-sm font-semibold text-white transition hover:bg-[#65101A] disabled:cursor-not-allowed disabled:bg-[#B7AAA6]">

         {saving
           ? "Saving…"
           : "Save status"}
       </button>
     </div>

     {error ? (
       <p
         role="alert"
         className="mt-3 text-sm text-red-700">

         {error}
       </p>
     ) : null}
   </div>
 );
}