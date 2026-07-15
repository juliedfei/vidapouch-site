"use client";

import {
 useEffect,
 useMemo,
 useState,
 type KeyboardEvent,
 type RefObject,
} from "react";

import {
 SUPPLEMENT_CATALOG,
} from "./supplementCatalog";

import BrandSelect from "./BrandSelect";

const MAX_VISIBLE_SUGGESTIONS = 8;

type Props = {
 brand: string;
 name: string;
 dosage: string;

 setBrand: (value: string) => void;
 setName: (value: string) => void;
 setDosage: (value: string) => void;

 handleKeyDown: (
   event: KeyboardEvent<
     HTMLInputElement | HTMLSelectElement>

 ) => void;

 handleSubmit: () => void;

 supplementInputRef:
   RefObject<HTMLInputElement | null>;
};

export default function SupplementEntryForm({
 brand,
 name,
 dosage,

 setBrand,
 setName,
 setDosage,

 handleKeyDown,
 handleSubmit,

 supplementInputRef,
}: Props) {
 const [
   isSuggestionListOpen,
   setIsSuggestionListOpen,
 ] = useState(false);

 const [
   activeSuggestionIndex,
   setActiveSuggestionIndex,
 ] = useState(-1);

 const normalizedSearch =
   name.trim().toLowerCase();

 const filteredSupplements =
   useMemo(() => {
     if (!normalizedSearch) {
       return [];
     }

     const startsWithMatches =
       SUPPLEMENT_CATALOG.filter(
         (supplement) =>
           supplement
             .toLowerCase()
             .startsWith(
               normalizedSearch
             )
       );

     const containsMatches =
       SUPPLEMENT_CATALOG.filter(
         (supplement) => {
           const normalizedSupplement =
             supplement.toLowerCase();

           return (
             normalizedSupplement.includes(
               normalizedSearch
             ) &&
             !normalizedSupplement.startsWith(
               normalizedSearch
             )
           );
         }
       );

     return [
       ...startsWithMatches,
       ...containsMatches,
     ].slice(
       0,
       MAX_VISIBLE_SUGGESTIONS
     );
   }, [normalizedSearch]);

 const hasExactMatch = useMemo(
   () =>
     SUPPLEMENT_CATALOG.some(
       (supplement) =>
         supplement.toLowerCase() ===
         normalizedSearch
     ),
   [normalizedSearch]
 );

 const showCustomOption =
   normalizedSearch.length > 0 &&
   filteredSupplements.length === 0 &&
   !hasExactMatch;

 const visibleOptionCount =
   filteredSupplements.length +
   (showCustomOption ? 1 : 0);

 useEffect(() => {
   setActiveSuggestionIndex(
     visibleOptionCount > 0
       ? 0
       : -1
   );
 }, [
   normalizedSearch,
   visibleOptionCount,
 ]);

 function selectSupplement(
   supplementName: string
 ) {
   setName(supplementName);
   setIsSuggestionListOpen(false);
   setActiveSuggestionIndex(-1);
 }

 function keepCustomSupplement() {
   setName(name.trim());
   setIsSuggestionListOpen(false);
   setActiveSuggestionIndex(-1);
 }

 function handleSupplementChange(
   value: string
 ) {
   setName(value);

   setIsSuggestionListOpen(
     value.trim().length > 0
   );
 }

 function handleSupplementKeyDown(
   event: KeyboardEvent<HTMLInputElement>
 ) {
   if (event.key === "Escape") {
     event.preventDefault();
     setIsSuggestionListOpen(false);
     setActiveSuggestionIndex(-1);
     return;
   }

   if (
     isSuggestionListOpen &&
     visibleOptionCount > 0
   ) {
     if (event.key === "ArrowDown") {
       event.preventDefault();

       setActiveSuggestionIndex(
         (currentIndex) =>
           currentIndex >=
           visibleOptionCount - 1
             ? 0
             : currentIndex + 1
       );

       return;
     }

     if (event.key === "ArrowUp") {
       event.preventDefault();

       setActiveSuggestionIndex(
         (currentIndex) =>
           currentIndex <= 0
             ? visibleOptionCount - 1
             : currentIndex - 1
       );

       return;
     }

     if (event.key === "Enter") {
       event.preventDefault();

       if (
         activeSuggestionIndex >= 0 &&
         activeSuggestionIndex <
           filteredSupplements.length
       ) {
         selectSupplement(
           filteredSupplements[
             activeSuggestionIndex
           ]
         );

         return;
       }

       if (
         showCustomOption &&
         activeSuggestionIndex ===
           filteredSupplements.length
       ) {
         keepCustomSupplement();
         return;
       }
     }
   }

   handleKeyDown(event);
 }

 const canAdd =
   name.trim().length > 0 &&
   brand.trim().length > 0;

 return (
   <div className="grid gap-4 lg:grid-cols-[2fr_1.2fr_1fr_auto] lg:items-end">
     <label className="relative block">
       <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5D686C]">
         Supplement
       </span>

       <div className="relative">
         <input
           ref={supplementInputRef}
           value={name}
           onChange={(event) =>
             handleSupplementChange(
               event.target.value
             )
           }
           onFocus={() => {
             if (name.trim()) {
               setIsSuggestionListOpen(
                 true
               );
             }
           }}
           onBlur={() => {
             setIsSuggestionListOpen(
               false
             );

             setActiveSuggestionIndex(
               -1
             );
           }}
           onKeyDown={
             handleSupplementKeyDown
           }
           placeholder="Search supplements"
           autoComplete="off"
           role="combobox"
           aria-autocomplete="list"
           aria-expanded={
             isSuggestionListOpen &&
             visibleOptionCount > 0
           }
           aria-controls="supplement-suggestions"
           className="h-12 w-full rounded-xl border border-[#D8CEC2] bg-white px-4 pr-10 text-[15px] outline-none transition focus:border-[#8C1D40] focus:ring-4 focus:ring-[#8C1D40]/10"
         />

         <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#7B746C]">
           <svg
             viewBox="0 0 24 24"
             aria-hidden="true"
             className="h-4 w-4"
             fill="none"
             stroke="currentColor"
             strokeWidth="2">

             <circle
               cx="11"
               cy="11"
               r="7"
             />

             <path d="m20 20-3.5-3.5" />
           </svg>
         </div>

         {isSuggestionListOpen &&
           visibleOptionCount > 0 && (
             <div
               id="supplement-suggestions"
               role="listbox"
               className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-[#D8CEC2] bg-white py-2 shadow-[0_16px_40px_rgba(8,22,32,0.14)]">

               {filteredSupplements.map(
                 (
                   supplement,
                   suggestionIndex
                 ) => (
                   <button
                     key={supplement}
                     type="button"
                     role="option"
                     aria-selected={
                       suggestionIndex ===
                       activeSuggestionIndex
                     }
                     onMouseDown={(
                       event
                     ) => {
                       event.preventDefault();
                     }}
                     onClick={() =>
                       selectSupplement(
                         supplement
                       )
                     }
                     onMouseEnter={() =>
                       setActiveSuggestionIndex(
                         suggestionIndex
                       )
                     }
                     className={`block w-full px-4 py-3 text-left text-[15px] transition ${
                       suggestionIndex ===
                       activeSuggestionIndex
                         ? "bg-[#F3E9DE] text-[#081620]"
                         : "bg-white text-[#475357] hover:bg-[#F8F2EA]"
                     }`}>

                     {supplement}
                   </button>
                 )
               )}

               {showCustomOption && (
                 <button
                   type="button"
                   role="option"
                   aria-selected={
                     activeSuggestionIndex ===
                     filteredSupplements.length
                   }
                   onMouseDown={(
                     event
                   ) => {
                     event.preventDefault();
                   }}
                   onClick={
                     keepCustomSupplement
                   }
                   onMouseEnter={() =>
                     setActiveSuggestionIndex(
                       filteredSupplements.length
                     )
                   }
                   className={`block w-full border-t border-[#E7DED4] px-4 py-3 text-left text-[15px] font-medium transition ${
                     activeSuggestionIndex ===
                     filteredSupplements.length
                       ? "bg-[#F3E9DE] text-[#8C1D40]"
                       : "bg-white text-[#8C1D40] hover:bg-[#F8F2EA]"
                   }`}>

                   + Add “{name.trim()}”
                 </button>
               )}
             </div>
           )}
       </div>
     </label>

     <BrandSelect
       value={brand}
       onChange={setBrand}
     />

     <label className="block">
       <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5D686C]">
         Daily Dose
       </span>

       <input
         value={dosage}
         onChange={(event) =>
           setDosage(
             event.target.value
           )
         }
         onKeyDown={handleKeyDown}
         placeholder="200 mg or 2 capsules"
         className="h-12 w-full rounded-xl border border-[#D8CEC2] bg-white px-4 text-[15px] outline-none transition focus:border-[#8C1D40] focus:ring-4 focus:ring-[#8C1D40]/10"
       />
     </label>

     <button
       type="button"
       onClick={handleSubmit}
       disabled={!canAdd}
       className="h-12 whitespace-nowrap rounded-xl bg-[#081620] px-6 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#17262C] disabled:cursor-not-allowed disabled:opacity-40">

       Add
     </button>
   </div>
 );
}
