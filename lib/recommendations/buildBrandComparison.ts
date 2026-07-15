import type { BrandOption } from "./brandOption";

export type BrandComparison = {
 brands: BrandOption[];
};

export function buildBrandComparison(
 brands: BrandOption[]
): BrandComparison {
 return {
   brands,
 };
}