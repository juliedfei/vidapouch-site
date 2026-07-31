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
   
   import AdminNavigation from "@/components/admin/AdminNavigation";
   
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
   
            fulfillmentRuns: {
              where: {
                billingCycleId:
                  null,
              },
   
              orderBy: {
                createdAt:
                  "desc",
              },
   
              take:
                1,
   


                include: {
                    allocations: {
                      include: {
                        bottle: {
                          select: {
                            bottleCode:
                              true,
                   
                            manufacturerLotNumber:
                              true,
                   
                            expirationDate:
                              true,
                          },
                        },
                   
                        orderItem: {
                          select: {
                            id:
                              true,
                   
                            productName:
                              true,
                   
                            brand:
                              true,
                   
                            unitLabel:
                              true,
                          },
                        },
                      },
                    },
                   },



            },
          },
        });
   
    const fulfillmentOrders =
      orders.map(
        (
          order
        ) => {
          const fulfillmentRun =
            order.fulfillmentRuns[0] ??
            null;
   
          const inventoryCost =
            fulfillmentRun
              ? fulfillmentRun.allocations.reduce(
                  (
                    total,
                    allocation
                  ) =>
                    total +
                    Number(
                      allocation.totalCostSnapshot
                    ),
                  0
                )
              : 0;
   
          return {
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
             
             paymentStatus:
              order.status,
             
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
   
            inventoryReservationStatus:
              fulfillmentRun?.status ??
              null,
   
            inventoryReserved:
              fulfillmentRun?.status ===
                "INVENTORY_RESERVED" ||
              fulfillmentRun?.status ===
                "ASSEMBLING" ||
              fulfillmentRun?.status ===
                "COMPLETED",
   





           inventoryAllocationCount:
 fulfillmentRun?.allocations.length ??
 0,

inventoryCost,

inventoryAllocations:
 fulfillmentRun
   ?.allocations
   .map(
     (
       allocation
     ) => ({
       id:
         allocation.id,

       orderItemId:
         allocation.orderItemId,

       productName:
         allocation.orderItem.productName,

       brand:
         allocation.orderItem.brand,

       unitLabel:
         allocation.orderItem.unitLabel,

       bottleCode:
         allocation.bottle.bottleCode,

       manufacturerLotNumber:
         allocation.bottle.manufacturerLotNumber,

       expirationDate:
         allocation.bottle.expirationDate
           ? allocation.bottle.expirationDate.toISOString()
           : null,

       quantity:
         Number(
           allocation.quantity
         ),

       totalCost:
         Number(
           allocation.totalCostSnapshot
         ),
     })
   ) ??
 [],

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

     monthlyUnitCount:
       Number(
         item.monthlyUnitCount
       ),

     unitLabel:
       item.unitLabel,
   })
 ),






          };
        }
      );
   
    return (
      <main className="min-h-screen bg-[#F7F3EE] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col gap-5">
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
   
            <AdminNavigation
              currentPage="fulfillment"
            />
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