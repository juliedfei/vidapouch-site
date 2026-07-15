import { findProducts } from "./findProducts";

import type {
 RetailProduct,
} from "./types";

export type SupplementValidationResult =
 | {
     valid: true;
     products: RetailProduct[];
   }
 | {
     valid: false;
     message: string;
     products: [];
   };

type ValidateSupplementInput = {
 supplement: string;
 brand?: string;
 dosage?: string;
};

export async function validateSupplement({
 supplement,
 brand,
 dosage,
}: ValidateSupplementInput): Promise<SupplementValidationResult> {
 const products = await findProducts({
   supplement,
   brand,
   dosage,
 });

 if (products.length > 0) {
   return {
     valid: true,
     products,
   };
 }

 const cleanSupplement = supplement.trim();

 const cleanBrand = brand?.trim();

 return {
   valid: false,
   message: cleanBrand
     ? `${cleanBrand} does not appear to offer ${cleanSupplement}. Please choose another brand.`
     : `We couldn't find ${cleanSupplement}. Please review the supplement name or choose another brand.`,
   products: [],
 };
}