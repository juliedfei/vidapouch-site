import {
    cookies,
   } from "next/headers";
   
   import {
    redirect,
   } from "next/navigation";
   
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
   
   import AdminNavigation from "@/components/admin/AdminNavigation";
   
   import CommerceSettingsPanel from "@/components/admin/CommerceSettingsPanel";
   
   export const dynamic =
    "force-dynamic";
   
   export default async function AdminSettingsPage() {
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
      redirect(
        "/admin/login"
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
   
          select: {
            salesMode:
              true,
   
            notes:
              true,
   
            updatedAt:
              true,
   
            updatedBy:
              true,
          },
        });
   
    const salesMode =
      setting?.salesMode ??
      VidaPouchSalesMode.WAITLIST;
   
    return (
      <main className="min-h-screen bg-[#F7F3EE] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
                VidaPouch Admin
              </p>
   
              <h1 className="mt-2 text-3xl font-semibold text-[#26211D]">
                Settings
              </h1>
   
              <p className="mt-2 text-[#665C54]">
                Control how customers finish their VidaPouch routine.
              </p>
            </div>
   
            <AdminNavigation
              currentPage="settings"
            />
          </div>
   
          <div className="mt-8">
            <CommerceSettingsPanel
              initialSalesMode={
                salesMode
              }
              initialNotes={
                setting?.notes ??
                null
              }
            />
          </div>
   
          {setting ? (
            <p className="mt-4 text-sm text-[#766B62]">
              Last updated by{" "}
              {setting.updatedBy ??
                "an administrator"}{" "}
              on{" "}
              {new Intl.DateTimeFormat(
                "en-US",
                {
                  dateStyle:
                    "medium",
   
                  timeStyle:
                    "short",
                }
              ).format(
                setting.updatedAt
              )}
              .
            </p>
          ) : null}
        </div>
      </main>
    );
   }