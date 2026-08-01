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
    getSubscriptionFulfillmentTiming,
   } from "@/lib/commerce/getSubscriptionFulfillmentTiming";
   
   import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
   } from "@/lib/admin/adminSession";
   
   import FulfillmentBoard from
    "@/components/admin/FulfillmentBoard";
   
   import AdminNavigation from
    "@/components/admin/AdminNavigation";
   
   export const dynamic =
    "force-dynamic";
   
   export default async function
   AdminFulfillmentPage
   () {
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
   
            billingCycles: {
              orderBy: {
                createdAt:
                  "asc",
              },
            },
   
            fulfillmentRuns: {
              orderBy: {
                createdAt:
                  "asc",
              },
   
              include: {
                billingCycle:
                  true,
   
                allocations: {
                  where: {
                    releasedAt:
                      null,
                  },
   
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
      orders.flatMap(
        (
          order
        ) => {
          /*
           * The initial order may not have a fulfillment
           * run yet. In that case we still want to show
           * one actionable fulfillment ticket.
           */
          const initialRun =
            order.fulfillmentRuns.find(
              (
                run
              ) =>
                run.billingCycleId ===
                null
            ) ??
            null;
   

            const initialTiming =
            getSubscriptionFulfillmentTiming(
              order.paidAt ??
              order.createdAt
            );



          const initialInventoryCost =
            initialRun
              ? initialRun.allocations.reduce(
                  (
                    total,
                    allocation
                  ) =>
                    total +
                    Number(
                      allocation
                        .totalCostSnapshot
                    ),
                  0
                )
              : 0;
   
          const initialTicket = {
            id:
              initialRun?.id ??
              `initial-${order.id}`,
   
            orderId:
              order.id,
   
            fulfillmentRunId:
              initialRun?.id ??
              null,
   
            billingCycleId:
              null,
   
            cycleNumber:
              1,
   
            cycleType:
              "INITIAL" as const,
   
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
              order.createdAt
                .toISOString(),
   
            paidAt:
              order.paidAt
                ?.toISOString() ??
              null,
   



              shipByDate:
              initialTiming
                .initialShipByDate
                .toISOString(),
             
             targetDeliveryDate:
              initialTiming
                .initialTargetDeliveryDate
                .toISOString(),




   
            inventoryReservationStatus:
              initialRun?.status ??
              null,
   
            inventoryReserved:
              initialRun?.status ===
                "INVENTORY_RESERVED" ||
              initialRun?.status ===
                "ASSEMBLING" ||
              initialRun?.status ===
                "COMPLETED",
   
            inventoryAllocationCount:
              initialRun?.allocations
                .length ??
              0,
   
            inventoryCost:
              initialInventoryCost,
   
            inventoryAllocations:
              initialRun
                ?.allocations
                .map(
                  (
                    allocation
                  ) => ({
                    id:
                      allocation.id,
   
                    orderItemId:
                      allocation
                        .orderItemId,
   
                    productName:
                      allocation
                        .orderItem
                        .productName,
   
                    brand:
                      allocation
                        .orderItem
                        .brand,
   
                    unitLabel:
                      allocation
                        .orderItem
                        .unitLabel,
   
                    bottleCode:
                      allocation
                        .bottle
                        .bottleCode,
   
                    manufacturerLotNumber:
                      allocation
                        .bottle
                        .manufacturerLotNumber,
   
                    expirationDate:
                      allocation
                        .bottle
                        .expirationDate
                        ?.toISOString() ??
                      null,
   
                    quantity:
                      Number(
                        allocation.quantity
                      ),
   
                    totalCost:
                      Number(
                        allocation
                          .totalCostSnapshot
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
                      item
                        .monthlyUnitCount
                    ),
   
                  unitLabel:
                    item.unitLabel,
                })
              ),
          };
   
          const renewalTickets =
            order.fulfillmentRuns
              .filter(
                (
                  run
                ) =>
                  run.billingCycleId !==
                  null
              )
              .map(
                (
                  run,
                  index
                ) => {
                  const inventoryCost =
                    run.allocations.reduce(
                      (
                        total,
                        allocation
                      ) =>
                        total +
                        Number(
                          allocation
                            .totalCostSnapshot
                        ),
                      0
                    );
   
                  const billingCycle =
                    run.billingCycle;
   
                  return {
                    id:
                      run.id,
   
                    orderId:
                      order.id,
   
                    fulfillmentRunId:
                      run.id,
   
                    billingCycleId:
                      run.billingCycleId,
   
                    cycleNumber:
                      index + 2,
   
                    cycleType:
                      "RENEWAL" as const,
   
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
                        run.revenueAmount
                      ),
   
                    purchaseOption:
                      order.purchaseOption,
   
                    paymentStatus:
                      billingCycle?.status ??
                      order.status,
   
                    /*
                     * Renewal fulfillment status is not
                     * yet stored separately on the run,
                     * so start renewals as NEW for now.
                     * We will move fulfillment status,
                     * tracking, carrier, and notes onto
                     * each run in the next schema step.
                     */
                    
                    
                    
                    fulfillmentStatus:
                    run.fulfillmentStatus,
                   
                   trackingNumber:
                    run.trackingNumber,
                   
                   shippingCarrier:
                    run.shippingCarrier,
                   
                   fulfillmentNotes:
                    run.notes,



   
                    createdAt:
                      run.createdAt
                        .toISOString(),
   
                    paidAt:
                      billingCycle?.paidAt
                        ?.toISOString() ??
                      null,
   
                    shipByDate:
                      billingCycle
                        ?.shipByDate
                        ?.toISOString() ??
                      null,
   
                    targetDeliveryDate:
                      billingCycle
                        ?.targetDeliveryDate
                        ?.toISOString() ??
                      null,
   
                    inventoryReservationStatus:
                      run.status,
   
                    inventoryReserved:
                      run.status ===
                        "INVENTORY_RESERVED" ||
                      run.status ===
                        "ASSEMBLING" ||
                      run.status ===
                        "COMPLETED",
   
                    inventoryAllocationCount:
                      run.allocations.length,
   
                    inventoryCost,
   
                    inventoryAllocations:
                      run.allocations.map(
                        (
                          allocation
                        ) => ({
                          id:
                            allocation.id,
   
                          orderItemId:
                            allocation
                              .orderItemId,
   
                          productName:
                            allocation
                              .orderItem
                              .productName,
   
                          brand:
                            allocation
                              .orderItem
                              .brand,
   
                          unitLabel:
                            allocation
                              .orderItem
                              .unitLabel,
   
                          bottleCode:
                            allocation
                              .bottle
                              .bottleCode,
   
                          manufacturerLotNumber:
                            allocation
                              .bottle
                              .manufacturerLotNumber,
   
                          expirationDate:
                            allocation
                              .bottle
                              .expirationDate
                              ?.toISOString() ??
                            null,
   
                          quantity:
                            Number(
                              allocation
                                .quantity
                            ),
   
                          totalCost:
                            Number(
                              allocation
                                .totalCostSnapshot
                            ),
                        })
                      ),
   
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
                              item
                                .monthlyUnitCount
                            ),
   
                          unitLabel:
                            item.unitLabel,
                        })
                      ),
                  };
                }
              );
   
          return [
            initialTicket,
            ...renewalTickets,
          ];
        }
      );
   
    return (
      <main className=
   "min-h-screen bg-[#F7F3EE] px-4 py-10 sm:px-6 lg:px-8">
   
        <div className=
   "mx-auto max-w-[1600px]">
   
          <div className=
   "flex flex-col gap-5">
   
            <div>
              <p className=
   "text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
   
                VidaPouch Admin
              </p>
   
              <h1 className=
   "mt-2 text-3xl font-semibold text-[#26211D]">
   
                Fulfillment
              </h1>
   
              <p className=
   "mt-2 text-[#665C54]">
   
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