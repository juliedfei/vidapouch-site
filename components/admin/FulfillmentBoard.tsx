"use client";

import {
 useMemo,
 useState,
} from "react";

type FulfillmentStatus =
 | "NEW"
 | "PREPARING"
 | "PACKED"
 | "SHIPPED"
 | "COMPLETED"
 | "ON_HOLD";

type FulfillmentOrder = {
 id:
   string;

 customerName:
   string | null;

 customerEmail:
   string | null;

 planName:
   string;

 supplementCount:
   number;

 totalPrice:
   number;




   purchaseOption:
   "ONE_TIME" |
   "SUBSCRIPTION";
  
  paymentStatus:
   "PENDING" |
   "PAID" |
   "PAYMENT_FAILED" |
   "CANCELED" |
   "REFUNDED";
  
  fulfillmentStatus:
   FulfillmentStatus;




 trackingNumber:
   string | null;

 shippingCarrier:
   string | null;

 fulfillmentNotes:
   string | null;





   createdAt:
   string;
  
  inventoryReservationStatus:
   string | null;
  
  inventoryReserved:
   boolean;
  


  inventoryAllocationCount:
   number;
  
  inventoryCost:
   number;
  
inventoryAllocations:
 {
   id:
     string;

   orderItemId:
     string;

   productName:
     string;

   brand:
     string;

   unitLabel:
     string;

   bottleCode:
     string;

   manufacturerLotNumber:
     string | null;

   expirationDate:
     string | null;

   quantity:
     number;

   totalCost:
     number;
 }[];




   items:
   {
     id:
       string;
  
     productName:
       string;
  
     brand:
       string;
  
     timing:
       string;
  
     monthlyUnitCount:
       number;
  
     unitLabel:
       string;
   }[];
  





};

type Props = {
 initialOrders:
   FulfillmentOrder[];
};

const STATUS_OPTIONS:
 {
   value:
     FulfillmentStatus;

   label:
     string;
 }[] = [
   {
     value:
       "NEW",

     label:
       "New",
   },
   {
     value:
       "PREPARING",

     label:
       "Preparing",
   },
   {
     value:
       "PACKED",

     label:
       "Packed",
   },
   {
     value:
       "SHIPPED",

     label:
       "Shipped",
   },
   {
     value:
       "COMPLETED",

     label:
       "Completed",
   },
   {
     value:
       "ON_HOLD",

     label:
       "On hold",
   },
 ];

function formatMoney(
 value:
   number
) {
 return new Intl.NumberFormat(
   "en-US",
   {
     style:
       "currency",

     currency:
       "USD",
   }
 ).format(
   value
 );
}

function formatDate(
 value:
   string
) {
 return new Intl.DateTimeFormat(
   "en-US",
   {
     dateStyle:
       "medium",
   }
 ).format(
   new Date(
     value
   )
 );
}

function getStatusLabel(
 status:
   FulfillmentStatus
) {
 return STATUS_OPTIONS.find(
   (
     option
   ) =>
     option.value ===
     status
 )?.label ??
   status;
}





function getStatusClasses(
    status:
      FulfillmentStatus
   ) {
    switch (
      status
    ) {
      case "NEW":
        return "bg-blue-100 text-blue-800";
   
      case "PREPARING":
        return "bg-amber-100 text-amber-800";
   
      case "PACKED":
        return "bg-purple-100 text-purple-800";
   
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
   
      case "COMPLETED":
        return "bg-green-100 text-green-800";
   
      case "ON_HOLD":
        return "bg-red-100 text-red-800";
    }
   }






