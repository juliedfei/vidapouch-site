"use client";

import {
 useEffect,
 useId,
 useLayoutEffect,
 useRef,
 useState,
 type FormEvent,
 type KeyboardEvent,
} from "react";

import {
 createPortal,
} from "react-dom";




type SearchSuggestion = {
    id:
      string;
    
    label:
      string;
    
    query:
      string;
    
    type:
      | "supplement"
      | "goal"
      | "condition"
      | "life-stage"
      | "brand"
      | "search";
    };
    





type SuggestionResponse = {
 suggestions?:
   SearchSuggestion[];
};

type Props = {
 value:
   string;

 onChange:
   (
     value:
       string
   ) => void;

 onSubmit:
   (
     query:
       string
   ) => void;

 placeholder?:
   string;

 disabled?:
   boolean;
};

type DropdownPosition = {
 left:
   number;

 top:
   number;

 width:
   number;
};

const MINIMUM_QUERY_LENGTH =
 2;

const DEBOUNCE_DELAY_MS =
 200;

const MAX_VISIBLE_SUGGESTIONS =
 8;

const DROPDOWN_GAP_PX =
 10;




 function getSuggestionTypeLabel(
    type:
      SearchSuggestion["type"]
    ) {
    switch (
      type
    ) {
      case "supplement":
        return "Supplement";
    
      case "goal":
        return "Goal";
    
      case "condition":
        return "Condition";
    
      case "life-stage":
        return "Life Stage";
    
      case "brand":
        return "Brand";
    
      case "search":
      default:
        return "Search";
    }
    }
    






function isSearchSuggestion(
 value:
   unknown
): value is SearchSuggestion {
 if (
   typeof value !==
     "object" ||
   value ===
     null
 ) {
   return false;
 }

 const suggestion =
   value as Partial<
     SearchSuggestion
>;

 return (
   typeof suggestion.id ===
     "string" &&
   typeof suggestion.label ===
     "string" &&
   typeof suggestion.query ===
     "string" &&
   
   
   
   
     (
        suggestion.type ===
          "supplement" ||
        suggestion.type ===
          "goal" ||
        suggestion.type ===
          "condition" ||
        suggestion.type ===
          "life-stage" ||
        suggestion.type ===
          "brand" ||
        suggestion.type ===
          "search"
       )



 );
}

