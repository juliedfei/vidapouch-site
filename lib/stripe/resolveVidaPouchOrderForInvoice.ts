import "server-only";

import type Stripe from "stripe";

import {
 prisma,
} from "@/lib/db";

function getObjectId(
 value:
   string |
   {
     id:
       string;
   } |
   null |
   undefined
) {
 if (
   typeof value ===
     "string"
 ) {
   return value;
 }

 return value?.id ??
   null;
}

function getInvoiceSubscriptionId(
 invoice:
   Stripe.Invoice
) {
 const parentSubscriptionId =
   getObjectId(
     invoice.parent
       ?.subscription_details
       ?.subscription
   );

 if (
   parentSubscriptionId
 ) {
   return parentSubscriptionId;
 }

 /*
  * Defensive compatibility fallback for invoices
  * produced under older Stripe API versions.
  */
 const legacyInvoice =
   invoice as Stripe.Invoice & {
     subscription?:
       string |
       {
         id:
           string;
       } |
       null;
   };

 return getObjectId(
   legacyInvoice.subscription
 );
}

export async function resolveVidaPouchOrderForInvoice(
 invoice:
   Stripe.Invoice
) {
 /*
  * Checkout adds vidaPouchOrderId to the Stripe
  * subscription metadata. Stripe snapshots that
  * metadata onto subscription-generated invoices.
  */
 const metadataOrderId =
   invoice.parent
     ?.subscription_details
     ?.metadata
     ?.vidaPouchOrderId;

 if (
   metadataOrderId
 ) {
   const order =
     await prisma
       .vidaPouchOrder
       .findUnique({
         where: {
           id:
             metadataOrderId,
         },

         select: {
           id:
             true,

           stripeSubscriptionId:
             true,
         },
       });

   if (
     order
   ) {
     return {
       orderId:
         order.id,

       subscriptionId:
         order
           .stripeSubscriptionId ??
         getInvoiceSubscriptionId(
           invoice
         ),
     };
   }
 }

 const subscriptionId =
   getInvoiceSubscriptionId(
     invoice
   );

 if (
   !subscriptionId
 ) {
   return null;
 }

 const order =
   await prisma
     .vidaPouchOrder
     .findUnique({
       where: {
         stripeSubscriptionId:
           subscriptionId,
       },

       select: {
         id:
           true,
       },
     });

 if (
   !order
 ) {
   return null;
 }

 return {
   orderId:
     order.id,

   subscriptionId,
 };
}