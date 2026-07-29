import {
    NextRequest,
    NextResponse,
   } from "next/server";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
   } from "@/lib/admin/adminSession";
   
   type WaitlistStatus =
    | "NEW"
    | "CONTACTED"
    | "READY_TO_ORDER"
    | "CONVERTED"
    | "DECLINED";
   
   const VALID_STATUSES:
    WaitlistStatus[] = [
      "NEW",
      "CONTACTED",
      "READY_TO_ORDER",
      "CONVERTED",
      "DECLINED",
    ];
   
   type RouteContext = {
    params:
      Promise<{
        entryId:
          string;
      }>;
   };
   
   export async function PATCH(
    request:
      NextRequest,
   
    context:
      RouteContext
   ) {
    const sessionToken =
      request.cookies.get(
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
            "Unauthorized.",
        },
        {
          status:
            401,
        }
      );
    }
   
    const {
      entryId,
    } =
      await context.params;
   
    let body:
      unknown;
   
    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status:
            400,
        }
      );
    }
   
    const status =
      typeof body ===
        "object" &&
      body !==
        null &&
      "status" in
        body &&
      typeof body.status ===
        "string"
        ? body.status
        : null;
   
    if (
      !status ||
      !VALID_STATUSES.includes(
        status as WaitlistStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid waitlist status.",
        },
        {
          status:
            400,
        }
      );
    }
   
    const now =
      new Date();
   
    try {
      const updatedEntry =
        await prisma
          .vidaPouchWaitlistEntry
          .update({
            where: {
              id:
                entryId,
            },
   
            data: {
              status:
                status as WaitlistStatus,
   
              contactedAt:
                status ===
                "CONTACTED"
                  ? now
                  : undefined,
   
              readyToOrderAt:
                status ===
                "READY_TO_ORDER"
                  ? now
                  : undefined,
   
              convertedAt:
                status ===
                "CONVERTED"
                  ? now
                  : undefined,
   
              declinedAt:
                status ===
                "DECLINED"
                  ? now
                  : undefined,
            },
          });
   
      return NextResponse.json(
        {
          success:
            true,
   
          entry:
            updatedEntry,
        }
      );
    } catch (
      error
    ) {
      console.error(
        "Unable to update waitlist entry:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Unable to update the waitlist entry.",
        },
        {
          status:
            500,
        }
      );
    }
   }