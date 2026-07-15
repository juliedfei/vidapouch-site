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
   };
   
   export type MonthlyPriceEstimate = {
    monthlyCost: number;
   
    bottleCost: number;
   
    bottlesPerMonth: number;
   
    confidence: "high" | "medium" | "low";
   
    retailer?: string;
   
    product?: RetailProduct;
   };