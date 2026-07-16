import type {
    RetailProduct,
   } from "../types";
   
   function roundCurrency(
    value: number
   ) {
    return Math.round(value * 10000) / 10000;
   }
   
   /*
   * Returns the true landed cost of one capsule.
   *
   * This normalizes products that contain
   * different bottle sizes.
   */
   export function calculatePerCapsuleCost(
    product: RetailProduct
   ) {
   
    const landedBottleCost =
      product.bottlePrice +
      (product.estimatedShipping ?? 0);
   
    return roundCurrency(
      landedBottleCost /
        product.capsulesPerBottle
    );
   
   }