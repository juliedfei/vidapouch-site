import {
    NextResponse,
   } from "next/server";
   
   import {
    VidaPouchWebhookStatus,
   } from "@/lib/generated/prisma/client";

   import {
    handleStripeWebhookEvent,
   } from "@/lib/stripe/handleStripeWebhookEvent";

   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    stripe,
   } from "@/lib/stripe";
   
   export const runtime =
    "nodejs";
   
   export const dynamic =
    "force-dynamic";
   
   export async function POST(
    request:
      Request
   ) {
    const webhookSecret =
      process.env
        .STRIPE_WEBHOOK_SECRET;
   
    if (
      !webhookSecret
    ) {
      console.error(
        "STRIPE_WEBHOOK_SECRET is not configured."
      );
   
      return NextResponse.json(
        {
          error:
            "Stripe webhook configuration is missing.",
        },
        {
          status:
            500,
        }
      );
    }
   
    const signature =
      request.headers.get(
        "stripe-signature"
      );
   
    if (
      !signature
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe signature is missing.",
        },
        {
          status:
            400,
        }
      );
    }
   
    /*
     * Stripe signature verification requires the
     * original raw request body. Do not call
     * request.json() before constructEvent().
     */
    const rawBody =
      await request.text();
   
    let event:
      ReturnType<
        typeof stripe.webhooks.constructEvent
   >;
   
    try {
      event =
        stripe.webhooks
          .constructEvent(
            rawBody,
            signature,
            webhookSecret
          );
    } catch (
      error
    ) {
      console.error(
        "Stripe webhook signature verification failed:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Invalid Stripe webhook signature.",
        },
        {
          status:
            400,
        }
      );
    }
   
    /*
     * Stripe can retry webhook deliveries.
     *
     * The unique stripeEventId prevents the same
     * event from being processed more than once.
     */
    const existingEvent =
      await prisma
        .vidaPouchWebhookEvent
        .findUnique({
          where: {
            stripeEventId:
              event.id,
          },
   
          select: {
            id:
              true,
   
            status:
              true,
          },
        });
   
    if (
      existingEvent?.status ===
        VidaPouchWebhookStatus.PROCESSED
    ) {
      return NextResponse.json(
        {
          received:
            true,
   
          duplicate:
            true,
        },
        {
          status:
            200,
        }
      );
    }
   
    const payload =
      JSON.parse(
        rawBody
      ) as object;
   
    await prisma
      .vidaPouchWebhookEvent
      .upsert({
        where: {
          stripeEventId:
            event.id,
        },
   
        create: {
          stripeEventId:
            event.id,
   
          eventType:
            event.type,
   
          status:
            VidaPouchWebhookStatus.PROCESSING,
   
          payload,
        },
   
        update: {
          eventType:
            event.type,
   
          status:
            VidaPouchWebhookStatus.PROCESSING,
   
          payload,
   
          processingAttempts: {
            increment:
              1,
          },
   
          lastError:
            null,
        },
      });
   




      try {
        await handleStripeWebhookEvent(
          event
        );
       
        await prisma
          .vidaPouchWebhookEvent
          .update({
            where: {
              stripeEventId:
                event.id,
            },
       
            data: {
              status:
                VidaPouchWebhookStatus.PROCESSED,
       
              processedAt:
                new Date(),
       
              lastError:
                null,
            },
          });
       
        return NextResponse.json(
          {
            received:
              true,
          },
          {
            status:
              200,
          }
        );
       } catch (
        error
       ) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(
                error
              );
       
        console.error(
          "Stripe webhook processing failed:",
          {
            stripeEventId:
              event.id,
       
            eventType:
              event.type,
       
            error:
              errorMessage,
          }
        );
       
        await prisma
          .vidaPouchWebhookEvent
          .update({
            where: {
              stripeEventId:
                event.id,
            },
       
            data: {
              status:
                VidaPouchWebhookStatus.FAILED,
       
              processedAt:
                null,
       
              lastError:
                errorMessage,
            },
          });
       
        return NextResponse.json(
          {
            error:
              "Stripe webhook processing failed.",
          },
          {
            /*
             * A 500 response tells Stripe that delivery
             * should be retried.
             */
            status:
              500,
          }
        );
       }





   }
   