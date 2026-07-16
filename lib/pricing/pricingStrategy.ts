export type ServiceAllocationMode =
 | "transparent"
 | "fixed"
 | "percentage"
 | "fully_bundled";

export type PricingStrategy = {
 /*
  * Visible concierge fees before any
  * amount is moved into supplement prices.
  */
 morningConciergeFee: number;
 eveningConciergeFee: number;
 dualConciergeFee: number;

 /*
  * Controls how much of the concierge fee
  * is allocated into supplement pricing.
  */
 serviceAllocationMode:
   ServiceAllocationMode;

 /*
  * Used when the allocation mode is
  * "fixed".
  *
  * Example:
  * Move $30 of the concierge fee into
  * the displayed supplement prices.
  */
 fixedServiceAllocation: number;

 /*
  * Used when the allocation mode is
  * "percentage".
  *
  * Stored as a decimal:
  * 0.5 = 50%
  */
 serviceAllocationPercent: number;

 /*
  * Protects VitaPouch from vendor price
  * changes and sourcing uncertainty.
  *
  * Stored as a decimal:
  * 0.1 = 10%
  */
 inventoryBufferPercent: number;

 /*
  * Additional margin applied to the
  * supplement portion.
  *
  * Stored as a decimal:
  * 0.2 = 20%
  */
 supplementMarginPercent: number;
};

export const DEFAULT_PRICING_STRATEGY:
 PricingStrategy = {
   morningConciergeFee: 69.99,
   eveningConciergeFee: 69.99,
   dualConciergeFee: 89.99,

   /*
    * Start fully transparent.
    * No concierge cost is moved into
    * supplement pricing yet.
    */
   serviceAllocationMode:
     "transparent",

   fixedServiceAllocation: 0,

   serviceAllocationPercent: 0,

   inventoryBufferPercent: 0.1,

   supplementMarginPercent: 0,
 };