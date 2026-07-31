"use client";

import {
 useEffect,
 useRef,
 useState,
} from "react";

import {
 useRouter,
} from "next/navigation";

import {
    createPortal,
    } from "react-dom";



type Props = {
 bottle: {
   id:
     string;

   bottleCode:
     string;

   manufacturerLotNumber:
     string | null;

   expirationDate:
     string | null;

   supplier:
     string | null;

   supplierOrderNumber:
     string | null;

   purchaseDate:
     string | null;

   bottleCost:
     number;

   allocatedShippingCost:
     number;

   allocatedTaxCost:
     number;

   storageLocation:
     string | null;

   notes:
     string | null;
 };
};

function toDateInputValue(
 value:
   string | null
) {
 if (
   !value
 ) {
   return "";
 }

 const date =
   new Date(
     value
   );

 if (
   Number.isNaN(
     date.getTime()
   )
 ) {
   return "";
 }

 return date
   .toISOString()
   .slice(
     0,
     10
   );
}

export default function InventoryBottleActions({
 bottle,
}: Props) {
 const router =
   useRouter();



   const buttonRef =
   useRef<HTMLButtonElement>(
     null
   );
  
  const popoverRef =
   useRef<HTMLDivElement>(
     null
   );

   
   const [
    menuPosition,
    setMenuPosition,
   ] =
    useState({
      top:
        0,
   
      right:
        0,
    });
   




 const [
   menuOpen,
   setMenuOpen,
 ] =
   useState(
     false
   );

 const [
   editOpen,
   setEditOpen,
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
   deleting,
   setDeleting,
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
   manufacturerLotNumber,
   setManufacturerLotNumber,
 ] =
   useState(
     bottle.manufacturerLotNumber ??
     ""
   );

 const [
   expirationDate,
   setExpirationDate,
 ] =
   useState(
     toDateInputValue(
       bottle.expirationDate
     )
   );

 const [
   supplier,
   setSupplier,
 ] =
   useState(
     bottle.supplier ??
     ""
   );

 const [
   supplierOrderNumber,
   setSupplierOrderNumber,
 ] =
   useState(
     bottle.supplierOrderNumber ??
     ""
   );

 const [
   purchaseDate,
   setPurchaseDate,
 ] =
   useState(
     toDateInputValue(
       bottle.purchaseDate
     )
   );

 const [
   bottleCost,
   setBottleCost,
 ] =
   useState(
     bottle.bottleCost.toString()
   );

 const [
   allocatedShippingCost,
   setAllocatedShippingCost,
 ] =
   useState(
     bottle.allocatedShippingCost.toString()
   );

 const [
   allocatedTaxCost,
   setAllocatedTaxCost,
 ] =
   useState(
     bottle.allocatedTaxCost.toString()
   );

 const [
   storageLocation,
   setStorageLocation,
 ] =
   useState(
     bottle.storageLocation ??
     ""
   );

 const [
   notes,
   setNotes,
 ] =
   useState(
     bottle.notes ??
     ""
   );




   useEffect(
    () => {
      function handleDocumentClick(
        event:
          MouseEvent
      ) {
        const target =
          event.target as Node;
   
        const clickedButton =
          buttonRef.current?.contains(
            target
          );
   
        const clickedPopover =
          popoverRef.current?.contains(
            target
          );
   
        if (
          !clickedButton &&
          !clickedPopover
        ) {
          setMenuOpen(
            false
          );
        }
      }
   
      function closeMenuOnScroll() {
        setMenuOpen(
          false
        );
      }
   
      document.addEventListener(
        "mousedown",
        handleDocumentClick
      );
   
      window.addEventListener(
        "scroll",
        closeMenuOnScroll,
        true
      );
   
      window.addEventListener(
        "resize",
        closeMenuOnScroll
      );
   
      return () => {
        document.removeEventListener(
          "mousedown",
          handleDocumentClick
        );
   
        window.removeEventListener(
          "scroll",
          closeMenuOnScroll,
          true
        );
   
        window.removeEventListener(
          "resize",
          closeMenuOnScroll
        );
      };
    },
    []
   );
   







 function openEditModal() {
   setError(
     null
   );

   setMenuOpen(
     false
   );

   setEditOpen(
     true
   );
 }

 async function saveBottle() {
   setError(
     null
   );

   setSaving(
     true
   );

   try {
     const response =
       await fetch(
         "/api/admin/inventory/bottle",
         {
           method:
             "PATCH",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               bottleId:
                 bottle.id,

               manufacturerLotNumber,

               expirationDate,

               supplier,

               supplierOrderNumber,

               purchaseDate,

               bottleCost,

               allocatedShippingCost,

               allocatedTaxCost,

               storageLocation,

               notes,
             }),
         }
       );

     const data =
       await response.json() as {
         error?:
           string;

         bottle?: {
           id:
             string;

           bottleCode:
             string;
         };
       };

     if (
       !response.ok
     ) {
       throw new Error(
         data.error ??
         "Unable to update bottle."
       );
     }

     setEditOpen(
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
         : "Unable to update bottle."
     );
   } finally {
     setSaving(
       false
     );
   }
 }

 async function deleteBottle() {
   setMenuOpen(
     false
   );

   setError(
     null
   );

   const confirmed =
     window.confirm(
       [
         `Delete ${bottle.bottleCode}?`,
         "",
         "This is only allowed if the bottle has never been allocated or otherwise used.",
         "",
         "If the bottle has inventory history, VidaPouch will preserve it instead of deleting it.",
       ].join(
         "\n"
       )
     );

   if (
     !confirmed
   ) {
     return;
   }

   setDeleting(
     true
   );

   try {
     const response =
       await fetch(
         "/api/admin/inventory/bottle",
         {
           method:
             "DELETE",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               bottleId:
                 bottle.id,
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
         "Unable to delete bottle."
       );
     }

     router.refresh();
   } catch (
     caughtError
   ) {
     window.alert(
       caughtError instanceof
         Error
         ? caughtError.message
         : "Unable to delete bottle."
     );
   } finally {
     setDeleting(
       false
     );
   }
 }

 return (
   <>
     
     
     <div className="relative inline-flex">
 <button
   ref={
     buttonRef
   }
   type="button"
   aria-label={`Actions for ${bottle.bottleCode}`}
   aria-expanded={
     menuOpen
   }
   onClick={() => {
     if (
       !menuOpen &&
       buttonRef.current
     ) {
       const rect =
         buttonRef.current.getBoundingClientRect();

       setMenuPosition({
         top:
           rect.bottom +
           6,

         right:
           window.innerWidth -
           rect.right,
       });
     }

     setMenuOpen(
       (
         current
       ) =>
         !current
     );
   }}
   disabled={
     deleting
   }
   className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-semibold leading-none text-[#665C54] transition hover:bg-[#F3EDE7] disabled:cursor-not-allowed disabled:opacity-50">

   ⋯
 </button>

 {menuOpen
   ? createPortal(
       <div
         ref={
           popoverRef
         }
         style={{
           position:
             "fixed",

           top:
             menuPosition.top,

           right:
             menuPosition.right,
         }}
         className="z-[200] w-44 overflow-hidden rounded-xl border border-[#DED4C9] bg-white py-1 shadow-xl">

         <button
           type="button"
           onClick={
             openEditModal
           }
           className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[#302A25] transition hover:bg-[#F7F3EE]">

           Edit bottle
         </button>

         <button
           type="button"
           onClick={() => {
             void deleteBottle();
           }}
           disabled={
             deleting
           }
           className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">

           {deleting
             ? "Deleting..."
             : "Delete bottle"}
         </button>
       </div>,
       document.body
     )
   : null}
</div>





       

     {editOpen ? (
       <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8">
         <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
           <div className="flex items-start justify-between border-b border-[#E9E1D8] px-6 py-5">
             <div>
               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B6F58]">
                 Edit inventory bottle
               </p>

               <h2 className="mt-1 text-xl font-semibold text-[#26211D]">
                 {bottle.bottleCode}
               </h2>
             </div>





             <button
               type="button"
               aria-label="Close edit bottle"
               onClick={() => {
                 setEditOpen(
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
                   Manufacturer lot number
                 </span>

                 <input
                   type="text"
                   value={
                     manufacturerLotNumber
                   }
                   onChange={(
                     event
                   ) => {
                     setManufacturerLotNumber(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Expiration date
                 </span>

                 <input
                   type="date"
                   value={
                     expirationDate
                   }
                   onChange={(
                     event
                   ) => {
                     setExpirationDate(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Supplier
                 </span>

                 <input
                   type="text"
                   value={
                     supplier
                   }
                   onChange={(
                     event
                   ) => {
                     setSupplier(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Supplier order number
                 </span>

                 <input
                   type="text"
                   value={
                     supplierOrderNumber
                   }
                   onChange={(
                     event
                   ) => {
                     setSupplierOrderNumber(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Purchase date
                 </span>

                 <input
                   type="date"
                   value={
                     purchaseDate
                   }
                   onChange={(
                     event
                   ) => {
                     setPurchaseDate(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Bottle cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.01"
                   value={
                     bottleCost
                   }
                   onChange={(
                     event
                   ) => {
                     setBottleCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Allocated shipping cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.01"
                   value={
                     allocatedShippingCost
                   }
                   onChange={(
                     event
                   ) => {
                     setAllocatedShippingCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-[#302A25]">
                   Allocated tax cost
                 </span>

                 <input
                   type="number"
                   min="0"
                   step="0.01"
                   value={
                     allocatedTaxCost
                   }
                   onChange={(
                     event
                   ) => {
                     setAllocatedTaxCost(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block sm:col-span-2">
                 <span className="text-sm font-medium text-[#302A25]">
                   Storage location
                 </span>

                 <input
                   type="text"
                   value={
                     storageLocation
                   }
                   onChange={(
                     event
                   ) => {
                     setStorageLocation(
                       event.target.value
                     );
                   }}
                   className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                 />
               </label>

               <label className="block sm:col-span-2">
                 <span className="text-sm font-medium text-[#302A25]">
                   Notes
                 </span>

                 <textarea
                   value={
                     notes
                   }
                   onChange={(
                     event
                   ) => {
                     setNotes(
                       event.target.value
                     );
                   }}
                   className="mt-2 min-h-24 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
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
                   setEditOpen(
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
                   void saveBottle();
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
