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

   import ProfitSettingsActions from "@/components/admin/ProfitSettingsActions";

   import ProfitRowCostActions from "@/components/admin/ProfitRowCostActions";
   
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
   



   function formatPercent(
    value:
      number
   ) {
    return new Intl.NumberFormat(
      "en-US",
      {
        style:
          "percent",
   
        minimumFractionDigits:
          1,
   
        maximumFractionDigits:
          1,
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
        month:
          "short",
   
        day:
          "numeric",
   
        year:
          "numeric",
      }
    ).format(
      value
    );
   }




   function getBoxType(
    items:
      {
        timing:
          string;
      }[]
   ) {
    const hasMorning =
      items.some(
        (
          item
        ) =>
          item.timing
            .trim()
            .toUpperCase() ===
          "MORNING"
      );
   
    const hasEvening =
      items.some(
        (
          item
        ) =>
          item.timing
            .trim()
            .toUpperCase() ===
          "EVENING"
      );
   
    if (
      hasMorning &&
      hasEvening
    ) {
      return "Dual";
    }
   
    if (
      hasMorning
    ) {
      return "Single · Morning";
    }
   
    if (
      hasEvening
    ) {
      return "Single · Evening";
    }
   
    return "Timing not assigned";
   }



   function getPouchCount(
    items:
      {
        timing:
          string;
      }[]
   ) {
    const hasMorning =
      items.some(
        (
          item
        ) =>
          item.timing
            .trim()
            .toUpperCase() ===
          "MORNING"
      );
   
    const hasEvening =
      items.some(
        (
          item
        ) =>
          item.timing
            .trim()
            .toUpperCase() ===
          "EVENING"
      );
   
    if (
      hasMorning &&
      hasEvening
    ) {
      return 60;
    }
   
    if (
      hasMorning ||
      hasEvening
    ) {
      return 30;
    }
   
    return 0;
   }
   




   
   export default async function AdminProfitPage() {
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
   

    const savedProfitSettingsVersions =
    await prisma
      .vidaPouchProfitSettings
      .findMany({
        orderBy: {
          effectiveFrom:
            "asc",
        },
      });
   
   const activeProfitSettings =
    savedProfitSettingsVersions.findLast(
      (
        settings
      ) =>
        settings.active
    ) ??
    savedProfitSettingsVersions.at(
      -1
    ) ??
    null;
   
   function convertProfitSettings(
    settings:
      typeof activeProfitSettings
   ) {
    return {
      pouchCost:
        Number(
          settings?.pouchCost ??
          0
        ),
   
      singleBoxCost:
        Number(
          settings?.singleBoxCost ??
          0
        ),
   
      dualBoxCost:
        Number(
          settings?.dualBoxCost ??
          0
        ),
   
      insertCost:
        Number(
          settings?.insertCost ??
          0
        ),
   
      labelCost:
        Number(
          settings?.labelCost ??
          0
        ),
   
      laborHourlyRate:
        Number(
          settings?.laborHourlyRate ??
          0
        ),
   
      laborMinutesPerOrder:
        Number(
          settings?.laborMinutesPerOrder ??
          0
        ),
   
      otherPackagingCost:
        Number(
          settings?.otherPackagingCost ??
          0
        ),
    };
   }
   
   const profitSettings =
    convertProfitSettings(
      activeProfitSettings
    );
   
   function getProfitSettingsForDate(
    fulfillmentDate:
      Date
   ) {
    const matchingSettings =
      savedProfitSettingsVersions
        .filter(
          (
            settings
          ) =>
            settings.effectiveFrom <=
              fulfillmentDate &&
            (
              !settings.retiredAt ||
              settings.retiredAt >
                fulfillmentDate
            )
        )
       
       
        .at(
          -1
        ) ??
      savedProfitSettingsVersions
        .filter(
          (
            settings
          ) =>
            settings.effectiveFrom <=
            fulfillmentDate
        )
        
        
        .at(
            -1
           ) ??
           savedProfitSettingsVersions.at(
            0
           ) ??
           activeProfitSettings;


   
    return convertProfitSettings(
      matchingSettings
    );
   }
   

   const pricingPlans =
   await prisma
     .vidaPouchPlan
     .findMany({
       select: {
         planKey:
           true,
  
         pricingVersionId:
           true,
  
         pooledCostAllowance:
           true,
       },
     });
  
  const planAllowanceByVersion =
   new Map(
     pricingPlans.map(
       (
         plan
       ) => [
         `${plan.pricingVersionId}:${plan.planKey}`,
  
         plan.pooledCostAllowance ===
         null
           ? null
           : Number(
               plan.pooledCostAllowance
             ),
       ]
     )
   );

   const paidOrders =
   await prisma
     .vidaPouchOrder
     .findMany({
       where: {
         status:
           "PAID",
       },
  
       orderBy: {
         createdAt:
           "desc",
       },
  


include: {
 items: {
   select: {
     timing:
       true,
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
   
        select: {
          totalCostSnapshot:
            true,
   
          consumedAt:
            true,
        },
      },
   
      costs:
        true,
    },
   },
   





       },
     });
  





   
     const rows =
     paidOrders.flatMap(
       (
         order
       ) => {
         type FulfillmentRun =
           typeof order
             .fulfillmentRuns[number];
    
         function buildRow({
           id,
           run,
           revenue,
           
           
           createdAt,
           costSettingsDate,
           fulfillmentStatus,
           cycleLabel,
           }: {



           id:
             string;
    
           run:
             FulfillmentRun |
             null;
    
           revenue:
             number;
    



             createdAt:
             Date;
            
            costSettingsDate:
             Date;
            
            fulfillmentStatus:
             string;



    
           cycleLabel:
             string;
         }) {
           


const rowProfitSettings =
 getProfitSettingsForDate(
   costSettingsDate
 );
           
        
 

 const planAllowance =
 order.pricingVersionId
   ? planAllowanceByVersion.get(
       `${order.pricingVersionId}:${order.planKey}`
     ) ??
     null
   : null;
           
           
            const supplementCost =
             run?.allocations.reduce(
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
             ) ??
             0;
    
           const boxType =
             getBoxType(
               order.items
             );
    
           const pouchCount =
             getPouchCount(
               order.items
             );
    



             const pouchUnitCost =
             run?.pouchCostOverride ===
             null ||
             run?.pouchCostOverride ===
             undefined
               ? rowProfitSettings.pouchCost
               : Number(
                   run.pouchCostOverride
                 );
            
            const boxUnitCost =
             run?.boxCostOverride ===
             null ||
             run?.boxCostOverride ===
             undefined
               ? boxType ===
                 "Dual"
                 ? rowProfitSettings.dualBoxCost
                 : boxType ===
                     "Single · Morning" ||
                   boxType ===
                     "Single · Evening"
                   ? rowProfitSettings.singleBoxCost
                   : 0
               : Number(
                   run.boxCostOverride
                 );
            
            const insertCost =
             run?.insertCostOverride ===
             null ||
             run?.insertCostOverride ===
             undefined
               ? rowProfitSettings.insertCost
               : Number(
                   run.insertCostOverride
                 );
            
            const labelCost =
             run?.labelCostOverride ===
             null ||
             run?.labelCostOverride ===
             undefined
               ? rowProfitSettings.labelCost
               : Number(
                   run.labelCostOverride
                 );
            
            const otherPackagingCost =
             run?.otherPackagingCostOverride ===
             null ||
             run?.otherPackagingCostOverride ===
             undefined
               ? rowProfitSettings.otherPackagingCost
               : Number(
                   run.otherPackagingCostOverride
                 );
            
            const laborHourlyRate =
             run?.laborHourlyRateOverride ===
             null ||
             run?.laborHourlyRateOverride ===
             undefined
               ? rowProfitSettings.laborHourlyRate
               : Number(
                   run.laborHourlyRateOverride
                 );
            
            const laborMinutesPerOrder =
             run?.laborMinutesPerOrderOverride ===
             null ||
             run?.laborMinutesPerOrderOverride ===
             undefined
               ? rowProfitSettings.laborMinutesPerOrder
               : Number(
                   run.laborMinutesPerOrderOverride
                 );
            
            const pouchCost =
             pouchCount *
             pouchUnitCost;
            
            const boxCost =
             boxUnitCost;
            
            const packagingCost =
             pouchCost +
             boxCost +
             insertCost +
             labelCost +
             otherPackagingCost;
            
            const laborCost =
             laborHourlyRate *
             (
               laborMinutesPerOrder /
               60
             );
            
            
            





    
           const shippingCost =
             (
               run?.costs ??
               []
             )
               .filter(
                 (
                   cost
                 ) =>
                   cost.costType ===
                   "SHIPPING"
               )
               .reduce(
                 (
                   total,
                   cost
                 ) =>
                   total +
                   Number(
                     cost.amount
                   ),
                 0
               );
    
           const paymentProcessingCost =
             (
               run?.costs ??
               []
             )
               .filter(
                 (
                   cost
                 ) =>
                   cost.costType ===
                   "PAYMENT_PROCESSING"
               )
               .reduce(
                 (
                   total,
                   cost
                 ) =>
                   total +
                   Number(
                     cost.amount
                   ),
                 0
               );
    
           const otherCost =
             (
               run?.costs ??
               []
             )
               .filter(
                 (
                   cost
                 ) =>
                   cost.costType ===
                   "OTHER"
               )
               .reduce(
                 (
                   total,
                   cost
                 ) =>
                   total +
                   Number(
                     cost.amount
                   ),
                 0
               );
    
           const totalVariableCost =
             supplementCost +
             packagingCost +
             laborCost +
             shippingCost +
             paymentProcessingCost +
             otherCost;
    
           const grossProfit =
             revenue -
             totalVariableCost;
    
           const grossMargin =
             revenue >
             0
               ? grossProfit /
                 revenue
               : 0;
    
               return {
                id,
               


                fulfillmentRunId:
                  run?.id ??
                  null,

                  pouchCostOverride:
                  run?.pouchCostOverride ===
                  null ||
                  run?.pouchCostOverride ===
                  undefined
                    ? null
                    : Number(
                        run.pouchCostOverride
                      ),
                 
                 boxCostOverride:
                  run?.boxCostOverride ===
                  null ||
                  run?.boxCostOverride ===
                  undefined
                    ? null
                    : Number(
                        run.boxCostOverride
                      ),
                 
                 insertCostOverride:
                  run?.insertCostOverride ===
                  null ||
                  run?.insertCostOverride ===
                  undefined
                    ? null
                    : Number(
                        run.insertCostOverride
                      ),
                 
                 labelCostOverride:
                  run?.labelCostOverride ===
                  null ||
                  run?.labelCostOverride ===
                  undefined
                    ? null
                    : Number(
                        run.labelCostOverride
                      ),
                 
                 otherPackagingCostOverride:
                  run?.otherPackagingCostOverride ===
                  null ||
                  run?.otherPackagingCostOverride ===
                  undefined
                    ? null
                    : Number(
                        run.otherPackagingCostOverride
                      ),
                 
                 laborHourlyRateOverride:
                  run?.laborHourlyRateOverride ===
                  null ||
                  run?.laborHourlyRateOverride ===
                  undefined
                    ? null
                    : Number(
                        run.laborHourlyRateOverride
                      ),
                 
                 laborMinutesPerOrderOverride:
                  run?.laborMinutesPerOrderOverride ===
                  null ||
                  run?.laborMinutesPerOrderOverride ===
                  undefined
                    ? null
                    : Number(
                        run.laborMinutesPerOrderOverride
                      ),
                 
                 orderId:
                  order.id,









    
             customerName:
               order.customerName,
    
             customerEmail:
               order.customerEmail,
    


             planName:
               order.planName,


               planAllowance,

               supplementAllowanceVariance:
                planAllowance ===
                null
                  ? null
                  : planAllowance -
                    supplementCost,
               



    
             boxType,
    
             pouchCount,
    
             purchaseOption:
               order.purchaseOption,
    
             fulfillmentStatus,
    
             inventoryStatus:
               run?.status ??
               "PENDING",
    
             createdAt,
    
             cycleLabel,
    
             revenue,
    
             supplementCost,
    
             packagingCost,
    
             laborCost,
    
             shippingCost,
    
             paymentProcessingCost,
    
             otherCost,
    
             totalVariableCost,
    
             grossProfit,
    
             grossMargin,
           };
         }
    
         const initialRun =
           order.fulfillmentRuns.find(
             (
               run
             ) =>
               run.billingCycleId ===
               null
           ) ??
           null;
    
         const initialRow =
           buildRow({
             id:
               `initial-${order.id}`,
    
             run:
               initialRun,
    
             revenue:
               Number(
                 order.totalPrice
               ),
    



               createdAt:
               order.createdAt,
              
              costSettingsDate:
               initialRun?.createdAt ??
               order.createdAt,
              
              fulfillmentStatus:
               order.fulfillmentStatus,
              




    
             cycleLabel:
               "Initial order",
           });
    
         const paidRenewalRuns =
           order.fulfillmentRuns.filter(
             (
               run
             ) =>
               run.billingCycleId !==
                 null &&
               run.billingCycle
                 ?.status ===
                 "PAID"
           );
    
         const renewalRows =
           paidRenewalRuns.map(
             (
               run,
               index
             ) =>
               buildRow({
                 id:
                   run.id,
    
                 run,
    
                 revenue:
                   Number(
                     run.billingCycle
                       ?.amountPaid ??
                     run.revenueAmount
                   ),
    


                   createdAt:
                   run.billingCycle
                     ?.targetDeliveryDate ??
                   run.billingCycle
                     ?.periodStart ??
                   run.billingCycle
                     ?.paidAt ??
                   run.createdAt,
                  
                  costSettingsDate:
                   run.billingCycle
                     ?.paidAt ??
                   run.createdAt,
                  
                  fulfillmentStatus:
                   run.fulfillmentStatus,



    
                 cycleLabel:
                   `Renewal · Cycle ${index + 2}`,
               })
           );
    
         return [
           initialRow,
           ...renewalRows,
         ];
       }
     );
   










    const totals =
      rows.reduce(
        (
          result,
          row
        ) => {
          result.revenue +=
            row.revenue;
   
          result.supplementCost +=
            row.supplementCost;
   
          result.variableCost +=
            row.totalVariableCost;
   
          result.grossProfit +=
            row.grossProfit;
   
          return result;
        },
        {
          revenue:
            0,
   
          supplementCost:
            0,
   
          variableCost:
            0,
   
          grossProfit:
            0,
        }
      );
   
    const overallGrossMargin =
      totals.revenue >
      0
        ? totals.grossProfit /
          totals.revenue
        : 0;
   
    return (
      <main className="min-h-screen bg-[#F7F3EE] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col gap-5">
            
            
            
            
          <div className="flex items-start justify-between gap-4">
 <div>
   <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
     VidaPouch Admin
   </p>

   <h1 className="mt-2 text-3xl font-semibold text-[#26211D]">
     Profit Tracker
   </h1>

   <p className="mt-2 text-[#665C54]">
     Track revenue, costs, profit, and margin across VidaPouch fulfillment.
   </p>
 </div>

 <ProfitSettingsActions
   settings={
     profitSettings
   }
 />
</div>






   
            <AdminNavigation
              currentPage="profit"
            />
          </div>
   
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Revenue
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {formatMoney(
                  totals.revenue
                )}
              </p>
            </div>
   
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Variable costs
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {formatMoney(
                  totals.variableCost
                )}
              </p>
            </div>
   
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Gross profit
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {formatMoney(
                  totals.grossProfit
                )}
              </p>
            </div>
   
            <div className="rounded-2xl border border-[#DED4C9] bg-white p-5">
              <p className="text-sm text-[#665C54]">
                Gross margin
              </p>
   
              <p className="mt-2 text-3xl font-semibold text-[#26211D]">
                {formatPercent(
                  overallGrossMargin
                )}
              </p>
            </div>
          </section>
   
          <section className="mt-8 overflow-hidden rounded-3xl border border-[#DED4C9] bg-white shadow-sm">
            <div className="border-b border-[#E9E1D8] px-6 py-5">
              <h2 className="text-xl font-semibold text-[#26211D]">
                Fulfillment profitability
              </h2>
            </div>
   
            {rows.length ===
            0 ? (
              <div className="p-10 text-center text-sm text-[#665C54]">
                No fulfillment runs are available yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E9E1D8] text-[#766B62]">
                      
                      
                      
                    <th className="px-5 py-3 font-medium">
 Customer
</th>

<th className="px-5 py-3 font-medium">
 Plan / box
</th>

<th className="px-5 py-3 font-medium">
 Order
</th>

<th className="px-5 py-3 font-medium">
 Revenue
</th>




   
                      <th className="px-5 py-3 font-medium">
                        Supplements
                      </th>
   

                      <th className="px-5 py-3 font-medium">
 Plan allowance
</th>

<th className="px-5 py-3 font-medium">
 Allowance variance
</th>




                      <th className="px-5 py-3 font-medium">
 Packaging
</th>

<th className="px-5 py-3 font-medium">
 Labor
</th>

<th className="px-5 py-3 font-medium">
 Shipping
</th>




   
                      <th className="px-5 py-3 font-medium">
                        Processing
                      </th>
   
                      <th className="px-5 py-3 font-medium">
                        Other
                      </th>
   
                      <th className="px-5 py-3 font-medium">
                        Gross profit
                      </th>
   
                      <th className="px-5 py-3 font-medium">
                        Margin
                      </th>

                      <th className="px-5 py-3 text-right font-medium">
 Costs
</th>



                    </tr>
                  </thead>
   
                  <tbody>
                    {rows.map(
                      (
                        row
                      ) => (
                        <tr
                          key={
                            row.id
                          }
                          className="border-b border-[#F0EAE4] last:border-b-0">
   
   
                          <td className="px-5 py-4">
                            <p className="font-medium text-[#26211D]">
                              {row.customerName ??
                                "Customer"}
                            </p>
   
                            <p className="mt-1 text-xs text-[#766B62]">
                              {row.customerEmail ??
                                row.orderId}
                            </p>
                          </td>
   



                          <td className="px-5 py-4">
 <p className="font-medium text-[#26211D]">
   {row.planName}
 </p>

 <p className="mt-1 text-xs text-[#766B62]">
   {row.boxType}
 </p>

 <p className="mt-1 text-xs text-[#766B62]">
   {row.purchaseOption ===
   "SUBSCRIPTION"
     ? "Subscription"
     : "One-time"}
 </p>
</td>





<td className="px-5 py-4">
 <p className="font-medium text-[#26211D]">
   {row.cycleLabel}
 </p>

 <p className="mt-1 text-xs text-[#766B62]">
   {formatDate(
     row.createdAt
   )}
 </p>

 <p className="mt-1 text-xs font-medium text-[#766B62]">
   {row.fulfillmentStatus
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
     )}
 </p>
</td>







<td className="px-5 py-4 font-medium text-[#26211D]">
 {formatMoney(
   row.revenue
 )}
</td>






   
                          <td className="px-5 py-4 text-[#665C54]">
                            {formatMoney(
                              row.supplementCost
                            )}
                          </td>


                          <td className="px-5 py-4 text-[#665C54]">
 {row.planAllowance ===
 null
   ? "—"
   : formatMoney(
       row.planAllowance
     )}
</td>

<td className="px-5 py-4">
 {row.supplementAllowanceVariance ===
 null ? (
   <span className="text-[#9A8E84]">
     —
   </span>
 ) : (
   <span
     className={
       row.supplementAllowanceVariance >=
       0
         ? "font-medium text-green-700"
         : "font-medium text-red-700"
     }
>
     {row.supplementAllowanceVariance >=
     0
       ? "+"
       : ""}
     {formatMoney(
       row.supplementAllowanceVariance
     )}
   </span>
 )}
</td>
   



                          <td className="px-5 py-4 text-[#665C54]">
 {formatMoney(
   row.packagingCost
 )}

 <p className="mt-1 whitespace-nowrap text-[11px] text-[#9A8E84]">
   {row.pouchCount} pouches
 </p>
</td>

<td className="px-5 py-4 text-[#665C54]">
 {formatMoney(
   row.laborCost
 )}
</td>

<td className="px-5 py-4 text-[#665C54]">
 {formatMoney(
   row.shippingCost
 )}
</td>




   
                          <td className="px-5 py-4 text-[#665C54]">
                            {formatMoney(
                              row.paymentProcessingCost
                            )}
                          </td>
   
                          <td className="px-5 py-4 text-[#665C54]">
                            {formatMoney(
                              row.otherCost
                            )}
                          </td>
   
                          <td className="px-5 py-4 font-semibold text-[#26211D]">
                            {formatMoney(
                              row.grossProfit
                            )}
                          </td>
   
                          <td className="px-5 py-4 font-semibold text-[#26211D]">
                            {formatPercent(
                              row.grossMargin
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
 
 
 
                          <ProfitRowCostActions
 fulfillmentRunId={
   row.fulfillmentRunId
 }

 shippingCost={
   row.shippingCost
 }

 paymentProcessingCost={
   row.paymentProcessingCost
 }

 otherCost={
   row.otherCost
 }

 pouchCostOverride={
   row.pouchCostOverride
 }

 boxCostOverride={
   row.boxCostOverride
 }

 insertCostOverride={
   row.insertCostOverride
 }

 labelCostOverride={
   row.labelCostOverride
 }

 otherPackagingCostOverride={
   row.otherPackagingCostOverride
 }

 laborHourlyRateOverride={
   row.laborHourlyRateOverride
 }

 laborMinutesPerOrderOverride={
   row.laborMinutesPerOrderOverride
 }
/>





</td>




                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    );
   }