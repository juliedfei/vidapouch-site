"use client";

import VidaSearchAutocomplete from "./VidaSearchAutocomplete";

import {
  trackEvent,
 } from "@/lib/analytics/trackEvent";



type SearchBarProps = {
 value:
   string;

 onChange:
   (
     value:
       string
   ) => void;

 /*
  * When provided, choosing a suggestion submits the
  * search immediately.
  *
  * This is optional so existing SearchBar usages keep
  * building until their parent components are updated.
  */
 onSubmit?:
   (
     query:
       string
   ) => void;

 placeholder?:
   string;

 variant?:
   "hero" |
   "compact";

 disabled?:
   boolean;
};

export default function SearchBar({
 value,
 onChange,
 onSubmit,
 placeholder =
   "Search supplements, health goals, or brands...",
 variant =
   "hero",
 disabled =
   false,
}: SearchBarProps) {
 function handleSubmit(
   query:
     string
 ) {
   const cleanedQuery =
     query.trim();

   if (
     !cleanedQuery
   ) {
     return;
   }

   /*
    * Always update the controlled value first.
    *
    * Existing parent components that have not yet
    * supplied onSubmit will still receive the selected
    * autocomplete value without breaking.
    */
   onChange(
     cleanedQuery
   );


   trackEvent(
    "search_submitted",
    {
      search_query: cleanedQuery,
      search_location:
        variant === "hero"
          ? "hero_search"
          : "compact_search",
    }
   );
   




   onSubmit?.(
     cleanedQuery
   );
 }

 /*
  * The autocomplete component currently owns the hero
  * search appearance.
  *
  * Compact placement is constrained here so it still
  * fits naturally inside the post-search workspace.
  */
 const containerClassName =
   variant ===
     "compact"
     ? "w-full [&_input]:h-12 [&_button[type='submit']]:h-9 [&_button[type='submit']]:px-5"
     : "w-full";

 return (
   <div
     className={
       containerClassName
     }>

     <VidaSearchAutocomplete
       value={value}
       onChange={onChange}
       onSubmit={
         handleSubmit
       }
       placeholder={
         placeholder
       }
       disabled={
         disabled
       }
     />
   </div>
 );
}
