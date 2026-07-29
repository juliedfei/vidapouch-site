import {
    cookies,
   } from "next/headers";
   
   import {
    NextResponse,
   } from "next/server";
   
   import {
    VidaPouchSalesMode,
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
   
   type RequestBody = {
    salesMode?:
      VidaPouchSalesMode;
   
    notes?:
      string |
      null;
   };
   
   const ALLOWED_SALES_MODES =
    new Set<VidaPouchSalesMode>([
      VidaPouchSalesMode.STRIPE,
      VidaPouchSalesMode.WAITLIST,
      VidaPouchSalesMode.PAUSED,
    ]);
   
   function normalizeOptionalText(
    value:
      string |
      null |
      undefined
   ) {
    const normalized =
      value?.trim();
   
    return normalized
      ? normalized
      : null;
   }
   
   async function requireAdminSession() {
    const cookieStore =
      await cookies();
   
    const token =
      cookieStore.get(
        ADMIN_SESSION_COOKIE
      )?.value;
   
    return verifyAdminSessionToken(
      token
    );
   }
   
   export async function GET() {
    const session =
      await requireAdminSession();
   
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
   
    const setting =
      await prisma
        .vidaPouchCommerceSetting
        .findFirst({
          orderBy: {
            createdAt:
              "asc",
          },
        });
   
    return NextResponse.json({
      salesMode:
        setting?.salesMode ??
        VidaPouchSalesMode.WAITLIST,
   
      notes:
        setting?.notes ??
        null,
   
      updatedAt:
        setting?.updatedAt ??
        null,
    });
   }
   
   export async function PATCH(
    request:
      Request
   ) {
    const session =
      await requireAdminSession();
   
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
   
    try {
      const body =
        await request.json() as
          RequestBody;
   
      const salesMode =
        body.salesMode;
   
      if (
        !salesMode ||
        !ALLOWED_SALES_MODES.has(
          salesMode
        )
      ) {
        return NextResponse.json(
          {
            error:
              "A valid sales mode is required.",
          },
          {
            status:
              400,
          }
        );
      }
   
      const existingSetting =
        await prisma
          .vidaPouchCommerceSetting
          .findFirst({
            orderBy: {
              createdAt:
                "asc",
            },
   
            select: {
              id:
                true,
            },
          });
   
      const notes =
        normalizeOptionalText(
          body.notes
        );
   
      const setting =
        existingSetting
          ? await prisma
              .vidaPouchCommerceSetting
              .update({
                where: {
                  id:
                    existingSetting.id,
                },
   
                data: {
                  salesMode,
   
                  notes,
   
                  updatedBy:
                    session.email,
                },
              })
          : await prisma
              .vidaPouchCommerceSetting
              .create({
                data: {
                  salesMode,
   
                  notes,
   
                  updatedBy:
                    session.email,
                },
              });
   
      return NextResponse.json({
        success:
          true,
   
        setting,
      });
    } catch (
      error
    ) {
      console.error(
        "Unable to update VidaPouch sales mode:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Unable to update the VidaPouch sales mode.",
        },
        {
          status:
            500,
        }
      );
    }
   }