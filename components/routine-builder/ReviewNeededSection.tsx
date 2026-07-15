"use client";

import { useState } from "react";

import BrandSelect, {
 OTHER_BRAND,
 VIDAPOUCH_CHOOSES_BRAND,
} from "./BrandSelect";

import type {
 UnrecognizedItem,
} from "./types";

type ReviewNeededSectionProps = {
 unrecognizedItems:
   UnrecognizedItem[];

 removeUnrecognizedItem: (
   indexToRemove: number
 ) => void;

 recheckReviewedItem: (
   indexToRecheck: number,
   updatedItem: UnrecognizedItem
 ) => void;
};

export default function ReviewNeededSection({
 unrecognizedItems,
 removeUnrecognizedItem,
 recheckReviewedItem,
}: ReviewNeededSectionProps) {
 const [
   editingIndex,
   setEditingIndex,
 ] = useState<number | null>(
   null
 );

 const [
   clinicianNotes,
   setClinicianNotes,
 ] = useState<
   Record<number, string>
>({});

 const [
   editedName,
   setEditedName,
 ] = useState("");

 const [
   editedBrandSelection,
   setEditedBrandSelection,
 ] = useState("");

 const [
   editedCustomBrand,
   setEditedCustomBrand,
 ] = useState("");

 const [
   editedDosage,
   setEditedDosage,
 ] = useState("");

 const [
   editedNote,
   setEditedNote,
 ] = useState("");

 function isClinicianReviewItem(
   item: UnrecognizedItem
 ) {
   return item.name
     .toLowerCase()
     .includes(
       "clinician review recommended"
     );
 }

 function getReviewTitle(
   item: UnrecognizedItem
 ) {
   if (
     isClinicianReviewItem(item)
   ) {
     return "Safety Review";
   }

   switch (item.reason) {
     case "unsupported_format":
       return "Unsupported Item";

     case "possible_misspelling":
       return "Possible Spelling Mistake";

     case "unrecognized":
       return "Supplement Not Recognized";

     case "needs_confirmation": {
       const note =
         item.note?.toLowerCase() ||
         "";

       if (
         note.includes(
           "does not appear to make"
         ) ||
         note.includes(
           "does not appear to offer"
         ) ||
         note.includes(
           "choose a different brand"
         )
       ) {
         return "Brand Not Found";
       }

       return "Needs Confirmation";
     }

     default:
       return "Needs Confirmation";
   }
 }

 function startEditing(
   item: UnrecognizedItem,
   index: number
 ) {
   setEditingIndex(index);

   if (
     isClinicianReviewItem(item)
   ) {
     setEditedNote(
       clinicianNotes[index] || ""
     );

     return;
   }

   setEditedName(
     item.suggestion ||
       item.name ||
       ""
   );

   setEditedDosage(
     item.dosage || ""
   );

   if (
     item.vidapouchChoosesBrand
   ) {
     setEditedBrandSelection(
       VIDAPOUCH_CHOOSES_BRAND
     );

     setEditedCustomBrand("");

     return;
   }

   if (item.customBrand?.trim()) {
     setEditedBrandSelection(
       OTHER_BRAND
     );

     setEditedCustomBrand(
       item.customBrand.trim()
     );

     return;
   }

   setEditedBrandSelection(
     item.brand || ""
   );

   setEditedCustomBrand("");
 }

 function cancelEditing() {
   setEditingIndex(null);
   setEditedName("");
   setEditedBrandSelection("");
   setEditedCustomBrand("");
   setEditedDosage("");
   setEditedNote("");
 }

 function saveClinicianNote(
   index: number
 ) {
   setClinicianNotes(
     (current) => ({
       ...current,
       [index]:
         editedNote.trim(),
     })
   );

   cancelEditing();
 }

 function saveAndRecheck(
   index: number,
   item: UnrecognizedItem
 ) {
   const vidapouchChoosesBrand =
     editedBrandSelection ===
     VIDAPOUCH_CHOOSES_BRAND;

   const usesCustomBrand =
     editedBrandSelection ===
     OTHER_BRAND;

   const resolvedBrand =
     usesCustomBrand
       ? editedCustomBrand.trim()
       : vidapouchChoosesBrand
         ? ""
         : editedBrandSelection.trim();

   if (
     !vidapouchChoosesBrand &&
     !resolvedBrand
   ) {
     return;
   }

   recheckReviewedItem(index, {
     ...item,

     name:
       editedName.trim(),

     dosage:
       editedDosage.trim() ||
       "1 capsule",

     brand:
       vidapouchChoosesBrand
         ? undefined
         : resolvedBrand,

     customBrand:
       usesCustomBrand
         ? resolvedBrand
         : undefined,

     vidapouchChoosesBrand,

     suggestion: undefined,

     reason:
       "needs_confirmation",

     note:
       "Edited by user. Rechecking before adding to a pouch.",
   });

   cancelEditing();
 }

 if (
   unrecognizedItems.length === 0
 ) {
   return null;
 }

 return (
   <div className="mt-7 rounded-[24px] border border-[#8C1D40]/30 bg-[#FFF7F5] p-5">
     <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C1D40]">
       Review needed
     </p>

     <h3
       className="mt-2 text-[24px] tracking-[-0.03em]"
       style={{
         fontFamily:
           'Georgia, "Times New Roman", serif',
       }}>

       These items need review.
     </h3>

     <p className="mt-2 max-w-[620px] text-[15px] leading-7 text-[#475357]">
       Some items may need
       clarification or clinician review
       before changing your routine.
     </p>

     <div className="mt-4 grid gap-3">
       {unrecognizedItems.map(
         (item, index) => {
           const isEditing =
             editingIndex === index;

           const isClinicianReview =
             isClinicianReviewItem(
               item
             );

           const customBrandRequired =
             editedBrandSelection ===
             OTHER_BRAND;

           const recheckDisabled =
             !isClinicianReview &&
             (
               !editedName.trim() ||
               !editedBrandSelection ||
               (
                 customBrandRequired &&
                 !editedCustomBrand.trim()
               )
             );

           return (
             <div
               key={`${item.name}-${index}`}
               className="rounded-2xl border border-[#8C1D40]/25 bg-[#F8F2EA] px-4 py-4">

               <div className="flex items-start justify-between gap-4">
                 <div>
                   <p className="text-[11px] uppercase tracking-[0.14em] text-[#8C1D40]">
                     {getReviewTitle(
                       item
                     )}
                   </p>

                   {!isEditing && (
                     <p className="mt-1 text-[18px] font-medium text-[#081620]">
                       {item.name}
                     </p>
                   )}
                 </div>

                 <span className="rounded-full border border-[#8C1D40]/30 bg-white/60 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#8C1D40]">
                   Review
                 </span>
               </div>

               {isEditing ? (
                 <div className="mt-4 grid gap-4">
                   {isClinicianReview ? (
                     <textarea
                       value={
                         editedNote
                       }
                       onChange={(
                         event
                       ) =>
                         setEditedNote(
                           event.target
                             .value
                         )
                       }
                       placeholder="Notes from clinician, e.g. reviewed with doctor and approved"
                       rows={4}
                       className="w-full rounded-2xl border border-[#D6CCBF] bg-white/70 px-4 py-3 outline-none"
                     />
                   ) : (
                     <>
                       <label className="block">
                         <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5D686C]">
                           Supplement
                         </span>

                         <input
                           value={
                             editedName
                           }
                           onChange={(
                             event
                           ) =>
                             setEditedName(
                               event.target
                                 .value
                             )
                           }
                           placeholder="Supplement, e.g. Magnesium"
                           className="h-12 w-full rounded-xl border border-[#D8CEC2] bg-white px-4 text-[15px] outline-none transition focus:border-[#8C1D40] focus:ring-4 focus:ring-[#8C1D40]/10"
                         />
                       </label>

                       <BrandSelect
                         value={
                           editedBrandSelection
                         }
                         onChange={(
                           value
                         ) => {
                           setEditedBrandSelection(
                             value
                           );

                           if (
                             value !==
                             OTHER_BRAND
                           ) {
                             setEditedCustomBrand(
                               ""
                             );
                           }
                         }}
                       />

                       {customBrandRequired && (
                         <label className="block">
                           <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5D686C]">
                             Custom Brand
                           </span>

                           <input
                             value={
                               editedCustomBrand
                             }
                             onChange={(
                               event
                             ) =>
                               setEditedCustomBrand(
                                 event
                                   .target
                                   .value
                               )
                             }
                             placeholder="Enter brand name"
                             className="h-12 w-full rounded-xl border border-[#D8CEC2] bg-white px-4 text-[15px] outline-none transition focus:border-[#8C1D40] focus:ring-4 focus:ring-[#8C1D40]/10"
                           />
                         </label>
                       )}

                       <label className="block">
                         <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5D686C]">
                           Daily Dose
                         </span>

                         <input
                           value={
                             editedDosage
                           }
                           onChange={(
                             event
                           ) =>
                             setEditedDosage(
                               event.target
                                 .value
                             )
                           }
                           placeholder="200 mg or 2 capsules"
                           className="h-12 w-full rounded-xl border border-[#D8CEC2] bg-white px-4 text-[15px] outline-none transition focus:border-[#8C1D40] focus:ring-4 focus:ring-[#8C1D40]/10"
                         />
                       </label>
                     </>
                   )}

                   <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                     <button
                       type="button"
                       onClick={
                         cancelEditing
                       }
                       className="cursor-pointer rounded-full border border-[#1B2529] bg-white/40 px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-[#1B2529]">

                       Cancel
                     </button>

                     <button
                       type="button"
                       disabled={
                         recheckDisabled
                       }
                       onClick={() =>
                         isClinicianReview
                           ? saveClinicianNote(
                               index
                             )
                           : saveAndRecheck(
                               index,
                               item
                             )
                       }
                       className="cursor-pointer rounded-full bg-[#081620] px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-40">

                       {isClinicianReview
                         ? "Save Note"
                         : "Save & Recheck"}
                     </button>
                   </div>
                 </div>
               ) : (
                 <>
                   {item.note && (
                     <p className="mt-2 text-sm leading-6 text-[#5D686C]">
                       {item.note}
                     </p>
                   )}

                   {clinicianNotes[
                     index
                   ] && (
                     <p className="mt-2 rounded-2xl border border-[#DDD7CF] bg-white/50 px-4 py-3 text-sm leading-6 text-[#475357]">
                       <span className="font-medium text-[#081620]">
                         Clinician
                         note:
                       </span>{" "}
                       {
                         clinicianNotes[
                           index
                         ]
                       }
                     </p>
                   )}

                   {item.reason ===
                     "possible_misspelling" &&
                     item.suggestion &&
                     item.suggestion.toLowerCase() !==
                       item.name.toLowerCase() && (
                       <p className="mt-2 text-sm leading-6 text-[#5D686C]">
                         Did you mean{" "}
                         <span className="font-medium text-[#081620]">
                           {
                             item.suggestion
                           }
                         </span>
                         ?
                       </p>
                     )}

                   <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                     <button
                       type="button"
                       onClick={() =>
                         startEditing(
                           item,
                           index
                         )
                       }
                       className="cursor-pointer rounded-full border border-[#1B2529] bg-white/40 px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-[#1B2529]">

                       {isClinicianReview
                         ? "Add Note"
                         : "Edit"}
                     </button>

                     <button
                       type="button"
                       onClick={() =>
                         removeUnrecognizedItem(
                           index
                         )
                       }
                       className="cursor-pointer rounded-full border border-[#8C1D40]/40 bg-white/40 px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-[#8C1D40]">

                       {isClinicianReview
                         ? "Dismiss"
                         : "Remove"}
                     </button>
                   </div>
                 </>
               )}
             </div>
           );
         }
       )}
     </div>
   </div>
 );
}