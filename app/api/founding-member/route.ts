import {
    NextRequest,
    NextResponse,
   } from "next/server";
   
   import {
    VidaPouchSalesMode,
    VidaPouchWaitlistSource,
   } from "@/lib/generated/prisma/client";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    getVidaPouchSalesMode,
   } from "@/lib/commerce/getVidaPouchSalesMode";
   
   export const runtime = "nodejs";
   export const dynamic = "force-dynamic";
   
   type FoundingMemberRequestBody = {
    customerName?: unknown;
    customerEmail?: unknown;
    customerPhone?: unknown;
   };
   
   const MAX_NAME_LENGTH = 100;
   const MAX_EMAIL_LENGTH = 254;
   const MAX_PHONE_LENGTH = 30;
   
   function normalizeOptionalText(
    value: unknown,
    maximumLength: number
   ) {
    if (typeof value !== "string") {
      return null;
    }
   
    const normalized = value.trim();
   
    if (
      normalized.length === 0 ||
      normalized.length > maximumLength
    ) {
      return null;
    }
   
    return normalized;
   }
   
   function normalizeEmail(
    value: unknown
   ) {
    if (typeof value !== "string") {
      return null;
    }
   
    const normalized = value
      .trim()
      .toLowerCase();
   
    if (
      normalized.length === 0 ||
      normalized.length > MAX_EMAIL_LENGTH
    ) {
      return null;
    }
   
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   
    return emailPattern.test(normalized)
      ? normalized
      : null;
   }
   
   export async function POST(
    request: NextRequest
   ) {
    try {
      const salesMode =
        await getVidaPouchSalesMode();
   




        if (
            salesMode ===
            VidaPouchSalesMode.PAUSED
           ) {
            return NextResponse.json(
              {
                error:
                  "New VidaPouch requests are temporarily paused.",
           
                salesMode,
              },
              {
                status: 409,
              }
            );
           }






   
      let body: FoundingMemberRequestBody;
   
      try {
        body =
          (await request.json()) as
            FoundingMemberRequestBody;
      } catch {
        return NextResponse.json(
          {
            error:
              "The Founding Member request is not valid.",
          },
          {
            status: 400,
          }
        );
      }
   
      const customerEmail =
        normalizeEmail(
          body.customerEmail
        );
   
      if (customerEmail === null) {
        return NextResponse.json(
          {
            error:
              "Please enter a valid email address.",
          },
          {
            status: 400,
          }
        );
      }
   
      const customerName =
        normalizeOptionalText(
          body.customerName,
          MAX_NAME_LENGTH
        );
   
      const customerPhone =
        normalizeOptionalText(
          body.customerPhone,
          MAX_PHONE_LENGTH
        );
   
      const existingEntry =
        await prisma
          .vidaPouchWaitlistEntry
          .findFirst({
            where: {
              customerEmail,
            },
   
            orderBy: {
              createdAt: "desc",
            },
          });
   
      if (existingEntry) {
        if (
          existingEntry.source ===
          VidaPouchWaitlistSource.VIDAPOUCH
        ) {
          await prisma
            .vidaPouchWaitlistEntry
            .update({
              where: {
                id: existingEntry.id,
              },
   
              data: {
                customerName:
                  customerName ??
                  existingEntry.customerName,
   
                customerPhone:
                  customerPhone ??
                  existingEntry.customerPhone,
              },
            });
        }
   
        return NextResponse.json(
          {
            success: true,
            alreadyRegistered: true,
            waitlistEntryId:
              existingEntry.id,
          },
          {
            status: 200,
   
            headers: {
              "Cache-Control":
                "private, no-store, max-age=0",
            },
          }
        );
      }
   
      const entry =
        await prisma
          .vidaPouchWaitlistEntry
          .create({
            data: {
              source:
                VidaPouchWaitlistSource.VIDAPOUCH,
   
              customerEmail,
              customerName,
              customerPhone,
            },
   
            select: {
              id: true,
            },
          });
   
      return NextResponse.json(
        {
          success: true,
          alreadyRegistered: false,
          waitlistEntryId: entry.id,
        },
        {
          status: 201,
   
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        }
      );
    } catch (error) {
      console.error(
        "Unable to register VidaPouch Founding Member:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Unable to register right now. Please try again or contact the VidaPouch Concierge.",
        },
        {
          status: 500,
        }
      );
    }
   }