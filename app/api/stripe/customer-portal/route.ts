import {
    NextResponse,
   } from "next/server";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    stripe,
   } from "@/lib/stripe";
   
   export const runtime =
    "nodejs";
   
   type RequestBody = {
    email?:
      string;
   };
   
   export async function POST(
    request:
      Request
   ) {
    try {
      const body =
        await request.json() as
          RequestBody;
   
      const email =
        body.email
          ?.trim()
          .toLowerCase();
   
      if (
        !email
      ) {
        return NextResponse.json(
          {
            error:
              "Please enter the email address used for your VidaPouch subscription.",
          },
          {
            status:
              400,
          }
        );
      }
   
      const order =
        await prisma
          .vidaPouchOrder
          .findFirst({
            where: {
              customerEmail: {
                equals:
                  email,
   
                mode:
                  "insensitive",
              },
   
              stripeCustomerId: {
                not:
                  null,
              },
   
              stripeSubscriptionId: {
                not:
                  null,
              },
            },
   
            orderBy: {
              createdAt:
                "desc",
            },
   
            select: {
              stripeCustomerId:
                true,
            },
          });
   
      if (
        !order
          ?.stripeCustomerId
      ) {
        return NextResponse.json(
          {
            error:
              "We could not find an active VidaPouch subscription for that email address.",
          },
          {
            status:
              404,
          }
        );
      }
   
      const origin =
        new URL(
          request.url
        ).origin;
   
      const portalSession =
        await stripe
          .billingPortal
          .sessions
          .create({
            customer:
              order.stripeCustomerId,
   
            return_url:
              `${origin}/`,
          });
   
      return NextResponse.json({
        url:
          portalSession.url,
      });
    } catch (
      error
    ) {
      console.error(
        "Unable to create Stripe Customer Portal session:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "We could not open subscription management. Please try again.",
        },
        {
          status:
            500,
        }
      );
    }
   }
   