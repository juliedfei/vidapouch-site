export type RetailProduct = {
  retailer: string;
 
  brand: string;
 
  supplement: string;
 
  dosage: string;
 
  bottlePrice: number;
 
  capsulesPerBottle: number;
 
  servingSize: number;
 
  estimatedShipping?: number;
 
  url?: string;
 
  imageUrl?: string;
 
  /*
   * These claims are optional because
   * an absent claim means unknown,
   * not false.
   */
  nsfCertified?: boolean;
 
  uspVerified?: boolean;
 
  vegan?: boolean;
 
  nonGmo?: boolean;
 
  glutenFree?: boolean;
 
  thirdPartyTested?: boolean;
 };
 
 export type MonthlyPriceEstimate = {
  monthlyCost: number;
 
  bottleCost: number;
 
  bottlesPerMonth: number;
 
  confidence:
    | "high"
    | "medium"
    | "low";
 
  retailer?: string;
 
  product?: RetailProduct;
 };
 