import "server-only";

import type Stripe from "stripe";

import {
 VidaPouchOrderStatus,
} from "@/lib/generated/prisma/client";

import {
 prisma,
} from "@/lib/db";

import {
 resolveVidaPouchOrderForInvoice,
} from "@/lib/stripe/resolveVidaPouchOrderForInvoice";

function getStripeObjectId(
 value:
   | string
   | {
       id:
         string;
     }
   | null
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

async function handleCheckoutSessionCompleted(
 session:
   Stripe.Checkout.Session
) {
 const orderId =
   session.metadata
     ?.vidaPouchOrderId;

 if (
   !orderId
 ) {
   throw new Error(
     "Completed Stripe Checkout Session is missing the VidaPouch order ID."
   );
 }

 const paymentIntentId =
   getStripeObjectId(
     session.payment_intent
   );

 const subscriptionId =
   getStripeObjectId(
     session.subscription
   );

 const customerId =
   getStripeObjectId(
     session.customer
   );

 const customerDetails =
   session.customer_details;

 const shippingDetails =
   session
     .collected_information
     ?.shipping_details;

 await prisma
   .vidaPouchOrder
   .update({
     where: {
       id:
         orderId,
     },

     data: {
       status:
         VidaPouchOrderStatus.PAID,

       stripeCheckoutSessionId:
         session.id,

       stripePaymentIntentId:
         paymentIntentId,

       stripeSubscriptionId:
         subscriptionId,

       stripeCustomerId:
         customerId,

       customerEmail:
         customerDetails
           ?.email ??
         null,

       customerName:
         customerDetails
           ?.name ??
         null,

       customerPhone:
         customerDetails
           ?.phone ??
         null,

       shippingName:
         shippingDetails
           ?.name ??
         null,

       shippingAddress:
         shippingDetails
           ?.address
           ? {
               line1:
                 shippingDetails
                   .address
                   .line1,

               line2:
                 shippingDetails
                   .address
                   .line2,

               city:
                 shippingDetails
                   .address
                   .city,

               state:
                 shippingDetails
                   .address
                   .state,

               postalCode:
                 shippingDetails
                   .address
                   .postal_code,

               country:
                 shippingDetails
                   .address
                   .country,
             }
           : undefined,

       paidAt:
         new Date(),
     },
   });
}

async function handleInvoicePaid(
 invoice:
   Stripe.Invoice
) {
 const resolvedOrder =
   await resolveVidaPouchOrderForInvoice(
     invoice
   );

 if (
   !resolvedOrder
 ) {
   throw new Error(
     `No VidaPouch order could be resolved for invoice ${invoice.id}.`
   );
 }

 const orderId =
   resolvedOrder.orderId;

 /*
  * Newer Stripe API versions do not expose one
  * payment_intent directly on the Invoice because
  * an invoice may have multiple payments.
  */
 const paymentIntentId =
   null;

 const periodStart =
   invoice.period_start
     ? new Date(
         invoice.period_start *
           1000
       )
     : null;

 const periodEnd =
   invoice.period_end
     ? new Date(
         invoice.period_end *
           1000
       )
     : null;

 await prisma
   .vidaPouchBillingCycle
   .upsert({
     where: {
       stripeInvoiceId:
         invoice.id,
     },

     create: {
       orderId,

       stripeInvoiceId:
         invoice.id,

       stripePaymentIntentId:
         paymentIntentId,

       status:
         VidaPouchOrderStatus.PAID,

       amountPaid:
         invoice.amount_paid /
         100,

       currency:
         invoice.currency,

       billingReason:
         invoice.billing_reason,

       periodStart,

       periodEnd,

       paidAt:
         new Date(),
     },

     update: {
       stripePaymentIntentId:
         paymentIntentId,

       status:
         VidaPouchOrderStatus.PAID,

       amountPaid:
         invoice.amount_paid /
         100,

       currency:
         invoice.currency,

       billingReason:
         invoice.billing_reason,

       periodStart,

       periodEnd,

       paidAt:
         new Date(),

       failedAt:
         null,
     },
   });

 await prisma
   .vidaPouchOrder
   .update({
     where: {
       id:
         orderId,
     },

     data: {
       status:
         VidaPouchOrderStatus.PAID,
     },
   });
}

async function handleInvoicePaymentFailed(
 invoice:
   Stripe.Invoice
) {
 const resolvedOrder =
   await resolveVidaPouchOrderForInvoice(
     invoice
   );

 if (
   !resolvedOrder
 ) {
   throw new Error(
     `No VidaPouch order could be resolved for invoice ${invoice.id}.`
   );
 }

 const orderId =
   resolvedOrder.orderId;

 const periodStart =
   invoice.period_start
     ? new Date(
         invoice.period_start *
           1000
       )
     : null;

 const periodEnd =
   invoice.period_end
     ? new Date(
         invoice.period_end *
           1000
       )
     : null;

 await prisma
   .vidaPouchBillingCycle
   .upsert({
     where: {
       stripeInvoiceId:
         invoice.id,
     },

     create: {
       orderId,

       stripeInvoiceId:
         invoice.id,

       stripePaymentIntentId:
         null,

       status:
         VidaPouchOrderStatus
           .PAYMENT_FAILED,

       amountPaid:
         invoice.amount_paid /
         100,

       currency:
         invoice.currency,

       billingReason:
         invoice.billing_reason,

       periodStart,

       periodEnd,

       paidAt:
         null,

       failedAt:
         new Date(),
     },

     update: {
       status:
         VidaPouchOrderStatus
           .PAYMENT_FAILED,

       amountPaid:
         invoice.amount_paid /
         100,

       currency:
         invoice.currency,

       billingReason:
         invoice.billing_reason,

       periodStart,

       periodEnd,

       paidAt:
         null,

       failedAt:
         new Date(),
     },
   });

 await prisma
   .vidaPouchOrder
   .update({
     where: {
       id:
         orderId,
     },

     data: {
       status:
         VidaPouchOrderStatus
           .PAYMENT_FAILED,
     },
   });
}

async function handleSubscriptionUpdated(
    subscription:
      Stripe.Subscription
   ) {
    const cancellationReason =
      subscription
        .cancellation_details
        ?.reason ??
      null;
   
    const scheduledCancellationAt =
      subscription.cancel_at
        ? new Date(
            subscription.cancel_at *
              1000
          )
        : null;
   
    const cancellationScheduledAt =
      subscription
        .cancel_at_period_end
        ? new Date()
        : null;
   
    const result =
      await prisma
        .vidaPouchOrder
        .updateMany({
          where: {
            stripeSubscriptionId:
              subscription.id,
          },
   
          data: {
            cancelAtPeriodEnd:
              subscription
                .cancel_at_period_end,
   
            cancellationScheduledAt,
   
            scheduledCancellationAt,
   
            cancellationReason,
          },
        });
   
    if (
      result.count ===
        0
    ) {
      throw new Error(
        `No VidaPouch order was found for updated subscription ${subscription.id}.`
      );
    }
   }
   




async function handleSubscriptionDeleted(
 subscription:
   Stripe.Subscription
) {
 const result =
   await prisma
     .vidaPouchOrder
     .updateMany({
       where: {
         stripeSubscriptionId:
           subscription.id,
       },

       data: {
         status:
           VidaPouchOrderStatus.CANCELED,

         canceledAt:
           new Date(),
       },
     });

 if (
   result.count ===
     0
 ) {
   throw new Error(
     `No VidaPouch order was found for canceled subscription ${subscription.id}.`
   );
 }
}

/*
* Event routing belongs here rather than in the API
* route so webhook signature verification and order
* business logic remain separate.
*/
export async function handleStripeWebhookEvent(
 event:
   Stripe.Event
) {
 switch (
   event.type
 ) {
   case "checkout.session.completed":
     await handleCheckoutSessionCompleted(
       event.data.object
     );

     return;

   case "invoice.paid":
     await handleInvoicePaid(
       event.data.object
     );

     return;

   case "invoice.payment_failed":
     await handleInvoicePaymentFailed(
       event.data.object
     );

     return;

     case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object
        );
       
        return;



   case "customer.subscription.deleted":
     await handleSubscriptionDeleted(
       event.data.object
     );

     return;

   default:
     /*
      * Stripe sends many event types during normal
      * checkout and billing activity. Unhandled
      * events are accepted and recorded by the
      * webhook route.
      */
     return;
 }
}
