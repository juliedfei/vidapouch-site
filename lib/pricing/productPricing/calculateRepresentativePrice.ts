import type {
    RetailProduct,
   } from "../types";
   
   import {
    calculatePerCapsuleCost,
   } from "./calculatePerCapsuleCost";
   
   export type RepresentativePricing = {
   
    lowestPerCapsuleCost: number;
   
    averagePerCapsuleCost: number;
   
    medianPerCapsuleCost: number;
   
    highestPerCapsuleCost: number;
   
   };
   
   function roundCurrency(
    value: number
   ) {
    return Math.round(value * 10000) / 10000;
   }
   
   function median(
    values: number[]
   ) {
   
    const sorted =
      [...values].sort(
        (a, b) => a - b
      );
   
    const middle =
      Math.floor(
        sorted.length / 2
      );
   
    if (
      sorted.length % 2 === 0
    ) {
      return (
        sorted[middle - 1] +
        sorted[middle]
      ) / 2;
    }
   
    return sorted[middle];
   }
   
   export function calculateRepresentativePrice(
    listings: RetailProduct[]
   ): RepresentativePricing {
   
    const perCapsuleCosts =
      listings
        .map(
          calculatePerCapsuleCost
        )
        .sort(
          (a, b) => a - b
        );
   
    const lowest =
      perCapsuleCosts[0];
   
    const highest =
      perCapsuleCosts[
        perCapsuleCosts.length - 1
      ];
   
    const average =
      perCapsuleCosts.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      perCapsuleCosts.length;
   
    const medianValue =
      median(
        perCapsuleCosts
      );
   
    return {
   
      lowestPerCapsuleCost:
        roundCurrency(lowest),
   
      averagePerCapsuleCost:
        roundCurrency(average),
   
      medianPerCapsuleCost:
        roundCurrency(medianValue),
   
      highestPerCapsuleCost:
        roundCurrency(highest),
   
    };
   
   }