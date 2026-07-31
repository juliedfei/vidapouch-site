"use client";

import {
 useState,
} from "react";

import {
 useRouter,
} from "next/navigation";

type ReceiveInventoryResponse = {
 success?:
   boolean;

 error?:
   string;

 bottle?: {
   bottleCode?:
     string;
 };
};

export default function InventoryReceiveForm() {
 const router =
   useRouter();

 const [
   productName,
   setProductName,
 ] =
   useState(
     ""
   );

 const [
   brand,
   setBrand,
 ] =
   useState(
     ""
   );

 const [
   dosage,
   setDosage,
 ] =
   useState(
     ""
   );

 const [
   form,
   setForm,
 ] =
   useState(
     ""
   );

 const [
   unitLabel,
   setUnitLabel,
 ] =
   useState(
     "capsule"
   );

 const [
   manufacturerLotNumber,
   setManufacturerLotNumber,
 ] =
   useState(
     ""
   );

 const [
   expirationDate,
   setExpirationDate,
 ] =
   useState(
     ""
   );

 const [
   supplier,
   setSupplier,
 ] =
   useState(
     ""
   );

 const [
   supplierOrderNumber,
   setSupplierOrderNumber,
 ] =
   useState(
     ""
   );

 const [
   purchaseDate,
   setPurchaseDate,
 ] =
   useState(
     ""
   );

 const [
   bottleCost,
   setBottleCost,
 ] =
   useState(
     ""
   );

 const [
   allocatedShippingCost,
   setAllocatedShippingCost,
 ] =
   useState(
     ""
   );

 const [
   allocatedTaxCost,
   setAllocatedTaxCost,
 ] =
   useState(
     ""
   );

 const [
   originalUnitCount,
   setOriginalUnitCount,
 ] =
   useState(
     ""
   );

 const [
   storageLocation,
   setStorageLocation,
 ] =
   useState(
     ""
   );

 const [
   notes,
   setNotes,
 ] =
   useState(
     ""
   );

 const [
   submitting,
   setSubmitting,
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

 const [
   successMessage,
   setSuccessMessage,
 ] =
   useState<string | null>(
     null
   );

 async function handleSubmit() {
   setError(
     null
   );

   setSuccessMessage(
     null
   );

   if (
     !productName.trim() ||
     !brand.trim() ||
     !unitLabel.trim() ||
     !bottleCost.trim() ||
     !originalUnitCount.trim()
   ) {
     setError(
       "Product name, brand, unit label, bottle cost, and unit count are required."
     );

     return;
   }

   setSubmitting(
     true
   );

   try {
     const response =
       await fetch(
         "/api/admin/inventory/receive",
         {
           method:
             "POST",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               productName,
               brand,
               dosage,
               form,
               unitLabel,
               manufacturerLotNumber,
               expirationDate,
               supplier,
               supplierOrderNumber,
               purchaseDate,
               bottleCost,
               allocatedShippingCost,
               allocatedTaxCost,
               originalUnitCount,
               storageLocation,
               notes,
             }),
         }
       );

     const data =
       await response.json() as ReceiveInventoryResponse;

     if (
       !response.ok ||
       !data.success
     ) {
       throw new Error(
         data.error ??
         "Unable to receive inventory."
       );
     }

     setSuccessMessage(
       data.bottle?.bottleCode
         ? `Bottle ${data.bottle.bottleCode} was received successfully.`
         : "Bottle was received successfully."
     );

     setProductName(
       ""
     );

     setBrand(
       ""
     );

     setDosage(
       ""
     );

     setForm(
       ""
     );

     setUnitLabel(
       "capsule"
     );

     setManufacturerLotNumber(
       ""
     );

     setExpirationDate(
       ""
     );

     setSupplier(
       ""
     );

     setSupplierOrderNumber(
       ""
     );

     setPurchaseDate(
       ""
     );

     setBottleCost(
       ""
     );

     setAllocatedShippingCost(
       ""
     );

     setAllocatedTaxCost(
       ""
     );

     setOriginalUnitCount(
       ""
     );

     setStorageLocation(
       ""
     );

     setNotes(
       ""
     );

     router.refresh();
   } catch (
     error
   ) {
     setError(
       error instanceof Error
         ? error.message
         : "Unable to receive inventory."
     );
   } finally {
     setSubmitting(
       false
     );
   }
 }

 return (
   <section className="rounded-3xl border border-[#DED4C9] bg-white p-6 shadow-sm">
     <div>
       <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8B6F58]">
         Receive inventory
       </p>

       <h2 className="mt-2 text-xl font-semibold text-[#26211D]">
         Add a bottle
       </h2>

       <p className="mt-2 text-sm leading-6 text-[#665C54]">
         Record the exact bottle you received, including its manufacturer lot number, expiration date, cost, and usable unit count.
       </p>
     </div>

     <div className="mt-6 grid gap-4 md:grid-cols-2">
       <div>
         <label
           htmlFor="inventory-product-name"
           className="block text-sm font-semibold text-[#302A26]">

           Product name *
         </label>

         <input
           id="inventory-product-name"
           type="text"
           value={
             productName
           }
           onChange={(
             event
           ) => {
             setProductName(
               event.target.value
             );
           }}
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="Magnesium Bisglycinate"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-brand"
           className="block text-sm font-semibold text-[#302A26]">

           Brand *
         </label>

         <input
           id="inventory-brand"
           type="text"
           value={
             brand
           }
           onChange={(
             event
           ) => {
             setBrand(
               event.target.value
             );
           }}
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="Thorne"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-dosage"
           className="block text-sm font-semibold text-[#302A26]">

           Dosage
         </label>

         <input
           id="inventory-dosage"
           type="text"
           value={
             dosage
           }
           onChange={(
             event
           ) => {
             setDosage(
               event.target.value
             );
           }}
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="200 mg"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-form"
           className="block text-sm font-semibold text-[#302A26]">

           Form
         </label>

         <select
           id="inventory-form"
           value={
             form
           }
           onChange={(
             event
           ) => {
             setForm(
               event.target.value
             );
           }}
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] bg-white px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]">

           <option value="">
             Select form
           </option>

           <option value="capsule">
             Capsule
           </option>

           <option value="tablet">
             Tablet
           </option>

           <option value="softgel">
             Softgel
           </option>

           <option value="caplet">
             Caplet
           </option>

           <option value="other">
             Other
           </option>
         </select>
       </div>

       <div>
         <label
           htmlFor="inventory-unit-label"
           className="block text-sm font-semibold text-[#302A26]">

           Unit label *
         </label>

         <select
           id="inventory-unit-label"
           value={
             unitLabel
           }
           onChange={(
             event
           ) => {
             setUnitLabel(
               event.target.value
             );
           }}
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] bg-white px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]">

           <option value="capsule">
             Capsule
           </option>

           <option value="tablet">
             Tablet
           </option>

           <option value="softgel">
             Softgel
           </option>

           <option value="caplet">
             Caplet
           </option>

           <option value="serving">
             Serving
           </option>

           <option value="unit">
             Unit
           </option>
         </select>
       </div>

       <div>
         <label
           htmlFor="inventory-unit-count"
           className="block text-sm font-semibold text-[#302A26]">

           Usable units in bottle *
         </label>

         <input
           id="inventory-unit-count"
           type="number"
           min="0.01"
           step="0.01"
           value={
             originalUnitCount
           }
           onChange={(
             event
           ) => {
             setOriginalUnitCount(
               event.target.value
             );
           }}
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="90"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-lot"
           className="block text-sm font-semibold text-[#302A26]">

           Manufacturer lot number
         </label>

         <input
           id="inventory-lot"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="LOT12345"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-expiration"
           className="block text-sm font-semibold text-[#302A26]">

           Expiration date
         </label>

         <input
           id="inventory-expiration"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-supplier"
           className="block text-sm font-semibold text-[#302A26]">

           Supplier / retailer
         </label>

         <input
           id="inventory-supplier"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="Amazon"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-order-number"
           className="block text-sm font-semibold text-[#302A26]">

           Supplier order number
         </label>

         <input
           id="inventory-order-number"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="Order #123456"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-purchase-date"
           className="block text-sm font-semibold text-[#302A26]">

           Purchase date
         </label>

         <input
           id="inventory-purchase-date"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-bottle-cost"
           className="block text-sm font-semibold text-[#302A26]">

           Bottle cost *
         </label>

         <input
           id="inventory-bottle-cost"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="28.00"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-shipping-cost"
           className="block text-sm font-semibold text-[#302A26]">

           Shipping allocated to bottle
         </label>

         <input
           id="inventory-shipping-cost"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="0.00"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-tax-cost"
           className="block text-sm font-semibold text-[#302A26]">

           Tax allocated to bottle
         </label>

         <input
           id="inventory-tax-cost"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="0.00"
         />
       </div>

       <div>
         <label
           htmlFor="inventory-storage-location"
           className="block text-sm font-semibold text-[#302A26]">

           Storage location
         </label>

         <input
           id="inventory-storage-location"
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
           className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
           placeholder="Shelf A1"
         />
       </div>
     </div>

     <div className="mt-4">
       <label
         htmlFor="inventory-notes"
         className="block text-sm font-semibold text-[#302A26]">

         Notes
       </label>

       <textarea
         id="inventory-notes"
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
         rows={
           3
         }
         className="mt-1.5 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm text-[#302A26] outline-none focus:border-[#7D0E1C]"
         placeholder="Optional internal notes"
       />
     </div>

     {error ? (
       <p
         role="alert"
         className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">

         {error}
       </p>
     ) : null}

     {successMessage ? (
       <p
         role="status"
         className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">

         {successMessage}
       </p>
     ) : null}

     <button
       type="button"
       disabled={
         submitting
       }
       onClick={() => {
         void handleSubmit();
       }}
       className="mt-6 min-h-11 rounded-xl bg-[#7D0E1C] px-6 text-sm font-semibold text-white transition hover:bg-[#65101A] disabled:cursor-not-allowed disabled:bg-[#B7AAA6]">

       {submitting
         ? "Receiving bottle…"
         : "Receive bottle"}
     </button>
   </section>
 );
}