import type { RetailProduct } from "./types";

export function selectBestProduct(
 products: RetailProduct[]
): RetailProduct | null {
 if (products.length === 0) return null;

 const scored = [...products].sort((a, b) => {
   const aPricePerServing =
     a.bottlePrice /
     (a.capsulesPerBottle / a.servingSize);

   const bPricePerServing =
     b.bottlePrice /
     (b.capsulesPerBottle / b.servingSize);

   return aPricePerServing - bPricePerServing;
 });

 const best = {
   ...scored[0],
   recommended: true,
   recommendationReason:
     "Best value per serving",
 };

 return best;
}
