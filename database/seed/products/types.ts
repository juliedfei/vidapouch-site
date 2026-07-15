export type ProductSeed = {
    canonicalTitle: string;
   
    brand: string;
   
    form:
      | "CAPSULE"
      | "TABLET"
      | "SOFTGEL"
      | "CAPLET"
      | "OTHER";
   
    unitsPerContainer: number;
   
    servingSize: number;
   
    ingredients: {
      supplement: string;
   
      amount: number;
   
      unit: string;
   
      amountBasis:
        | "CAPSULE"
        | "TABLET"
        | "SOFTGEL"
        | "CAPLET"
        | "SERVING";
   
      isPrimary?: boolean;
    }[];
   };