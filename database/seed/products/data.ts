import type { ProductSeed } from "./types";

export const products: ProductSeed[] = [
 {
   canonicalTitle:
     "NOW Magnesium Glycinate 200 mg",

   brand: "NOW",

   form: "CAPSULE",

   unitsPerContainer: 180,

   servingSize: 2,

   ingredients: [
     {
       supplement:
         "Magnesium Glycinate",

       amount: 200,

       unit: "mg",

       amountBasis: "SERVING",

       isPrimary: true,
     },
   ],
 },

 {
   canonicalTitle:
     "Nature Made Vitamin D3 2000 IU",

   brand: "Nature Made",

   form: "SOFTGEL",

   unitsPerContainer: 250,

   servingSize: 1,

   ingredients: [
     {
       supplement:
         "Vitamin D3",

       amount: 2000,

       unit: "IU",

       amountBasis: "SOFTGEL",

       isPrimary: true,
     },
   ],
 },
];