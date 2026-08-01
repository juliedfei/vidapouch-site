import {
    NextResponse,
   } from "next/server";
   
   import {
    cookies,
   } from "next/headers";
   
   import {
    Prisma,
   } from "@/lib/generated/prisma/client";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
   } from "@/lib/admin/adminSession";
   
   async function requireAdmin() {
    const cookieStore =
      await cookies();
   
    const sessionToken =
      cookieStore.get(
        ADMIN_SESSION_COOKIE
      )?.value;
   
    return verifyAdminSessionToken(
      sessionToken
    );
   }
   
   function decimalValue(
    value:
      unknown,
    fieldName:
      string
   ) {
    const numericValue =
      Number(
        value
      );
   
    if (
      !Number.isFinite(
        numericValue
      ) ||
      numericValue <
        0
    ) {
      throw new Error(
        `${fieldName} must be a valid non-negative number.`
      );
    }
   
    return new Prisma.Decimal(
      numericValue
    );
   }
   
   export async function PATCH(
    request:
      Request
   ) {
    const session =
      await requireAdmin();
   
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
   
    try {
      const body =
        await request.json();
   
      const pouchCost =
        decimalValue(
          body.pouchCost,
          "Pouch cost"
        );
   
      const singleBoxCost =
        decimalValue(
          body.singleBoxCost,
          "Single box cost"
        );
   
      const dualBoxCost =
        decimalValue(
          body.dualBoxCost,
          "Dual box cost"
        );
   
      const insertCost =
        decimalValue(
          body.insertCost,
          "Insert cost"
        );
   
      const labelCost =
        decimalValue(
          body.labelCost,
          "Label cost"
        );
   
      const laborHourlyRate =
        decimalValue(
          body.laborHourlyRate,
          "Labor hourly rate"
        );
   
      const laborMinutesPerOrder =
        decimalValue(
          body.laborMinutesPerOrder,
          "Labor minutes per order"
        );
   
      const otherPackagingCost =
        decimalValue(
          body.otherPackagingCost,
          "Other packaging cost"
        );
   
      const effectiveFrom =
        new Date();
   
      const settings =
        await prisma.$transaction(
          async (
            tx
          ) => {
            await tx
              .vidaPouchProfitSettings
              .updateMany({
                where: {
                  active:
                    true,
                },
   
                data: {
                  active:
                    false,
   
                  retiredAt:
                    effectiveFrom,
                },
              });
   
            return tx
              .vidaPouchProfitSettings
              .create({
                data: {
                  pouchCost,
   
                  singleBoxCost,
   
                  dualBoxCost,
   
                  insertCost,
   
                  labelCost,
   
                  laborHourlyRate,
   
                  laborMinutesPerOrder,
   
                  otherPackagingCost,
   
                  active:
                    true,
   
                  effectiveFrom,
   
                  retiredAt:
                    null,
                },
              });
          }
        );
   
      return NextResponse.json({
        success:
          true,
   
        settings: {
          id:
            settings.id,
   
          pouchCost:
            Number(
              settings.pouchCost
            ),
   
          singleBoxCost:
            Number(
              settings.singleBoxCost
            ),
   
          dualBoxCost:
            Number(
              settings.dualBoxCost
            ),
   
          insertCost:
            Number(
              settings.insertCost
            ),
   
          labelCost:
            Number(
              settings.labelCost
            ),
   
          laborHourlyRate:
            Number(
              settings.laborHourlyRate
            ),
   
          laborMinutesPerOrder:
            Number(
              settings
                .laborMinutesPerOrder
            ),
   
          otherPackagingCost:
            Number(
              settings.otherPackagingCost
            ),
   
          active:
            settings.active,
   
          effectiveFrom:
            settings
              .effectiveFrom
              .toISOString(),
        },
      });
    } catch (
      error
    ) {
      console.error(
        "Unable to update profit settings:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            error instanceof
              Error
              ? error.message
              : "Unable to update profit settings.",
        },
        {
          status:
            400,
        }
      );
    }
   }