import {
    cookies,
   } from "next/headers";
   
   import {
    NextResponse,
   } from "next/server";
   
   import {
    VidaPouchFulfillmentStatus,
   } from "@/lib/generated/prisma/client";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
   } from "@/lib/admin/adminSession";
   
   export const runtime =
    "nodejs";
   
   type RouteContext = {
    params:
      Promise<{
        orderId:
          string;
      }>;
   };
   
   type RequestBody = {
    fulfillmentStatus?:
      VidaPouchFulfillmentStatus;
   
    trackingNumber?:
      string |
      null;
   
    shippingCarrier?:
      string |
      null;
   
    fulfillmentNotes?:
      string |
      null;
   
    billingCycleId?:
      string |
      null;
   };
   
   const ALLOWED_STATUSES =
    new Set<VidaPouchFulfillmentStatus>([
      VidaPouchFulfillmentStatus.NEW,
      VidaPouchFulfillmentStatus.PREPARING,
      VidaPouchFulfillmentStatus.PACKED,
      VidaPouchFulfillmentStatus.SHIPPED,
      VidaPouchFulfillmentStatus.COMPLETED,
      VidaPouchFulfillmentStatus.ON_HOLD,
    ]);
   
   function normalizeOptionalText(
    value:
      string |
      null |
      undefined
   ) {
    const normalized =
      value
        ?.trim();
   
    return normalized
      ? normalized
      : null;
   }
   
   export async function PATCH(
    request:
      Request,
    context:
      RouteContext
   ) {
    try {
      const cookieStore =
        await cookies();
   
      const sessionToken =
        cookieStore.get(
          ADMIN_SESSION_COOKIE
        )?.value;
   
      const session =
        verifyAdminSessionToken(
          sessionToken
        );
   
      if (
        !session
      ) {
        return NextResponse.json(
          {
            error:
              "Administrator authentication is required.",
          },
          {
            status:
              401,
          }
        );
      }
   
      const {
        orderId,
      } =
        await context.params;
   
      const body =
        await request.json() as
          RequestBody;
   
      const fulfillmentStatus =
        body.fulfillmentStatus;
   
      if (
        !fulfillmentStatus ||
        !ALLOWED_STATUSES.has(
          fulfillmentStatus
        )
      ) {
        return NextResponse.json(
          {
            error:
              "A valid fulfillment status is required.",
          },
          {
            status:
              400,
          }
        );
      }
   
      const billingCycleId =
        typeof body.billingCycleId ===
          "string" &&
        body.billingCycleId.trim()
          ? body.billingCycleId.trim()
          : null;
   
      const currentTime =
        new Date();
   
      const statusTimestamps =
        fulfillmentStatus ===
          VidaPouchFulfillmentStatus.PREPARING
          ? {
              preparingAt:
                currentTime,
            }
          : fulfillmentStatus ===
              VidaPouchFulfillmentStatus.PACKED
            ? {
                packedAt:
                  currentTime,
              }
            : fulfillmentStatus ===
                VidaPouchFulfillmentStatus.SHIPPED
              ? {
                  shippedAt:
                    currentTime,
                }
              : fulfillmentStatus ===
                  VidaPouchFulfillmentStatus.COMPLETED
                ? {
                    completedAt:
                      currentTime,
                  }
                : fulfillmentStatus ===
                    VidaPouchFulfillmentStatus.ON_HOLD
                  ? {
                      onHoldAt:
                        currentTime,
                    }
                  : {};
   
      if (
        billingCycleId
      ) {
        const fulfillmentRun =
          await prisma
            .vidaPouchFulfillmentRun
            .findUnique({
              where: {
                billingCycleId,
              },
   
              select: {
                id:
                  true,
   
                orderId:
                  true,
              },
            });
   
        if (
          !fulfillmentRun ||
          fulfillmentRun.orderId !==
            orderId
        ) {
          return NextResponse.json(
            {
              error:
                "The renewal fulfillment was not found for this order.",
            },
            {
              status:
                404,
            }
          );
        }
   
        const updatedFulfillmentRun =
          await prisma
            .vidaPouchFulfillmentRun
            .update({
              where: {
                id:
                  fulfillmentRun.id,
              },
   
              data: {
                fulfillmentStatus,
   
                trackingNumber:
                  normalizeOptionalText(
                    body.trackingNumber
                  ),
   
                shippingCarrier:
                  normalizeOptionalText(
                    body.shippingCarrier
                  ),
   
                notes:
                  normalizeOptionalText(
                    body.fulfillmentNotes
                  ),
   
                ...statusTimestamps,
              },
   
              select: {
                id:
                  true,
   
                billingCycleId:
                  true,
   
                fulfillmentStatus:
                  true,
   
                trackingNumber:
                  true,
   
                shippingCarrier:
                  true,
   
                notes:
                  true,
   
                preparingAt:
                  true,
   
                packedAt:
                  true,
   
                shippedAt:
                  true,
   
                completedAt:
                  true,
   
                onHoldAt:
                  true,
   
                updatedAt:
                  true,
              },
            });
   
        return NextResponse.json({
          success:
            true,
   
          fulfillmentRun:
            updatedFulfillmentRun,
        });
      }
   
      const order =
        await prisma
          .vidaPouchOrder
          .update({
            where: {
              id:
                orderId,
            },
   
            data: {
              fulfillmentStatus,
   
              trackingNumber:
                normalizeOptionalText(
                  body.trackingNumber
                ),
   
              shippingCarrier:
                normalizeOptionalText(
                  body.shippingCarrier
                ),
   
              fulfillmentNotes:
                normalizeOptionalText(
                  body.fulfillmentNotes
                ),
   
              ...statusTimestamps,
            },
   
            select: {
              id:
                true,
   
              fulfillmentStatus:
                true,
   
              trackingNumber:
                true,
   
              shippingCarrier:
                true,
   
              fulfillmentNotes:
                true,
   
              preparingAt:
                true,
   
              packedAt:
                true,
   
              shippedAt:
                true,
   
              completedAt:
                true,
   
              onHoldAt:
                true,
   
              updatedAt:
                true,
            },
          });
   
      return NextResponse.json({
        success:
          true,
   
        order,
      });
    } catch (
      error
    ) {
      console.error(
        "Unable to update VidaPouch fulfillment:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Unable to update this order’s fulfillment information.",
        },
        {
          status:
            500,
        }
      );
    }
   }
   