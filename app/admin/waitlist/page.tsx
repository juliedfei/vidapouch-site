import {
    cookies,
   } from "next/headers";
   
   import Link from "next/link";
   
   import {
    redirect,
   } from "next/navigation";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
   } from "@/lib/admin/adminSession";
   
   import AdminNavigation from "@/components/admin/AdminNavigation";
   
   import WaitlistStatusControl from "@/components/admin/WaitlistStatusControl";
   
   export const dynamic =
    "force-dynamic";
   
   type WaitlistStatusFilter =
    | "ALL"
    | "NEW"
    | "CONTACTED"
    | "READY_TO_ORDER"
    | "CONVERTED"
    | "DECLINED";
   
   type AdminWaitlistPageProps = {
    searchParams:
      Promise<{
        status?:
          string;
      }>;
   };
   
   function formatMoney(
    value:
      number
   ) {
    return new Intl.NumberFormat(
      "en-US",
      {
        style:
          "currency",
   
        currency:
          "USD",
      }
    ).format(
      value
    );
   }
   
   function formatDate(
    value:
      Date
   ) {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle:
          "medium",
   
        timeStyle:
          "short",
      }
    ).format(
      value
    );
   }
   
   function getStatusClasses(
    status:
      string
   ) {
    switch (
      status
    ) {
      case "NEW":
        return "bg-blue-100 text-blue-800";
   
      case "CONTACTED":
        return "bg-amber-100 text-amber-800";
   
      case "READY_TO_ORDER":
        return "bg-purple-100 text-purple-800";
   
      case "CONVERTED":
        return "bg-green-100 text-green-800";
   
      case "DECLINED":
        return "bg-gray-200 text-gray-800";
   
      default:
        return "bg-gray-100 text-gray-700";
    }
   }
   
   function getFilterCardClasses(
    isSelected:
      boolean
   ) {
    return [
      "rounded-2xl",
      "border",
      "p-5",
      "transition",
      "focus:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-[#7D0E1C]",
      "focus-visible:ring-offset-2",
      isSelected
        ? "border-[#7D0E1C] bg-[#FFF8F6] shadow-sm"
        : "border-[#DED4C9] bg-white hover:border-[#BFA99A] hover:shadow-sm",
    ].join(
      " "
    );
   }
   
   export default async function AdminWaitlistPage({
    searchParams,
   }: AdminWaitlistPageProps) {
    const resolvedSearchParams =
      await searchParams;
   
    const requestedStatus =
      resolvedSearchParams.status;
   
    const selectedStatus:
      WaitlistStatusFilter =
        requestedStatus ===
          "NEW" ||
        requestedStatus ===
          "CONTACTED" ||
        requestedStatus ===
          "READY_TO_ORDER" ||
        requestedStatus ===
          "CONVERTED" ||
        requestedStatus ===
          "DECLINED"
          ? requestedStatus
          : "ALL";
   
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
   
    const entries =
      await prisma
        .vidaPouchWaitlistEntry
        .findMany({
          orderBy: {
            createdAt:
              "desc",
          },
   
          include: {
            items: {
              orderBy: {
                createdAt:
                  "asc",
              },
            },
          },
        });
   
    const newEntries =
      entries.filter(
        (
          entry
        ) =>
          entry.status ===
          "NEW"
      ).length;
   
    const contacted =
      entries.filter(
        (
          entry
        ) =>
          entry.status ===
          "CONTACTED"
      ).length;
   
    const readyToOrder =
      entries.filter(
        (
          entry
        ) =>
          entry.status ===
          "READY_TO_ORDER"
      ).length;
   
    const converted =
      entries.filter(
        (
          entry
        ) =>
          entry.status ===
          "CONVERTED"
      ).length;
   
    const declined =
      entries.filter(
        (
          entry
        ) =>
          entry.status ===
          "DECLINED"
      ).length;
   
    const filteredEntries =
      selectedStatus ===
        "ALL"
        ? entries
        : entries.filter(
            (
              entry
            ) =>
              entry.status ===
              selectedStatus
          );
   
    const selectedStatusLabel =
      selectedStatus ===
        "ALL"
        ? "All entries"
        : selectedStatus
            .replaceAll(
              "_",
              " "
            )
            .toLowerCase()
            .replace(
              /^./,
              (
                character
              ) =>
                character.toUpperCase()
            );
   
    return (
      <main className="min-h-screen bg-[#F7F3EE] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
                VidaPouch Admin
              </p>
   
              <h1 className="mt-2 text-3xl font-semibold text-[#26211D]">
                Waitlist
              </h1>
   
              <p className="mt-2 text-[#665C54]">
                Review prospective customers and the complete supplement routines they reserved.
              </p>
            </div>
   
            <AdminNavigation
              currentPage="waitlist"
            />
          </div>
   
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Link
              href="/admin/waitlist"
              aria-current={
                selectedStatus ===
                  "ALL"
                  ? "page"
                  : undefined
              }
              className={getFilterCardClasses(
                selectedStatus ===
                  "ALL"
              )}>
   
              <p className="text-sm text-[#665C54]">
                All entries
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {entries.length}
              </p>
            </Link>
   
            <Link
              href="/admin/waitlist?status=NEW"
              aria-current={
                selectedStatus ===
                  "NEW"
                  ? "page"
                  : undefined
              }
              className={getFilterCardClasses(
                selectedStatus ===
                  "NEW"
              )}>
   
              <p className="text-sm text-[#665C54]">
                New
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {newEntries}
              </p>
            </Link>
   
            <Link
              href="/admin/waitlist?status=CONTACTED"
              aria-current={
                selectedStatus ===
                  "CONTACTED"
                  ? "page"
                  : undefined
              }
              className={getFilterCardClasses(
                selectedStatus ===
                  "CONTACTED"
              )}>
   
              <p className="text-sm text-[#665C54]">
                Contacted
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {contacted}
              </p>
            </Link>
   
            <Link
              href="/admin/waitlist?status=READY_TO_ORDER"
              aria-current={
                selectedStatus ===
                  "READY_TO_ORDER"
                  ? "page"
                  : undefined
              }
              className={getFilterCardClasses(
                selectedStatus ===
                  "READY_TO_ORDER"
              )}>
   
              <p className="text-sm text-[#665C54]">
                Ready to order
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {readyToOrder}
              </p>
            </Link>
   
            <Link
              href="/admin/waitlist?status=CONVERTED"
              aria-current={
                selectedStatus ===
                  "CONVERTED"
                  ? "page"
                  : undefined
              }
              className={getFilterCardClasses(
                selectedStatus ===
                  "CONVERTED"
              )}>
   
              <p className="text-sm text-[#665C54]">
                Converted
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {converted}
              </p>
            </Link>
   
            <Link
              href="/admin/waitlist?status=DECLINED"
              aria-current={
                selectedStatus ===
                  "DECLINED"
                  ? "page"
                  : undefined
              }
              className={getFilterCardClasses(
                selectedStatus ===
                  "DECLINED"
              )}>
   
              <p className="text-sm text-[#665C54]">
                Declined
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {declined}
              </p>
            </Link>
          </section>
   
          <div className="mt-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-[#26211D]">
              {selectedStatusLabel}
            </h2>
   
            <p className="text-sm text-[#665C54]">
              Showing{" "}
              {filteredEntries.length}{" "}
              {filteredEntries.length ===
              1
                ? "entry"
                : "entries"}
            </p>
          </div>
   
          <section className="mt-5 space-y-5">
            {filteredEntries.length ===
            0 ? (
              <div className="rounded-3xl border border-[#DED4C9] bg-white p-10 text-center text-[#665C54]">
                {entries.length ===
                0
                  ? "No VidaPouch waitlist entries have been submitted yet."
                  : `There are no ${selectedStatusLabel.toLowerCase()} waitlist entries.`}
              </div>
            ) : (
              filteredEntries.map(
                (
                  entry
                ) => (
                  <article
                    key={
                      entry.id
                    }
                    className="overflow-hidden rounded-3xl border border-[#DED4C9] bg-white shadow-sm">
   
                    <div className="border-b border-[#E9E1D8] p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold text-[#26211D]">
                              {entry.customerName ??
                                "Name not provided"}
                            </h2>
   
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                entry.status
                              )}`}>
   
                              {entry.status.replaceAll(
                                "_",
                                " "
                              )}
                            </span>


                            <span
 className="
   rounded-full
   bg-[#F3E9DD]
   px-3 py-1
   text-xs font-semibold
   text-[#694F3B]
 ">

 {entry.source ===
 "VIDAPOUCH"
   ? "SOURCE: VIDAPOUCH"
   : "SOURCE: VIDASEARCH"}
</span>



                          </div>
   
                          <p className="mt-2 text-sm text-[#665C54]">
                            {entry.customerEmail}
                          </p>
   
                          <p className="mt-1 text-sm text-[#665C54]">
                            {entry.customerPhone ??
                              "No phone number provided"}
                          </p>
                        </div>
   
                        <div className="text-left lg:text-right">
 <p className="text-2xl font-semibold text-[#26211D]">
   {entry.estimatedTotalPrice ===
   null
     ? "Not selected yet"
     : formatMoney(
         Number(
           entry.estimatedTotalPrice
         )
       )}
 </p>



   
 <p className="mt-1 text-sm text-[#665C54]">
 {entry.purchaseOption ===
 null
   ? "Founding Member registration"
   : (
       <>
         Estimated{" "}
         {entry.purchaseOption ===
         "SUBSCRIPTION"
           ? "monthly subscription"
           : "one-time order"}
       </>
     )}
</p>




                        </div>
                      </div>
   
                      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="text-[#766B62]">
                            Plan
                          </dt>
   


                          <dd className="mt-1 font-medium text-[#26211D]">
 {entry.planName ??
   "Not selected yet"}
</dd>





                        </div>
   
                        <div>
                          <dt className="text-[#766B62]">
                            Supplements
                          </dt>
   



                          <dd className="mt-1 font-medium text-[#26211D]">
 {entry.supplementCount ??
   "Not selected yet"}
</dd>




                        </div>
   
                        <div>
                          <dt className="text-[#766B62]">
                            Submitted
                          </dt>
   
                          <dd className="mt-1 font-medium text-[#26211D]">
                            {formatDate(
                              entry.createdAt
                            )}
                          </dd>
                        </div>
   
                        <div>
                          <dt className="text-[#766B62]">
                            Waitlist ID
                          </dt>
   
                          <dd className="mt-1 break-all font-medium text-[#26211D]">
                            {entry.id}
                          </dd>
                        </div>
                      </dl>
                    </div>
   
                    <div className="grid gap-8 p-6 lg:grid-cols-2">
                      <section>
                        <h3 className="font-semibold text-[#26211D]">
                          Requested routine
                        </h3>
   


                        <div className="mt-4 space-y-3">



{entry.items.length ===
0 ? (
 <div className="rounded-2xl bg-[#F8F5F1] p-4 text-sm text-[#665C54]">
   No supplements selected yet.
 </div>
) : (
 entry.items.map(




                            (
                              item
                            ) => (




                              <div
                                key={
                                  item.id
                                }
                                className="rounded-2xl bg-[#F8F5F1] p-4">
   
                                <p className="font-medium text-[#26211D]">
                                  {item.productName}
                                </p>
   
                                <p className="mt-1 text-sm text-[#665C54]">
                                  {item.brand} ·{" "}
                                  {item.unitsPerDay.toString()}{" "}
                                  {item.unitLabel} per day
                                </p>
   
                                <p className="mt-1 text-sm text-[#665C54]">
                                  Timing:{" "}
                                  {item.timing}
                                </p>
                              </div>
                            )


                          )
                          )}
                        </div>



                      </section>
   
                      <section>
                        <h3 className="font-semibold text-[#26211D]">
                          Estimated pricing
                        </h3>
   
                        <dl className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-[#766B62]">
                              Plan price
                            </dt>
   



                            <dd className="font-medium text-[#26211D]">
 {entry.estimatedPlanPrice ===
 null
   ? "Not selected yet"
   : formatMoney(
       Number(
         entry.estimatedPlanPrice
       )
     )}
</dd>





                          </div>
   
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-[#766B62]">
                              Estimated overage
                            </dt>
   



                            <dd className="font-medium text-[#26211D]">
 {entry.estimatedOverageFee ===
 null
   ? "Not selected yet"
   : formatMoney(
       Number(
         entry.estimatedOverageFee
       )
     )}
</dd>





                          </div>
   
                          <div className="flex items-center justify-between gap-4 border-t border-[#E6DED5] pt-3">
                            <dt className="font-semibold text-[#26211D]">
                              Estimated total
                            </dt>
   


                            <dd className="font-semibold text-[#26211D]">
 {entry.estimatedTotalPrice ===
 null
   ? "Not selected yet"
   : formatMoney(
       Number(
         entry.estimatedTotalPrice
       )
     )}
</dd>





                          </div>
                        </dl>
   
                        {entry.adminNotes ? (
                          <div className="mt-6 rounded-2xl border border-[#E6DED5] bg-[#FCFAF7] p-4">
                            <p className="text-sm font-semibold text-[#26211D]">
                              Admin notes
                            </p>
   
                            <p className="mt-2 text-sm leading-6 text-[#665C54]">
                              {entry.adminNotes}
                            </p>
                          </div>
                        ) : null}
   
                        <WaitlistStatusControl
                          entryId={
                            entry.id
                          }
                          currentStatus={
                            entry.status
                          }
                        />
                      </section>
                    </div>
                  </article>
                )
              )
            )}
          </section>
        </div>
      </main>
    );
   }