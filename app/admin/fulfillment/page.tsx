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
   
   import FulfillmentBoard from "@/components/admin/FulfillmentBoard";
   
   export const dynamic =
    "force-dynamic";
   
   export default async function AdminFulfillmentPage() {
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
          where: {
            status: {
              in: [
                "PAID",
                "PAYMENT_FAILED",
              ],
            },
          },
   
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
   
    const fulfillmentOrders =
      orders.map(
        (
          order
        ) => ({
          id:
            order.id,
   
          customerName:
            order.customerName,
   
          customerEmail:
            order.customerEmail,
   
          planName:
            order.planName,
   
          supplementCount:
            order.supplementCount,
   
          totalPrice:
            Number(
              order.totalPrice
            ),
   
          purchaseOption:
            order.purchaseOption,
   
          fulfillmentStatus:
            order.fulfillmentStatus,
   
          trackingNumber:
            order.trackingNumber,
   
          shippingCarrier:
            order.shippingCarrier,
   
          fulfillmentNotes:
            order.fulfillmentNotes,
   
          createdAt:
            order.createdAt.toISOString(),
   
          items:
            order.items.map(
              (
                item
              ) => ({
                id:
                  item.id,
   
                productName:
                  item.productName,
   
                brand:
                  item.brand,
   
                timing:
                  item.timing,
              })
            ),
        })
      );
   
    return (
      <main className="min-h-screen bg-[#F7F3EE] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
                VidaPouch Admin
              </p>
   
              <h1 className="mt-2 text-3xl font-semibold text-[#26211D]">
                Fulfillment
              </h1>
   
              <p className="mt-2 text-[#665C54]">
                Track orders from preparation through shipment and completion.
              </p>
            </div>
   
            <a
              href="/admin/orders"
              className="rounded-full border border-[#CFC3B7] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#302A25] transition hover:bg-[#F2ECE6]">
   
              View printable orders
            </a>
          </div>
   
          <div className="mt-8">
            <FulfillmentBoard
              initialOrders={
                fulfillmentOrders
              }
            />
          </div>
        </div>
      </main>
    );
   }
   