export default function FulfillmentBoard({
 initialOrders,
}: Props) {
 const [
   orders,
   setOrders,
 ] = useState(
   initialOrders
 );




 const [
   savingOrderId,
   setSavingOrderId,
 ] = useState<
   string |
   null
>(null);


const [
    reservingOrderId,
    setReservingOrderId,
   ] = useState<
    string |
    null
   >(null);




 const [
   error,
   setError,
 ] = useState<
   string |
   null
>(null);

 const counts =
   useMemo(
     () => {
       return STATUS_OPTIONS.reduce(
         (
           result,
           option
         ) => {
           result[
             option.value
           ] =
             orders.filter(
               (
                 order
               ) =>
                 order
                   .fulfillmentStatus ===
                 option.value
             ).length;

           return result;
         },
         {} as Record<
           FulfillmentStatus,
           number
>
       );
     },
     [
       orders,
     ]
   );

 function updateLocalOrder(
   orderId:
     string,
   updates:
     Partial<FulfillmentOrder>
 ) {
   setOrders(
     (
       currentOrders
     ) =>
       currentOrders.map(
         (
           order
         ) =>
           order.id ===
           orderId
             ? {
                 ...order,
                 ...updates,
               }
             : order
       )
   );
 }




 async function saveOrder(
   order:
     FulfillmentOrder
 ) {
   setError(
     null
   );

   setSavingOrderId(
     order.id
   );

   try {
     const response =
       await fetch(
         `/api/admin/orders/${order.id}/fulfillment`,
         {
           method:
             "PATCH",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               fulfillmentStatus:
                 order
                   .fulfillmentStatus,

               trackingNumber:
                 order
                   .trackingNumber,

               shippingCarrier:
                 order
                   .shippingCarrier,

               fulfillmentNotes:
                 order
                   .fulfillmentNotes,
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
         "Unable to save fulfillment changes."
       );
     }
   } catch (
     caughtError
   ) {
     setError(
       caughtError instanceof Error
         ? caughtError.message
         : "Unable to save fulfillment changes."
     );
   } finally {
     setSavingOrderId(
       null
     );
   }
 }


 async function reserveInventory(
    order:
      FulfillmentOrder
   ) {
    setError(
      null
    );
   
    setReservingOrderId(
      order.id
    );
   
    try {
      const response =
        await fetch(
          "/api/admin/inventory/reserve",
          {
            method:
              "POST",
   
            headers: {
              "Content-Type":
                "application/json",
            },
   
            body:
              JSON.stringify({
                orderId:
                  order.id,
              }),
          }
        );
   
      const data =
        await response.json() as {
          success?:
            boolean;
   
          error?:
            string;
   
          fulfillmentRun?: {
            status?:
              string;
   
            allocations?: {
              totalCostSnapshot?:
                string | number;
            }[];
          };
        };
   
      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
          "Unable to reserve inventory."
        );
      }
   
      const allocations =
        data.fulfillmentRun
          ?.allocations ??
        [];
   
      const inventoryCost =
        allocations.reduce(
          (
            total,
            allocation
          ) =>
            total +
            Number(
              allocation.totalCostSnapshot ??
              0
            ),
          0
        );
   
      updateLocalOrder(
        order.id,
        {
          inventoryReservationStatus:
            data.fulfillmentRun?.status ??
            "INVENTORY_RESERVED",
   
          inventoryReserved:
            true,
   
          inventoryAllocationCount:
            allocations.length,
   
          inventoryCost,
        }
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reserve inventory."
      );
    } finally {
      setReservingOrderId(
        null
      );
    }
   }
   






 return (
   <div>
     {error ? (
       <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
         {error}
       </div>
     ) : null}

     <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
       {STATUS_OPTIONS.map(
         (
           option
         ) => (
           <div
             key={
               option.value
             }
             className="rounded-2xl border border-[#DED4C9] bg-white p-5">

             <p className="text-sm text-[#665C54]">
               {option.label}
             </p>

             <p className="mt-2 text-3xl font-semibold text-[#26211D]">
               {counts[
                 option.value
               ]}
             </p>
           </div>
         )
       )}
     </section>

     <section className="mt-8 grid items-start gap-6 xl:grid-cols-3">
       {STATUS_OPTIONS.map(
         (
           statusOption
         ) => {
           const matchingOrders =
             orders.filter(
               (
                 order
               ) =>
                 order
                   .fulfillmentStatus ===
                 statusOption.value
             );

           return (
             <div
               key={
                 statusOption.value
               }
               className="rounded-3xl border border-[#DED4C9] bg-[#EFE8E0] p-4">

               <div className="flex items-center justify-between px-1">
                 <h2 className="font-semibold text-[#26211D]">
                   {statusOption.label}
                 </h2>

                 <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#665C54]">
                   {matchingOrders.length}
                 </span>
               </div>

               <div className="mt-4 space-y-4">
                 {matchingOrders.length ===
                 0 ? (
                   <div className="rounded-2xl border border-dashed border-[#CFC3B7] bg-white/60 p-6 text-center text-sm text-[#766B62]">
                     No orders
                   </div>
                 ) : (
                   matchingOrders.map(
                     (
                       order
                     ) => (
                       <article
                         key={
                           order.id
                         }
                         className="rounded-2xl border border-[#DED4C9] bg-white p-5 shadow-sm">

                         <div className="flex items-start justify-between gap-4">
                           <div>
                             <h3 className="font-semibold text-[#26211D]">
                               {order.customerName ??
                                 "Customer name unavailable"}
                             </h3>

                             <p className="mt-1 text-sm text-[#665C54]">
                               {order.customerEmail ??
                                 "No email"}
                             </p>
                           </div>

                           <span
                             className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                               order.fulfillmentStatus
                             )}`}>

                             {getStatusLabel(
                               order.fulfillmentStatus
                             )}
                           </span>
                         </div>


                         <div className="mt-4 flex items-center gap-2">
 <span className="text-xs font-medium text-[#766B62]">
   Payment:
 </span>

 <span
   className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
     order.paymentStatus ===
     "PAID"
       ? "bg-green-100 text-green-800"
       : order.paymentStatus ===
         "PAYMENT_FAILED"
         ? "bg-red-100 text-red-800"
         : "bg-gray-100 text-gray-700"
   }`}>

   {order.paymentStatus.replaceAll(
     "_",
     " "
   )}
 </span>
</div>



                         <div className="mt-4 grid grid-cols-2 gap-3 text-sm">




                           <div>
                             <p className="text-[#766B62]">
                               Plan
                             </p>

                             <p className="mt-1 font-medium text-[#26211D]">
                               {order.planName}
                             </p>
                           </div>

                           <div>
                             <p className="text-[#766B62]">
                               Total
                             </p>

                             <p className="mt-1 font-medium text-[#26211D]">
                               {formatMoney(
                                 order.totalPrice
                               )}
                             </p>
                           </div>

                           <div>
                             <p className="text-[#766B62]">
                               Supplements
                             </p>

                             <p className="mt-1 font-medium text-[#26211D]">
                               {order.supplementCount}
                             </p>
                           </div>

                           <div>
                             <p className="text-[#766B62]">
                               Ordered
                             </p>

                             <p className="mt-1 font-medium text-[#26211D]">
                               {formatDate(
                                 order.createdAt
                               )}
                             </p>
                           </div>
                         </div>



                         <div className="mt-4 rounded-xl bg-[#F8F5F1] p-3">
                           <p className="text-xs font-semibold uppercase tracking-wide text-[#766B62]">
                             Routine
                           </p>




                           <div className="mt-2 space-y-1">
                             
                             
                             


                           {order.items.map(
 (
   item
 ) => {
   const itemAllocations =
     order.inventoryAllocations.filter(
       (
         allocation
       ) =>
         allocation.orderItemId ===
         item.id
     );

   return (
     <div
       key={
         item.id
       }
       className="rounded-xl border border-[#E7DED5] bg-white/70 p-3">

       <p className="text-sm font-medium text-[#302A25]">
         {item.productName} ·{" "}
         {item.timing}
       </p>

       <p className="mt-0.5 text-xs text-[#766B62]">
         {item.monthlyUnitCount}{" "}
         {item.unitLabel}
         {item.monthlyUnitCount ===
         1
           ? ""
           : "s"}{" "}
         for this fulfillment
       </p>

       {itemAllocations.length >
       0 ? (
         <div className="mt-3 space-y-2">
           {itemAllocations.map(
             (
               allocation
             ) => (
               <div
                 key={
                   allocation.id
                 }
                 className="rounded-lg bg-[#F7F3EE] px-3 py-2 text-xs text-[#665C54]">

                 <div className="flex flex-wrap items-center justify-between gap-2">
                   <span className="font-medium text-[#302A25]">
                     {
                       allocation.bottleCode
                     }
                   </span>

                   <span>
                     {
                       allocation.quantity
                     }{" "}
                     {
                       allocation.unitLabel
                     }
                     {allocation.quantity ===
                     1
                       ? ""
                       : "s"}
                   </span>
                 </div>

                 {allocation.manufacturerLotNumber ? (
                   <p className="mt-1">
                     Lot:{" "}
                     {
                       allocation.manufacturerLotNumber
                     }
                   </p>
                 ) : null}

                 {allocation.expirationDate ? (
                   <p className="mt-1">
                     Expires:{" "}
                     {new Date(
                       allocation.expirationDate
                     ).toLocaleDateString()}
                   </p>
                 ) : null}

                 <p className="mt-1">
                   Cost: $
                   {allocation.totalCost.toFixed(
                     2
                   )}
                 </p>
               </div>
             )
           )}
         </div>
       ) : order.inventoryReserved ? (
         <p className="mt-2 text-xs text-[#9A6B47]">
           No bottle allocation found for this item.
         </p>
       ) : null}
     </div>
   );
 }
)}





                           </div>
                         </div>


<div className="mt-4 rounded-xl border border-[#E5DCD2] bg-[#FCFAF7] p-3">
 <div className="flex items-start justify-between gap-3">
   <div>
     <p className="text-xs font-semibold uppercase tracking-wide text-[#766B62]">
       Inventory
     </p>

     {order.inventoryReserved ? (
       <div className="mt-2">
         <p className="text-sm font-semibold text-green-800">
           Inventory reserved
         </p>

         <p className="mt-1 text-xs leading-5 text-[#665C54]">
           {order.inventoryAllocationCount}{" "}
           {order.inventoryAllocationCount ===
           1
             ? "bottle allocation"
             : "bottle allocations"}
           {" · "}
           {formatMoney(
             order.inventoryCost
           )} supplement cost
         </p>
       </div>
     ) : (
       <p className="mt-2 text-sm text-[#665C54]">
         Inventory has not been reserved for this order yet.
       </p>
     )}
   </div>
 </div>

 {!order.inventoryReserved ? (
   <button
     type="button"
     disabled={
       reservingOrderId ===
       order.id
     }
     onClick={() => {
       void reserveInventory(
         order
       );
     }}
     className="mt-3 w-full rounded-full border border-[#7D0E1C] bg-white px-4 py-2.5 text-sm font-semibold text-[#7D0E1C] transition hover:bg-[#FFF8F6] disabled:cursor-not-allowed disabled:opacity-60">

     {reservingOrderId ===
     order.id
       ? "Reserving inventory..."
       : "Reserve inventory"}
   </button>
 ) : null}
</div>






                         <label className="mt-4 block text-sm font-medium text-[#302A25]">
                           Fulfillment status
                         </label>

                         <select
                           value={
                             order.fulfillmentStatus
                           }
                           onChange={(
                             event
                           ) => {
                             updateLocalOrder(
                               order.id,
                               {
                                 fulfillmentStatus:
                                   event.target.value as
                                     FulfillmentStatus,
                               }
                             );
                           }}
                           className="mt-2 w-full rounded-xl border border-[#CFC3B7] bg-white px-3 py-2.5 text-sm text-[#26211D]">

                           {STATUS_OPTIONS.map(
                             (
                               option
                             ) => (
                               <option
                                 key={
                                   option.value
                                 }
                                 value={
                                   option.value
                                 }>

                                 {option.label}
                               </option>
                             )
                           )}
                         </select>

                         <div className="mt-4 grid gap-3 sm:grid-cols-2">
                           <input
                             type="text"
                             value={
                               order.shippingCarrier ??
                               ""
                             }
                             onChange={(
                               event
                             ) => {
                               updateLocalOrder(
                                 order.id,
                                 {
                                   shippingCarrier:
                                     event.target.value,
                                 }
                               );
                             }}
                             className="rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                             placeholder="Carrier"
                           />

                           <input
                             type="text"
                             value={
                               order.trackingNumber ??
                               ""
                             }
                             onChange={(
                               event
                             ) => {
                               updateLocalOrder(
                                 order.id,
                                 {
                                   trackingNumber:
                                     event.target.value,
                                 }
                               );
                             }}
                             className="rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                             placeholder="Tracking number"
                           />
                         </div>

                         <textarea
                           value={
                             order.fulfillmentNotes ??
                             ""
                           }
                           onChange={(
                             event
                           ) => {
                             updateLocalOrder(
                               order.id,
                               {
                                 fulfillmentNotes:
                                   event.target.value,
                               }
                             );
                           }}
                           className="mt-3 min-h-24 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                           placeholder="Fulfillment notes"
                         />

                         <button
                           type="button"
                           disabled={
                             savingOrderId ===
                             order.id
                           }
                           onClick={() => {
                             void saveOrder(
                               order
                             );
                           }}
                           className="mt-4 w-full rounded-full bg-[#26211D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#40372F] disabled:cursor-not-allowed disabled:opacity-60">

                           {savingOrderId ===
                           order.id
                             ? "Saving..."
                             : "Save fulfillment"}
                         </button>
                       </article>
                     )
                   )
                 )}
               </div>
             </div>
           );
         }
       )}
     </section>
   </div>
 );
}
