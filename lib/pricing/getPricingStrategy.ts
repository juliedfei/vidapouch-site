import { prisma } from "@/lib/db";

import type {
 PricingStrategy,
} from "./pricingStrategy";

import {
 DEFAULT_PRICING_STRATEGY,
} from "./pricingStrategy";

export async function getPricingStrategy():
Promise<PricingStrategy> {

 const strategy =
   await prisma.pricingStrategy.findFirst({
     where: {
       active: true,
     },

     orderBy: {
       updatedAt: "desc",
     },
   });

 if (!strategy) {
   return DEFAULT_PRICING_STRATEGY;
 }

 return {
   morningConciergeFee:
     Number(strategy.morningConciergeFee),

   eveningConciergeFee:
     Number(strategy.eveningConciergeFee),

   dualConciergeFee:
     Number(strategy.dualConciergeFee),

   serviceAllocationMode:
     strategy.serviceAllocationMode as
       PricingStrategy["serviceAllocationMode"],

   fixedServiceAllocation:
     Number(strategy.fixedServiceAllocation),

   serviceAllocationPercent:
     Number(strategy.serviceAllocationPercent),

   inventoryBufferPercent:
     Number(strategy.inventoryBufferPercent),

   supplementMarginPercent:
     Number(strategy.supplementMarginPercent),
 };
}