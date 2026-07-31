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
   
   type BottleStatus =
    | "QUARANTINED"
    | "AVAILABLE"
    | "LOW_STOCK"
    | "DEPLETED"
    | "EXPIRED"
    | "RECALLED"
    | "DISCARDED";
   
   const VALID_STATUSES:
    BottleStatus[] = [
      "QUARANTINED",
      "AVAILABLE",
      "LOW_STOCK",
      "DEPLETED",
      "EXPIRED",
      "RECALLED",
      "DISCARDED",
    ];
   
   export async function PATCH(
    request:
      NextRequest
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
   
    if (
      typeof body !==
        "object" ||
      body ===
        null
    ) {
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
   
    const data =
      body as Record<
        string,
        unknown
   >;
   
    const bottleId =
      typeof data.bottleId ===
        "string"
        ? data.bottleId
        : null;
   
    const status =
      typeof data.status ===
        "string"
        ? data.status
        : null;
   
    if (
      !bottleId
    ) {
      return NextResponse.json(
        {
          error:
            "Bottle ID is required.",
        },
        {
          status:
            400,
        }
      );
    }
   
    if (
      !status ||
      !VALID_STATUSES.includes(
        status as BottleStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid bottle status.",
        },
        {
          status:
            400,
        }
      );
    }
   
    try {
      const existingBottle =
        await prisma
          .vidaPouchInventoryBottle
          .findUnique({
            where: {
              id:
                bottleId,
            },
   
            select: {
              id:
                true,
   
              status:
                true,
   
              remainingUnitCount:
                true,
            },
          });
   
      if (
        !existingBottle
      ) {
        return NextResponse.json(
          {
            error:
              "Inventory bottle was not found.",
          },
          {
            status:
              404,
          }
        );
      }
   
      if (
        status ===
          "DEPLETED" &&
        Number(
          existingBottle.remainingUnitCount
        ) >
          0
      ) {
        return NextResponse.json(
          {
            error:
              "A bottle with remaining inventory cannot be marked depleted.",
          },
          {
            status:
              400,
          }
        );
      }
   
      const updatedBottle =
        await prisma
          .vidaPouchInventoryBottle
          .update({
            where: {
              id:
                bottleId,
            },
   
            data: {
              status:
                status as BottleStatus,
            },
          });
   
      return NextResponse.json({
        success:
          true,
   
        bottle:
          updatedBottle,
      });
    } catch (
      error
    ) {
      console.error(
        "Unable to update inventory bottle status:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Unable to update the inventory bottle status.",
        },
        {
          status:
            500,
        }
      );
    }
   }
   