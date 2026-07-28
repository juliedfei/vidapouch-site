import {
    cookies,
   } from "next/headers";
   
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
   
   export const dynamic =
    "force-dynamic";
   
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
      Date |
      null
   ) {
    if (
      !value
    ) {
      return "—";
    }
   
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
      case "PAID":
        return "bg-green-100 text-green-800";
   
      case "PAYMENT_FAILED":
        return "bg-red-100 text-red-800";
   
      case "CANCELED":
        return "bg-gray-200 text-gray-800";
   
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
   
      default:
        return "bg-yellow-100 text-yellow-800";
    }
   }
   




   export default async function AdminOrdersPage() {
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
   
    const orders =
      await prisma
        .vidaPouchOrder
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
   
            billingCycles: {
              orderBy: {
                createdAt:
                  "desc",
              },
            },
          },
        });
   
    const paidOrders =
      orders.filter(
        (
          order
        ) =>
          order.status ===
          "PAID"
      ).length;
   
    const subscriptions =
      orders.filter(
        (
          order
        ) =>
          order.purchaseOption ===
          "SUBSCRIPTION"
      ).length;
   
    const scheduledCancellations =
      orders.filter(
        (
          order
        ) =>
          order
            .cancelAtPeriodEnd
      ).length;
   
    return (
      <main className="min-h-screen bg-[#F7F3EE] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          
          
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div>
   <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
     VidaPouch Admin
   </p>

   <h1 className="mt-2 text-3xl font-semibold text-[#26211D]">
     Orders
   </h1>

   <p className="mt-2 text-[#665C54]">
     Signed in as{" "}
     {session.email}
   </p>
 </div>

 <div className="flex flex-col gap-3 sm:items-end">
   <p className="text-sm text-[#665C54]">
     {orders.length} total orders
   </p>

   <form
     action="/api/admin/logout"
     method="post">

     <button
       type="submit"
       className="rounded-full border border-[#CFC3B7] bg-white px-5 py-2 text-sm font-semibold text-[#302A25] transition hover:bg-[#F2ECE6]">

       Sign out
     </button>
   </form>
 </div>
</div>




   
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Paid orders
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {paidOrders}
              </p>
            </div>
   
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Subscriptions
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {subscriptions}
              </p>
            </div>
   
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Scheduled cancellations
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {scheduledCancellations}
              </p>
            </div>
          </section>
   
          <section className="mt-8 space-y-5">
            {orders.length ===
            0 ? (
              <div className="rounded-3xl border border-[#DED4C9] bg-white p-10 text-center text-[#665C54]">
                No VidaPouch orders have been recorded yet.
              </div>
            ) : (
              orders.map(
                (
                  order
                ) => (
                  <article
                    key={
                      order.id
                    }
                    className="overflow-hidden rounded-3xl border border-[#DED4C9] bg-white shadow-sm">
   
                    <div className="border-b border-[#E9E1D8] p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold text-[#26211D]">
                              {order.customerName ??
                                "Customer name unavailable"}
                            </h2>
   
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                order.status
                              )}`}>
   
                              {order.status.replaceAll(
                                "_",
                                " "
                              )}
                            </span>
   
                            {order.cancelAtPeriodEnd ? (
                              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                                Cancels at period end
                              </span>
                            ) : null}
                          </div>
   
                          <p className="mt-2 text-sm text-[#665C54]">
                            {order.customerEmail ??
                              "No customer email"}
                          </p>
   
                          <p className="mt-1 text-sm text-[#665C54]">
                            Order ID:{" "}
                            {order.id}
                          </p>
                        </div>
   
                        <div className="text-left lg:text-right">
                          <p className="text-2xl font-semibold text-[#26211D]">
                            {formatMoney(
                              Number(
                                order.totalPrice
                              )
                            )}
                          </p>
   
                          <p className="mt-1 text-sm text-[#665C54]">
                            {order.purchaseOption ===
                            "SUBSCRIPTION"
                              ? "Monthly subscription"
                              : "One-time purchase"}
                          </p>
                        </div>
                      </div>
   
                      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="text-[#766B62]">
                            Plan
                          </dt>
   
                          <dd className="mt-1 font-medium text-[#26211D]">
                            {order.planName}
                          </dd>
                        </div>
   
                        <div>
                          <dt className="text-[#766B62]">
                            Supplements
                          </dt>
   
                          <dd className="mt-1 font-medium text-[#26211D]">
                            {order.supplementCount}
                          </dd>
                        </div>
   
                        <div>
                          <dt className="text-[#766B62]">
                            Ordered
                          </dt>
   
                          <dd className="mt-1 font-medium text-[#26211D]">
                            {formatDate(
                              order.createdAt
                            )}
                          </dd>
                        </div>
   
                        <div>
                          <dt className="text-[#766B62]">
                            Paid
                          </dt>
   
                          <dd className="mt-1 font-medium text-[#26211D]">
                            {formatDate(
                              order.paidAt
                            )}
                          </dd>
                        </div>
                      </dl>
                    </div>
   
                    <div className="grid gap-8 p-6 lg:grid-cols-2">
                      <section>
                        <h3 className="font-semibold text-[#26211D]">
                          Supplement routine
                        </h3>
   
                        <div className="mt-4 space-y-3">
                          {order.items.map(
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
                          )}
                        </div>
                      </section>
   
                      <section>
                        <h3 className="font-semibold text-[#26211D]">
                          Customer and fulfillment
                        </h3>
   
                        <dl className="mt-4 space-y-3 text-sm">
                          <div>
                            <dt className="text-[#766B62]">
                              Phone
                            </dt>
   
                            <dd className="mt-1 text-[#26211D]">
                              {order.customerPhone ??
                                "—"}
                            </dd>
                          </div>
   
                          <div>
                            <dt className="text-[#766B62]">
                              Shipping name
                            </dt>
   
                            <dd className="mt-1 text-[#26211D]">
                              {order.shippingName ??
                                "—"}
                            </dd>
                          </div>
   
                          <div>
                            <dt className="text-[#766B62]">
                              Cancellation date
                            </dt>
   
                            <dd className="mt-1 text-[#26211D]">
                              {formatDate(
                                order
                                  .scheduledCancellationAt
                              )}
                            </dd>
                          </div>
   
                          <div>
                            <dt className="text-[#766B62]">
                              Cancellation reason
                            </dt>
   
                            <dd className="mt-1 text-[#26211D]">
                              {order.cancellationReason ??
                                "—"}
                            </dd>
                          </div>
                        </dl>
   
                        {order.billingCycles.length >
                        0 ? (
                          <div className="mt-6">
                            <h4 className="font-medium text-[#26211D]">
                              Billing history
                            </h4>
   
                            <div className="mt-3 space-y-2">
                              {order.billingCycles.map(
                                (
                                  cycle
                                ) => (
                                  <div
                                    key={
                                      cycle.id
                                    }
                                    className="flex items-center justify-between rounded-xl border border-[#E6DED5] px-4 py-3 text-sm">
   
                                    <span className="text-[#665C54]">
                                      {cycle.billingReason ??
                                        "Invoice"}
                                    </span>
   
                                    <span className="font-medium text-[#26211D]">
                                      {formatMoney(
                                        Number(
                                          cycle.amountPaid
                                        )
                                      )}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : null}
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
   