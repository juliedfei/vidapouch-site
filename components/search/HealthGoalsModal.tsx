"use client";

import {
 useEffect,
 useMemo,
 useState,
} from "react";

import {
 Search,
 X,
} from "lucide-react";

import {
 HEALTH_TOPICS,
 HEALTH_TOPIC_CATEGORY_ORDER,
} from "@/lib/search/healthTopicCatalog";

import type {
 HealthTopic,
 HealthTopicCategory,
} from "@/lib/search/healthTopicCatalog";

type Props = {
 open:
   boolean;

 onClose:
   () => void;

 onSelect:
   (
     searchQuery:
       string
   ) => void;
};

function getTopicTypeLabel(
 topic:
   HealthTopic
) {
 switch (
   topic.type
 ) {
   case "health-condition":
     return "Health condition";

   case "life-stage":
     return "Life stage";

   case "health-goal":
   default:
     return "Wellness goal";
 }
}

function getTopicsByCategory({
 topics,
 category,
}: {
 topics:
   HealthTopic[];

 category:
   HealthTopicCategory;
}) {
 return topics.filter(
   (topic) =>
     topic.category ===
     category
 );
}

export default function HealthGoalsModal({
 open,
 onClose,
 onSelect,
}: Props) {
 const [
   searchQuery,
   setSearchQuery,
 ] =
   useState(
     ""
   );

 useEffect(
   () => {
     if (
       open
     ) {
       setSearchQuery(
         ""
       );
     }
   },
   [
     open,
   ]
 );

 useEffect(
   () => {
     if (
       !open
     ) {
       return;
     }

     function handleKeyDown(
       event:
         KeyboardEvent
     ) {
       if (
         event.key ===
           "Escape"
       ) {
         onClose();
       }
     }

     document.addEventListener(
       "keydown",
       handleKeyDown
     );

     const previousOverflow =
       document.body.style
         .overflow;

     document.body.style
       .overflow =
       "hidden";

     return () => {
       document.removeEventListener(
         "keydown",
         handleKeyDown
       );

       document.body.style
         .overflow =
         previousOverflow;
     };
   },
   [
     open,
     onClose,
   ]
 );

 const filteredTopics =
   useMemo(
     () => {
       const normalizedSearchQuery =
         searchQuery
           .trim()
           .toLowerCase();

       if (
         !normalizedSearchQuery
       ) {
         return HEALTH_TOPICS;
       }

       return HEALTH_TOPICS.filter(
         (topic) =>
           topic.label
             .toLowerCase()
             .includes(
               normalizedSearchQuery
             ) ||
           topic.description
             .toLowerCase()
             .includes(
               normalizedSearchQuery
             ) ||
           topic.category
             .toLowerCase()
             .includes(
               normalizedSearchQuery
             ) ||
           topic.searchQuery
             .toLowerCase()
             .includes(
               normalizedSearchQuery
             )
       );
     },
     [
       searchQuery,
     ]
   );

 if (
   !open
 ) {
   return null;
 }

 function handleSelect(
   topic:
     HealthTopic
 ) {
   onSelect(
     topic.searchQuery
   );

   onClose();
 }

 return (
   <div
     className=
       "fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-6"
     role=
       "dialog"
     aria-modal=
       "true"
     aria-labelledby=
       "health-goals-modal-title">

     <button
       type=
         "button"
       aria-label=
         "Close health goals"
       className=
         "absolute inset-0 bg-[#2B2118]/45 backdrop-blur-[2px]"
       onClick=
         {onClose}
     />

     <div
       className=
         "relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-[#E5D8CA] bg-[#FFFDFC] shadow-[0_30px_90px_rgba(52,39,29,0.24)]">

       <div
         className=
           "border-b border-[#E9DED3] px-5 py-5 sm:px-8 sm:py-6">

         <div
           className=
             "flex items-start justify-between gap-5">

           <div>
             <p
               className=
                 "mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B6E55]">

               VidaSearch
             </p>

             <h2
               id=
                 "health-goals-modal-title"
               className=
                 "text-2xl font-semibold tracking-[-0.03em] text-[#2D241D] sm:text-3xl">

               Explore health goals
             </h2>

             <p
               className=
                 "mt-2 max-w-2xl text-sm leading-6 text-[#6F6257] sm:text-base">

               Choose a wellness goal, life stage, or health topic to explore relevant supplement categories.
             </p>
           </div>

           <button
             type=
               "button"
             onClick=
               {onClose}
             aria-label=
               "Close"
             className=
               "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2D5C8] bg-white text-[#5B4A3C] transition hover:border-[#CDB9A6] hover:bg-[#F8F3EE]">

             <X
               className=
                 "h-5 w-5"
               aria-hidden=
                 "true"
             />
           </button>
         </div>

         <div
           className=
             "relative mt-5">

           <Search
             className=
               "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9A8878]"
             aria-hidden=
               "true"
           />

           <input
             type=
               "search"
             value=
               {searchQuery}
             onChange=
               {(
                 event
               ) =>
                 setSearchQuery(
                   event.target.value
                 )
               }
             placeholder=
               "Search goals, life stages, or health topics"
             autoFocus
             className=
               "h-12 w-full rounded-2xl border border-[#DDD0C3] bg-white pl-12 pr-4 text-sm text-[#30261F] outline-none transition placeholder:text-[#A49486] focus:border-[#A98466] focus:ring-4 focus:ring-[#A98466]/10 sm:text-base"
           />
         </div>
       </div>

       <div
         className=
           "overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">

         {filteredTopics.length ===
         0 ? (
           <div
             className=
               "rounded-2xl border border-dashed border-[#D9CABC] bg-[#FAF6F2] px-6 py-10 text-center">

             <p
               className=
                 "font-medium text-[#3A2F27]">

               No matching health topics found.
             </p>

             <p
               className=
                 "mt-2 text-sm text-[#786A5E]">

               You can still type any supplement or health topic directly into VidaSearch.
             </p>
           </div>
         ) : (
           <div
             className=
               "space-y-9">

             {HEALTH_TOPIC_CATEGORY_ORDER.map(
               (
                 category
               ) => {
                 const categoryTopics =
                   getTopicsByCategory({
                     topics:
                       filteredTopics,

                     category,
                   });

                 if (
                   categoryTopics.length ===
                     0
                 ) {
                   return null;
                 }

                 return (
                   <section
                     key=
                       {category}>

                     <div
                       className=
                         "mb-4 flex items-center gap-3">

                       <h3
                         className=
                           "text-base font-semibold text-[#332820] sm:text-lg">

                         {category}
                       </h3>

                       <div
                         className=
                           "h-px flex-1 bg-[#E9DED3]"
                       />
                     </div>

                     <div
                       className=
                         "grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                       {categoryTopics.map(
                         (
                           topic
                         ) => (
                           <button
                             key=
                               {topic.id}
                             type=
                               "button"
                             onClick=
                               {() =>
                                 handleSelect(
                                   topic
                                 )
                               }
                             className=
                               "group rounded-2xl border border-[#E3D7CB] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#BFA58D] hover:shadow-[0_12px_30px_rgba(65,48,34,0.09)] focus:outline-none focus:ring-4 focus:ring-[#A98466]/15">

                             <div
                               className=
                                 "flex items-start justify-between gap-3">

                               <span
                                 className=
                                   "font-semibold text-[#342920] transition group-hover:text-[#7A563B]">

                                 {topic.label}
                               </span>

                               <span
                                 className=
                                   "shrink-0 rounded-full bg-[#F4EDE6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#806A57]">

                                 {getTopicTypeLabel(
                                   topic
                                 )}
                               </span>
                             </div>

                             <p
                               className=
                                 "mt-2 text-sm leading-5 text-[#76685C]">

                               {topic.description}
                             </p>
                           </button>
                         )
                       )}
                     </div>
                   </section>
                 );
               }
             )}
           </div>
         )}

         <div
           className=
             "mt-8 rounded-2xl border border-[#E4D7CA] bg-[#F8F3EE] px-4 py-4 text-xs leading-5 text-[#6F6257] sm:px-5 sm:text-sm">

           Supplement information is educational and does not diagnose, treat, cure, or prevent a medical condition. Health-condition and life-stage searches may require guidance from a qualified healthcare professional.
         </div>
       </div>
     </div>
   </div>
 );
}