export default function
VidaSearchAutocomplete({
 value,
 onChange,
 onSubmit,
 placeholder =
   "Search supplements, goals, or brands",
 disabled =
   false,
}: Props) {
 const listboxId =
   useId();

 const containerRef =
   useRef<HTMLDivElement>(
     null
   );

 const dropdownRef =
   useRef<HTMLDivElement>(
     null
   );

 const inputRef =
   useRef<HTMLInputElement>(
     null
   );

 const abortControllerRef =
   useRef<AbortController | null>(
     null
   );

 const [
   suggestions,
   setSuggestions,
 ] =
   useState<
     SearchSuggestion[]
>([]);

 const [
   isOpen,
   setIsOpen,
 ] =
   useState(
     false
   );

 const [
   isLoading,
   setIsLoading,
 ] =
   useState(
     false
   );

 const [
   activeIndex,
   setActiveIndex,
 ] =
   useState(
     -1
   );

 /*
  * A suggestion is submitted with Enter only after
  * the user deliberately navigates the list with an
  * arrow key.
  *
  * Typing and pressing Enter always searches the
  * exact text in the input.
  */
 const [
   hasKeyboardNavigated,
   setHasKeyboardNavigated,
 ] =
   useState(
     false
   );

 const [
   isMounted,
   setIsMounted,
 ] =
   useState(
     false
   );

 const [
   dropdownPosition,
   setDropdownPosition,
 ] =
   useState<
     DropdownPosition | null
>(
     null
   );

 const normalizedValue =
   value.trim();

 const hasVisibleDropdown =
   isOpen &&
   (
     isLoading ||
     suggestions.length >
       0
   );

 useEffect(() => {
   setIsMounted(
     true
   );
 }, []);

 useEffect(() => {
   setHasKeyboardNavigated(
     false
   );

   setActiveIndex(
     -1
   );

   if (
     normalizedValue.length <
     MINIMUM_QUERY_LENGTH
   ) {
     abortControllerRef.current
       ?.abort();

     setSuggestions(
       []
     );

     setIsLoading(
       false
     );

     setIsOpen(
       false
     );

     return;
   }

   const timeoutId =
     window.setTimeout(
       async () => {
         abortControllerRef.current
           ?.abort();

         const controller =
           new AbortController();

         abortControllerRef.current =
           controller;

         setIsLoading(
           true
         );

         try {
           const response =
             await fetch(
               `/api/search/suggestions?q=${encodeURIComponent(
                 normalizedValue
               )}`,
               {
                 method:
                   "GET",

                 signal:
                   controller.signal,

                 cache:
                   "no-store",
               }
             );

           if (
             !response.ok
           ) {
             throw new Error(
               `Suggestion request failed with status ${response.status}.`
             );
           }

           const payload =
             await response.json() as
               SuggestionResponse;

           const nextSuggestions =
             Array.isArray(
               payload.suggestions
             )
               ? payload.suggestions
                   .filter(
                     isSearchSuggestion
                   )
                   .slice(
                     0,
                     MAX_VISIBLE_SUGGESTIONS
                   )
               : [];

           setSuggestions(
             nextSuggestions
           );

           setIsOpen(
             nextSuggestions.length >
             0
           );

           /*
            * Do not automatically activate the first
            * suggestion. The typed query remains the
            * default Enter behavior.
            */
           setActiveIndex(
             -1
           );

           setHasKeyboardNavigated(
             false
           );
         } catch (
           error
         ) {
           if (
             error instanceof
               DOMException &&
             error.name ===
               "AbortError"
           ) {
             return;
           }

           console.error(
             "VidaSearch suggestions failed:",
             error
           );

           setSuggestions(
             []
           );

           setIsOpen(
             false
           );

           setActiveIndex(
             -1
           );

           setHasKeyboardNavigated(
             false
           );
         } finally {
           if (
             abortControllerRef.current ===
             controller
           ) {
             setIsLoading(
               false
             );
           }
         }
       },
       DEBOUNCE_DELAY_MS
     );

   return () => {
     window.clearTimeout(
       timeoutId
     );
   };
 }, [
   normalizedValue,
 ]);

 useLayoutEffect(() => {
   if (
     !hasVisibleDropdown
   ) {
     return;
   }

   function updateDropdownPosition() {
     const container =
       containerRef.current;

     if (
       !container
     ) {
       return;
     }

     const rect =
       container.getBoundingClientRect();

     setDropdownPosition({
       left:
         rect.left,

       top:
         rect.bottom +
         DROPDOWN_GAP_PX,

       width:
         rect.width,
     });
   }

   updateDropdownPosition();

   window.addEventListener(
     "resize",
     updateDropdownPosition
   );

   window.addEventListener(
     "scroll",
     updateDropdownPosition,
     true
   );

   return () => {
     window.removeEventListener(
       "resize",
       updateDropdownPosition
     );

     window.removeEventListener(
       "scroll",
       updateDropdownPosition,
       true
     );
   };
 }, [
   hasVisibleDropdown,
   suggestions.length,
   isLoading,
 ]);

 useEffect(() => {
   function handlePointerDown(
     event:
       MouseEvent
   ) {
     const target =
       event.target as
         Node;

     const clickedInsideSearch =
       containerRef.current
         ?.contains(
           target
         );

     const clickedInsideDropdown =
       dropdownRef.current
         ?.contains(
           target
         );

     if (
       !clickedInsideSearch &&
       !clickedInsideDropdown
     ) {
       setIsOpen(
         false
       );

       setActiveIndex(
         -1
       );

       setHasKeyboardNavigated(
         false
       );
     }
   }

   document.addEventListener(
     "mousedown",
     handlePointerDown
   );

   return () => {
     document.removeEventListener(
       "mousedown",
       handlePointerDown
     );
   };
 }, []);

 useEffect(() => {
   return () => {
     abortControllerRef.current
       ?.abort();
   };
 }, []);

 function closeSuggestions() {
   setIsOpen(
     false
   );

   setSuggestions(
     []
   );

   setActiveIndex(
     -1
   );

   setHasKeyboardNavigated(
     false
   );
 }

 function submitQuery(
   rawQuery:
     string
 ) {
   const query =
     rawQuery.trim();

   if (
     !query ||
     disabled
   ) {
     return;
   }

   abortControllerRef.current
     ?.abort();

   closeSuggestions();

   onChange(
     query
   );

   onSubmit(
     query
   );
 }

 function selectSuggestion(
   suggestion:
     SearchSuggestion
 ) {
   submitQuery(
     suggestion.query
   );
 }

 function handleSubmit(
   event:
     FormEvent<HTMLFormElement>
 ) {
   event.preventDefault();

   /*
    * Only submit a suggestion when the user explicitly
    * navigated to it with an arrow key.
    */
   if (
     hasKeyboardNavigated &&
     isOpen &&
     activeIndex >=
       0 &&
     activeIndex <
       suggestions.length
   ) {
     selectSuggestion(
       suggestions[
         activeIndex
       ]
     );

     return;
   }

   /*
    * Ordinary Enter or clicking Search submits the
    * exact text currently typed.
    */
   submitQuery(
     value
   );
 }

 function handleKeyDown(
   event:
     KeyboardEvent<HTMLInputElement>
 ) {
   if (
     event.key ===
       "Escape"
   ) {
     event.preventDefault();

     setIsOpen(
       false
     );

     setActiveIndex(
       -1
     );

     setHasKeyboardNavigated(
       false
     );

     return;
   }

   if (
     event.key ===
       "Enter"
   ) {
     /*
      * Let the form submit handler decide whether to
      * use the typed query or an intentionally selected
      * suggestion.
      */
     return;
   }

   if (
     !isOpen ||
     suggestions.length ===
       0
   ) {
     return;
   }

   if (
     event.key ===
       "ArrowDown"
   ) {
     event.preventDefault();

     setHasKeyboardNavigated(
       true
     );

     setActiveIndex(
       (
         currentIndex
       ) => {
         if (
           currentIndex <
           0
         ) {
           return 0;
         }

         return currentIndex >=
           suggestions.length -
             1
           ? 0
           : currentIndex +
             1;
       }
     );

     return;
   }

   if (
     event.key ===
       "ArrowUp"
   ) {
     event.preventDefault();

     setHasKeyboardNavigated(
       true
     );

     setActiveIndex(
       (
         currentIndex
       ) => {
         if (
           currentIndex <
           0
         ) {
           return (
             suggestions.length -
             1
           );
         }

         return currentIndex <=
           0
           ? suggestions.length -
             1
           : currentIndex -
             1;
       }
     );
   }
 }

 const activeSuggestionId =
   hasKeyboardNavigated &&
   activeIndex >=
     0 &&
   activeIndex <
     suggestions.length
     ? `${listboxId}-${activeIndex}`
     : undefined;

 const dropdown =
   isMounted &&
   hasVisibleDropdown &&
   dropdownPosition
     ? createPortal(
         <div
           ref={
             dropdownRef
           }
           id={
             listboxId
           }
           role="listbox"
           style={{
             position:
               "fixed",

             left:
               dropdownPosition.left,

             top:
               dropdownPosition.top,

             width:
               dropdownPosition.width,

             zIndex:
               2147483647,
           }}
           className="max-h-[min(28rem,calc(100vh-24px))] overflow-y-auto rounded-[22px] border border-[#D8CEC2] bg-white py-2 shadow-[0_20px_55px_rgba(8,22,32,0.20)]">

           {isLoading &&
             suggestions.length ===
               0 && (
               <div className="px-5 py-4 text-[14px] text-[#6B7477]">
                 Finding suggestions…
               </div>
             )}

           {suggestions.map(
             (
               suggestion,
               suggestionIndex
             ) => {
               const isActive =
                 hasKeyboardNavigated &&
                 suggestionIndex ===
                   activeIndex;

               return (
                 <button
                   key={
                     suggestion.id
                   }
                   id={`${listboxId}-${suggestionIndex}`}
                   type="button"
                   role="option"
                   aria-selected={
                     isActive
                   }
                   onMouseDown={(
                     event
                   ) => {
                     event.preventDefault();
                   }}
                   onMouseEnter={() => {
                     /*
                      * Hover may visually highlight an
                      * item, but does not change what
                      * Enter submits.
                      */
                     setActiveIndex(
                       suggestionIndex
                     );
                   }}
                   onMouseLeave={() => {
                     if (
                       !hasKeyboardNavigated
                     ) {
                       setActiveIndex(
                         -1
                       );
                     }
                   }}
                   onClick={() => {
                     selectSuggestion(
                       suggestion
                     );
                   }}
                   className={`flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition ${
                     suggestionIndex ===
                     activeIndex
                       ? "bg-[#F3E9DE]"
                       : "bg-white hover:bg-[#F8F2EA]"
                   }`}>

                   <span className="min-w-0">
                     <span className="block truncate text-[15px] font-medium text-[#081620]">
                       {
                         suggestion.label
                       }
                     </span>

                     <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.09em] text-[#7A8487]">
                       {getSuggestionTypeLabel(
                         suggestion.type
                       )}
                     </span>
                   </span>

                   <svg
                     viewBox="0 0 24 24"
                     aria-hidden="true"
                     className="h-4 w-4 shrink-0 text-[#8C1D40]"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2">

                     <path d="M5 12h14" />

                     <path d="m13 6 6 6-6 6" />
                   </svg>
                 </button>
               );
             }
           )}
         </div>,
         document.body
       )
     : null;

 return (
   <>
     <div
       ref={
         containerRef
       }
       className="relative w-full">

       <form
         onSubmit={
           handleSubmit
         }
         role="search"
         className="relative">

         <div className="relative flex items-center rounded-full border border-[#D8CEC2] bg-white shadow-[0_12px_35px_rgba(8,22,32,0.10)] transition focus-within:border-[#8C1D40] focus-within:ring-4 focus-within:ring-[#8C1D40]/10">
           <div className="pointer-events-none absolute left-5 flex items-center text-[#6F787B]">
             <svg
               viewBox="0 0 24 24"
               aria-hidden="true"
               className="h-5 w-5"
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

           <input
             ref={
               inputRef
             }
             value={
               value
             }
             disabled={
               disabled
             }
             onChange={(
               event
             ) => {
               onChange(
                 event.target.value
               );

               setHasKeyboardNavigated(
                 false
               );

               setActiveIndex(
                 -1
               );

               if (
                 event.target.value
                   .trim()
                   .length >=
                 MINIMUM_QUERY_LENGTH
               ) {
                 setIsOpen(
                   true
                 );
               }
             }}
             onFocus={() => {
               if (
                 suggestions.length >
                   0
               ) {
                 setIsOpen(
                   true
                 );
               }
             }}
             onKeyDown={
               handleKeyDown
             }
             placeholder={
               placeholder
             }
             autoComplete="off"
             role="combobox"
             aria-autocomplete="list"
             aria-expanded={
               isOpen &&
               suggestions.length >
                 0
             }
             aria-controls={
               listboxId
             }
             aria-activedescendant={
               activeSuggestionId
             }
             className="h-16 w-full rounded-full bg-transparent pl-14 pr-36 text-[16px] text-[#081620] outline-none placeholder:text-[#7A8487] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[17px]"
           />

           <button
             type="submit"
             disabled={
               disabled ||
               !value.trim()
             }
             className="absolute right-2 h-12 rounded-full bg-[#8C1D40] px-7 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#741734] disabled:cursor-not-allowed disabled:opacity-45">

             Search
           </button>
         </div>
       </form>
     </div>

     {dropdown}
   </>
 );
}
