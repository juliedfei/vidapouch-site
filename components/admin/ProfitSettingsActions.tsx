"use client";

import {
 useState,
} from "react";

import {
 useRouter,
} from "next/navigation";

type ProfitSettings = {
 pouchCost:
   number;

 singleBoxCost:
   number;

 dualBoxCost:
   number;

 insertCost:
   number;

 labelCost:
   number;

 laborHourlyRate:
   number;

 laborMinutesPerOrder:
   number;

 otherPackagingCost:
   number;
};

type Props = {
 settings:
   ProfitSettings;
};

export default function ProfitSettingsActions({
 settings,
}: Props) {
 const router =
   useRouter();

 const [
   menuOpen,
   setMenuOpen,
 ] =
   useState(
     false
   );

 const [
   modalOpen,
   setModalOpen,
 ] =
   useState(
     false
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
   useState<
     string | null
>(
     null
   );

 const [
   pouchCost,
   setPouchCost,
 ] =
   useState(
     settings.pouchCost.toString()
   );

 const [
   singleBoxCost,
   setSingleBoxCost,
 ] =
   useState(
     settings.singleBoxCost.toString()
   );

 const [
   dualBoxCost,
   setDualBoxCost,
 ] =
   useState(
     settings.dualBoxCost.toString()
   );

 const [
   insertCost,
   setInsertCost,
 ] =
   useState(
     settings.insertCost.toString()
   );

 const [
   labelCost,
   setLabelCost,
 ] =
   useState(
     settings.labelCost.toString()
   );

 const [
   laborHourlyRate,
   setLaborHourlyRate,
 ] =
   useState(
     settings.laborHourlyRate.toString()
   );

 const [
   laborMinutesPerOrder,
   setLaborMinutesPerOrder,
 ] =
   useState(
     settings.laborMinutesPerOrder.toString()
   );

 const [
   otherPackagingCost,
   setOtherPackagingCost,
 ] =
   useState(
     settings.otherPackagingCost.toString()
   );

 function openModal() {
   setError(
     null
   );

   setMenuOpen(
     false
   );

   setModalOpen(
     true
   );
 }

 async function saveSettings() {
   setError(
     null
   );

   setSaving(
     true
   );

   try {
     const response =
       await fetch(
         "/api/admin/profit-settings",
         {
           method:
             "PATCH",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               pouchCost,

               singleBoxCost,

               dualBoxCost,

               insertCost,

               labelCost,

               laborHourlyRate,

               laborMinutesPerOrder,

               otherPackagingCost,
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
         "Unable to save profit settings."
       );
     }

     setModalOpen(
       false
     );

     router.refresh();
   } catch (
     caughtError
   ) {
     setError(
       caughtError instanceof
         Error
         ? caughtError.message
         : "Unable to save profit settings."
     );
   } finally {
     setSaving(
       false
     );
   }
 }

 return (
   <>
     <div className="relative">
       <button
         type="button"
         aria-label="Profit settings"
         aria-expanded={
           menuOpen
         }
         onClick={() => {
           setMenuOpen(
             (
               current
             ) =>
               !current
           );
         }}
         className="flex h-10 w-10 items-center justify-center rounded-full border border-[#CFC3B7] bg-white text-xl font-semibold text-[#665C54] transition hover:bg-[#F2ECE6]">

         ⋯
       </button>

       {menuOpen ? (
         <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-xl border border-[#DED4C9] bg-white py-1 shadow-lg">
           <button
             type="button"
             onClick={
               openModal
             }
             className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[#302A25] transition hover:bg-[#F7F3EE]">

             Edit cost assumptions
           </button>
         </div>
       ) : null}
     </div>

     {modalOpen ? (
       <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8">
         <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
           <div className="flex items-start justify-between border-b border-[#E9E1D8] px-6 py-5">
             <div>
               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B6F58]">
                 Profit settings
               </p>

               <h2 className="mt-1 text-xl font-semibold text-[#26211D]">
                 Edit cost assumptions
               </h2>
             </div>

             <button
               type="button"
               aria-label="Close profit settings"
               onClick={() => {
                 setModalOpen(
                   false
                 );

                 setError(
                   null
                 );
               }}
               className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#665C54] transition hover:bg-[#F3EDE7]">

               ×
             </button>
           </div>

           <div className="p-6">
             {error ? (
               <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                 {error}
               </div>
             ) : null}

             <div className="grid gap-5 sm:grid-cols-2">
               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Pouch cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.0001"
                   value={
                     pouchCost
                   }
                   onChange={(
                     event
                   ) => {
                     setPouchCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Single box cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.0001"
                   value={
                     singleBoxCost
                   }
                   onChange={(
                     event
                   ) => {
                     setSingleBoxCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Dual box cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.0001"
                   value={
                     dualBoxCost
                   }
                   onChange={(
                     event
                   ) => {
                     setDualBoxCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Insert cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.0001"
                   value={
                     insertCost
                   }
                   onChange={(
                     event
                   ) => {
                     setInsertCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Label cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.0001"
                   value={
                     labelCost
                   }
                   onChange={(
                     event
                   ) => {
                     setLabelCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Other packaging cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.0001"
                   value={
                     otherPackagingCost
                   }
                   onChange={(
                     event
                   ) => {
                     setOtherPackagingCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Labor hourly rate
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.01"
                   value={
                     laborHourlyRate
                   }
                   onChange={(
                     event
                   ) => {
                     setLaborHourlyRate(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Labor minutes per order
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.01"
                   value={
                     laborMinutesPerOrder
                   }
                   onChange={(
                     event
                   ) => {
                     setLaborMinutesPerOrder(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>
             </div>

             <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
               <button
                 type="button"
                 disabled={
                   saving
                 }
                 onClick={() => {
                   setModalOpen(
                     false
                   );

                   setError(
                     null
                   );
                 }}
                 className="rounded-full border border-[#CFC3B7] bg-white px-5 py-2.5 text-sm font-semibold text-[#302A25] transition hover:bg-[#F7F3EE] disabled:opacity-50">

                 Cancel
               </button>

               <button
                 type="button"
                 disabled={
                   saving
                 }
                 onClick={() => {
                   void saveSettings();
                 }}
                 className="rounded-full bg-[#26211D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#40372F] disabled:cursor-not-allowed disabled:opacity-60">

                 {saving
                   ? "Saving..."
                   : "Save changes"}
               </button>
             </div>
           </div>
         </div>
       </div>
     ) : null}
   </>
 );
}