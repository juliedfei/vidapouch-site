"use client";

import {
 useState,
} from "react";

import {
 useRouter,
} from "next/navigation";

type BottleStatus =
 | "QUARANTINED"
 | "AVAILABLE"
 | "LOW_STOCK"
 | "DEPLETED"
 | "EXPIRED"
 | "RECALLED"
 | "DISCARDED";

type InventoryBottleStatusControlProps = {
 bottleId:
   string;

 currentStatus:
   BottleStatus;
};

const STATUS_OPTIONS: {
 value:
   BottleStatus;

 label:
   string;
}[] = [
 {
   value:
     "QUARANTINED",

   label:
     "Quarantined",
 },
 {
   value:
     "AVAILABLE",

   label:
     "Available",
 },
 {
   value:
     "LOW_STOCK",

   label:
     "Low stock",
 },
 {
   value:
     "DEPLETED",

   label:
     "Depleted",
 },
 {
   value:
     "EXPIRED",

   label:
     "Expired",
 },
 {
   value:
     "RECALLED",

   label:
     "Recalled",
 },
 {
   value:
     "DISCARDED",

   label:
     "Discarded",
 },
];

export default function InventoryBottleStatusControl({
 bottleId,
 currentStatus,
}: InventoryBottleStatusControlProps) {
 const router =
   useRouter();

 const [
   selectedStatus,
   setSelectedStatus,
 ] =
   useState<BottleStatus>(
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
         "/api/admin/inventory/bottle-status",
         {
           method:
             "PATCH",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               bottleId,

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
         "Unable to update bottle status."
       );
     }

     router.refresh();
   } catch (
     error
   ) {
     setError(
       error instanceof Error
         ? error.message
         : "Unable to update bottle status."
     );
   } finally {
     setSaving(
       false
     );
   }
 }

 return (
   <div className="min-w-[220px]">
     <div className="flex items-center gap-2">
       <select
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
             event.target.value as BottleStatus
           );

           setError(
             null
           );
         }}
         className="min-h-10 flex-1 rounded-lg border border-[#CEC2B7] bg-white px-2.5 text-xs text-[#26211D] outline-none focus:border-[#7D0E1C] disabled:cursor-not-allowed disabled:opacity-60">

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
         className="min-h-10 rounded-lg bg-[#7D0E1C] px-3 text-xs font-semibold text-white transition hover:bg-[#65101A] disabled:cursor-not-allowed disabled:bg-[#B7AAA6]">

         {saving
           ? "Saving…"
           : "Save"}
       </button>
     </div>

     {error ? (
       <p
         role="alert"
         className="mt-2 text-xs leading-5 text-red-700">

         {error}
       </p>
     ) : null}
   </div>
 );
}
