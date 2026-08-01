const INITIAL_DELIVERY_LEAD_DAYS =
 7;

const SUPPLY_DAYS =
 30;

const SHIPPING_LEAD_DAYS =
 4;

function addDays(
 date:
   Date,
 days:
   number
) {
 const result =
   new Date(
     date
   );

 result.setUTCDate(
   result.getUTCDate() +
     days
 );

 return result;
}

export type SubscriptionFulfillmentTiming = {
 initialOrderDate:
   Date;



   initialTargetDeliveryDate:
   Date;
  
  initialShipByDate:
   Date;
  
  nextTargetDeliveryDate:
   Date;
  




 nextShipByDate:
   Date;
};

export type SubscriptionCycleTiming = {
 targetDeliveryDate:
   Date;

 shipByDate:
   Date;

 followingTargetDeliveryDate:
   Date;

 followingShipByDate:
   Date;
};

export function getSubscriptionFulfillmentTiming(
 initialOrderDate:
   Date = new Date()
): SubscriptionFulfillmentTiming {
 /*
  * The customer's first 30-day supply begins when
  * the initial VidaPouch is expected to arrive,
  * rather than on the checkout date.
  */
 const initialTargetDeliveryDate =
   addDays(
     initialOrderDate,
     INITIAL_DELIVERY_LEAD_DAYS
   );


   const initialShipByDate =
 addDays(
   initialTargetDeliveryDate,
   -SHIPPING_LEAD_DAYS
 );



 const nextTargetDeliveryDate =
   addDays(
     initialTargetDeliveryDate,
     SUPPLY_DAYS
   );

 const nextShipByDate =
   addDays(
     nextTargetDeliveryDate,
     -SHIPPING_LEAD_DAYS
   );




   return {
    initialOrderDate,
   
    initialTargetDeliveryDate,
   
    initialShipByDate,
   
    nextTargetDeliveryDate,
   
    nextShipByDate,
   };



}

/*
* A paid renewal uses the dates currently stored on
* the parent subscription order.
*
* Those dates represent the shipment that has just
* become due. After assigning them to the new billing
* cycle, the parent order advances to the following
* 30-day delivery window.
*/
export function getSubscriptionCycleTiming({
 currentTargetDeliveryDate,
 currentShipByDate,
 fallbackDate = new Date(),
}: {
 currentTargetDeliveryDate:
   Date | null;

 currentShipByDate:
   Date | null;

 fallbackDate?:
   Date;
}): SubscriptionCycleTiming {
 const targetDeliveryDate =
   currentTargetDeliveryDate ??
   addDays(
     fallbackDate,
     INITIAL_DELIVERY_LEAD_DAYS
   );

 const shipByDate =
   currentShipByDate ??
   addDays(
     targetDeliveryDate,
     -SHIPPING_LEAD_DAYS
   );

 const followingTargetDeliveryDate =
   addDays(
     targetDeliveryDate,
     SUPPLY_DAYS
   );

 const followingShipByDate =
   addDays(
     followingTargetDeliveryDate,
     -SHIPPING_LEAD_DAYS
   );

 return {
   targetDeliveryDate,

   shipByDate,

   followingTargetDeliveryDate,

   followingShipByDate,
 };
}
