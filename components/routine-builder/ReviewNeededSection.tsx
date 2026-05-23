"use client";

import { useState } from "react";
import type { UnrecognizedItem } from "./types";

type ReviewNeededSectionProps = {
 unrecognizedItems: UnrecognizedItem[];
 removeUnrecognizedItem: (indexToRemove: number) => void;
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
 const [editingIndex, setEditingIndex] = useState<number | null>(null);

 const [editedName, setEditedName] = useState("");
 const [editedDosage, setEditedDosage] = useState("");

 function startEditing(item: UnrecognizedItem, index: number) {
   setEditingIndex(index);

   setEditedName(item.suggestion || item.name || "");
   setEditedDosage(item.dosage || "");
 }

 function cancelEditing() {
   setEditingIndex(null);

   setEditedName("");
   setEditedDosage("");
 }

 function saveAndRecheck(index: number, item: UnrecognizedItem) {
   recheckReviewedItem(index, {
     ...item,
     name: editedName.trim(),
     dosage: editedDosage.trim(),
     suggestion: "",
     reason: "needs_confirmation",
     note: "Edited by user. Rechecking before adding to a pouch.",
   });

   cancelEditing();
 }

 if (unrecognizedItems.length === 0) {
   return null;
 }

 return (
   <div className="mt-7 rounded-[24px] border border-[#8C1D40]/30 bg-[#FFF7F5] p-5">
     <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C1D40]">
       Review needed
     </p>

     <h3
       className="mt-2 text-[24px] tracking-[-0.03em]"
       style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

       These items need review.
     </h3>

     <p className="mt-2 max-w-[620px] text-[15px] leading-7 text-[#475357]">
       These items were not added to a pouch yet. Edit an item and we’ll
       recheck it before placing it into your routine.
     </p>

     <div className="mt-4 grid gap-3">
       {unrecognizedItems.map((item, index) => {
         const isEditing = editingIndex === index;

         return (
           <div
             key={`${item.name}-${index}`}
             className="rounded-2xl border border-[#8C1D40]/25 bg-[#F8F2EA] px-4 py-4">

             <div className="flex items-start justify-between gap-4">
               <div>
                 <p className="text-[11px] uppercase tracking-[0.14em] text-[#8C1D40]">
                   {item.reason
                     ? item.reason.replaceAll("_", " ")
                     : "Unrecognized"}
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
               <div className="mt-4 grid gap-3">
                 <input
                   value={editedName}
                   onChange={(e) => setEditedName(e.target.value)}
                   placeholder="Supplement, e.g. Magnesium"
                   className="w-full rounded-2xl border border-[#D6CCBF] bg-white/70 px-4 py-3 outline-none"
                 />

                 <input
                   value={editedDosage}
                   onChange={(e) => setEditedDosage(e.target.value)}
                   placeholder="Dosage (optional)"
                   className="w-full rounded-2xl border border-[#D6CCBF] bg-white/70 px-4 py-3 outline-none"
                 />

                 <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                   <button
                     onClick={cancelEditing}
                     className="cursor-pointer rounded-full border border-[#1B2529] bg-white/40 px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-[#1B2529]">

                     Cancel
                   </button>

                   <button
                     onClick={() => saveAndRecheck(index, item)}
                     className="cursor-pointer rounded-full bg-[#081620] px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-white">

                     Save & Recheck
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

                 {item.suggestion &&
                   item.suggestion.toLowerCase() !==
                     item.name.toLowerCase() && (
                     <p className="mt-2 text-sm leading-6 text-[#5D686C]">
                       Did you mean{" "}
                       <span className="font-medium text-[#081620]">
                         {item.suggestion}
                       </span>
                       ?
                     </p>
                   )}

                 <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                   <button
                     onClick={() => startEditing(item, index)}
                     className="cursor-pointer rounded-full border border-[#1B2529] bg-white/40 px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-[#1B2529]">

                     Edit
                   </button>

                   <button
                     onClick={() => removeUnrecognizedItem(index)}
                     className="cursor-pointer rounded-full border border-[#8C1D40]/40 bg-white/40 px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-[#8C1D40]">

                     Remove
                   </button>
                 </div>
               </>
             )}
           </div>
         );
       })}
     </div>
   </div>
 );
}