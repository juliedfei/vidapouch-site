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
   
   import AdminNavigation from "@/components/admin/AdminNavigation";




   import InventoryReceiveForm from "@/components/admin/InventoryReceiveForm";



   import InventoryBottleStatusControl from "@/components/admin/InventoryBottleStatusControl";




   import {
    buildInventoryProductKey,
   } from "@/lib/inventory/inventoryProductIdentity";

   
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
   
   export default async function AdminInventoryPage() {
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
   



    const products =
      await prisma
        .vidaPouchInventoryProduct
        .findMany({



          orderBy: [
            {
              brand:
                "asc",
            },
            {
              productName:
                "asc",
            },
          ],
   
          include: {
            bottles: {
              orderBy: {
                receivedAt:
                  "asc",
              },
            },
          },
        });


        const orderItems =
        await prisma
          .vidaPouchOrderItem
          .findMany({
            select: {
              id:
                true,
       
              productName:
                true,
       
              brand:
                true,
       
              dosage:
                true,
       
              form:
                true,
       
              unitLabel:
                true,
       
              orderId:
                true,
            },
          });
       



   
    const totalProducts =
      products.length;
   
    const totalBottles =
      products.reduce(
        (
          total,
          product
        ) =>
          total +
          product.bottles.length,
        0
      );
   
    const totalAvailableUnits =
      products.reduce(
        (
          total,
          product
        ) =>
          total +
          product.bottles.reduce(
            (
              bottleTotal,
              bottle
            ) =>
              bottleTotal +
              Math.max(
                0,
                Number(
                  bottle.remainingUnitCount
                ) -
                  Number(
                    bottle.reservedUnitCount
                  )
              ),
            0
          ),
        0
      );
   
    const totalInventoryCost =
      products.reduce(
        (
          total,
          product
        ) =>
          total +
          product.bottles.reduce(
            (
              bottleTotal,
              bottle
            ) =>
              bottleTotal +
              Number(
                bottle.landedCost
              ),
            0
          ),
        0
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
                Inventory
              </h1>
   
              <p className="mt-2 text-[#665C54]">
                Track supplement products, individual bottles, available units, lot numbers, expiration dates, and acquisition costs.
              </p>
            </div>
   
            <AdminNavigation
              currentPage="inventory"
            />
          </div>
   
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Inventory products
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {totalProducts}
              </p>
            </div>
   
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Bottles on record
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {totalBottles}
              </p>
            </div>
   
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Available units
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {totalAvailableUnits.toFixed(
                  0
                )}
              </p>
            </div>
   
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Inventory purchase cost
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {formatMoney(
                  totalInventoryCost
                )}
              </p>
            </div>
          </section>



          <div className="mt-8">
 <InventoryReceiveForm />
</div>




   
          <section className="mt-8 space-y-5">
            {products.length ===
            0 ? (
              <div className="rounded-3xl border border-[#DED4C9] bg-white p-10 text-center">
                <p className="text-lg font-semibold text-[#26211D]">
                  No inventory has been received yet.
                </p>
   
                <p className="mt-2 text-sm text-[#665C54]">
                  We will add the receiving workflow next so you can enter your first supplement bottle.
                </p>
              </div>
            ) : (
              products.map(
                (
                  product
                ) => {
                  



                    const inventoryProductKey =
                    buildInventoryProductKey({
                      brand:
                        product.brand,
                   
                      productName:
                        product.productName,
                   
                      dosage:
                        product.dosage,
                   
                      form:
                        product.form,
                   
                      unitLabel:
                        product.unitLabel,
                    });
                   
                   const matchingOrderItems =
                    orderItems.filter(
                      (
                        orderItem
                      ) =>
                        buildInventoryProductKey({
                          brand:
                            orderItem.brand,
                   
                          productName:
                            orderItem.productName,
                   
                          dosage:
                            orderItem.dosage,
                   
                          form:
                            orderItem.form,
                   
                          unitLabel:
                            orderItem.unitLabel,
                        }) ===
                        inventoryProductKey
                    );
                   





                    const sameBrandOrderItems =
                    orderItems.filter(
                      (
                        orderItem
                      ) =>
                        orderItem.brand
                          .trim()
                          .toLowerCase() ===
                          product.brand
                            .trim()
                            .toLowerCase()
                    );
                   


                  
                  
                    const totalRemaining =
                    product.bottles.reduce(
                      (
                        total,
                        bottle
                      ) =>
                        total +
                        Number(
                          bottle.remainingUnitCount
                        ),
                      0
                    );
   
                  const totalReserved =
                    product.bottles.reduce(
                      (
                        total,
                        bottle
                      ) =>
                        total +
                        Number(
                          bottle.reservedUnitCount
                        ),
                      0
                    );
   
                  const totalAvailable =
                    Math.max(
                      0,
                      totalRemaining -
                        totalReserved
                    );
   
                  return (
                    <article
                      key={
                        product.id
                      }
                      className="overflow-hidden rounded-3xl border border-[#DED4C9] bg-white shadow-sm">
   
                      <div className="border-b border-[#E9E1D8] p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8B6F58]">
                              {product.brand}
                            </p>
   
                            <h2 className="mt-1 text-xl font-semibold text-[#26211D]">
                              {product.productName}
                            </h2>
   



                            <p className="mt-2 text-sm text-[#665C54]">
                              {product.dosage ??
                                "Dosage not recorded"}
                              {product.form
                                ? ` · ${product.form}`
                                : ""}
                            </p>




                            <div className="mt-3">
 {matchingOrderItems.length >
 0 ? (
   <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
     Matches {matchingOrderItems.length} existing order{" "}
     {matchingOrderItems.length ===
     1
       ? "item"
       : "items"}
   </span>
 ) : (
   <div>
     <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
       No exact order-item match
     </span>

     {sameBrandOrderItems.length >
     0 ? (
       <div className="mt-3 rounded-xl border border-[#E6DED5] bg-[#FCFAF7] p-3">
         <p className="text-xs font-semibold uppercase tracking-wide text-[#766B62]">
           Existing order items from this brand
         </p>

         <div className="mt-2 space-y-2">
           {sameBrandOrderItems.map(
             (
               orderItem
             ) => (
               <div
                 key={
                   orderItem.id
                 }
                 className="text-sm text-[#302A25]">

                 <p className="font-medium">
                   {orderItem.productName}
                 </p>

                 <p className="mt-0.5 text-xs text-[#766B62]">
                   {orderItem.dosage ??
                     "No dosage"}
                   {" · "}
                   {orderItem.form ??
                     "No form"}
                   {" · "}
                   {orderItem.unitLabel}
                 </p>
               </div>
             )
           )}
         </div>
       </div>
     ) : null}
   </div>
 )}
</div>





                          </div>
   
                          <div className="grid grid-cols-3 gap-4 text-sm md:text-right">
                            <div>
                              <p className="text-[#766B62]">
                                Available
                              </p>
   
                              <p className="mt-1 font-semibold text-[#26211D]">
                                {totalAvailable.toFixed(
                                  0
                                )}
                              </p>
                            </div>
   
                            <div>
                              <p className="text-[#766B62]">
                                Reserved
                              </p>
   
                              <p className="mt-1 font-semibold text-[#26211D]">
                                {totalReserved.toFixed(
                                  0
                                )}
                              </p>
                            </div>
   
                            <div>
                              <p className="text-[#766B62]">
                                Bottles
                              </p>
   
                              <p className="mt-1 font-semibold text-[#26211D]">
                                {product.bottles.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
   
                      <div className="p-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-[#E9E1D8] text-[#766B62]">
                                <th className="pb-3 pr-5 font-medium">
                                  Bottle ID
                                </th>
   
                                <th className="pb-3 pr-5 font-medium">
                                  Status
                                </th>
   
                                <th className="pb-3 pr-5 font-medium">
                                  Lot
                                </th>
   
                                <th className="pb-3 pr-5 font-medium">
                                  Available
                                </th>
   
                                <th className="pb-3 pr-5 font-medium">
                                  Reserved
                                </th>
   
                                <th className="pb-3 pr-5 font-medium">
                                  Landed cost
                                </th>
                              </tr>
                            </thead>
   
                            <tbody>
                              {product.bottles.map(
                                (
                                  bottle
                                ) => (
                                  <tr
                                    key={
                                      bottle.id
                                    }
                                    className="border-b border-[#F0EAE4] last:border-b-0">
   
                                    <td className="py-3 pr-5 font-medium text-[#26211D]">
                                      {bottle.bottleCode}
                                    </td>
   



                                    <td className="py-3 pr-5">
 <InventoryBottleStatusControl
   bottleId={
     bottle.id
   }
   currentStatus={
     bottle.status
   }
 />
</td>




   
                                    <td className="py-3 pr-5 text-[#665C54]">
                                      {bottle.manufacturerLotNumber ??
                                        "—"}
                                    </td>
   



                                    <td className="py-3 pr-5 text-[#665C54]">
 {Math.max(
   0,
   Number(
     bottle.remainingUnitCount
   ) -
     Number(
       bottle.reservedUnitCount
     )
 ).toFixed(
   0
 )}
</td>




   
                                    <td className="py-3 pr-5 text-[#665C54]">
                                      {bottle.reservedUnitCount.toString()}
                                    </td>
   
                                    <td className="py-3 pr-5 text-[#665C54]">
                                      {formatMoney(
                                        Number(
                                          bottle.landedCost
                                        )
                                      )}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </article>
                  );
                }
              )
            )}
          </section>
        </div>
      </main>
    );
   }