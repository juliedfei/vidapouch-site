import type { ProductOption } from "./productOption";

export type ProductComparison = {
 products: ProductOption[];
};

export function buildProductComparison(
 products: ProductOption[]
): ProductComparison {
 return {
   products,
 };
}
