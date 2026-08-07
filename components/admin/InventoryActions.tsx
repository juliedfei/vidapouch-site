"use client";

import {
 useState,
} from "react";

import InventoryReceiveForm from
 "@/components/admin/InventoryReceiveForm";

export default function InventoryActions() {
 const [
   isMenuOpen,
   setIsMenuOpen,
 ] =
   useState(
     false
   );

 const [
   isReceiveOpen,
   setIsReceiveOpen,
 ] =
   useState(
     false
   );

 return (
   <div className="relative">
     <button
       type="button"
       onClick={() => {
         setIsMenuOpen(
           (
             current
           ) =>
             !current
         );
       }}
       className="rounded-full border border-[#D8CEC4] bg-white px-3 py-1.5 text-lg font-semibold leading-none text-[#665C54] transition hover:bg-[#F7F3EE]"
       aria-label="Inventory actions">

       ⋯
     </button>

     {isMenuOpen ? (
       <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-2xl border border-[#DED4C9] bg-white p-2 shadow-xl">
         <button
           type="button"
           onClick={() => {
             setIsMenuOpen(
               false
             );

             setIsReceiveOpen(
               true
             );
           }}
           className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-[#302A25] transition hover:bg-[#F7F3EE]">

           Receive inventory
         </button>
       </div>
     ) : null}

     {isReceiveOpen ? (
       <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/35 px-4 py-8">
         <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#DED4C9] bg-[#F7F3EE] p-6 shadow-2xl">
           <div className="mb-5 flex items-start justify-between gap-4">
             <div>
               <h2 className="text-xl font-semibold text-[#26211D]">
                 Add a bottle
               </h2>

               <p className="mt-1 text-sm text-[#665C54]">
                 Record newly received VidaPouch inventory.
               </p>
             </div>

             <button
               type="button"
               onClick={() => {
                 setIsReceiveOpen(
                   false
                 );
               }}
               className="rounded-full border border-[#D8CEC4] bg-white px-3 py-1.5 text-sm font-semibold text-[#665C54]">

               Close
             </button>
           </div>

           <InventoryReceiveForm />
         </div>
       </div>
     ) : null}
   </div>
 );
}
