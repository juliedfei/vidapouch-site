import { mockProducts } from "../data/mockProducts";
import type { ProductOption } from "@/lib/recommendations/productOption";

export async function searchProducts(
 query: string
): Promise<ProductOption[]> {
 const normalized = query.trim().toLowerCase();

 if (!normalized) {
   return mockProducts;
 }

 return mockProducts.filter((product) => {
   return (
     product.productName
       .toLowerCase()
       .includes(normalized) ||

     product.brand
       .toLowerCase()
       .includes(normalized) ||

     product.representativeProduct.supplement
       .toLowerCase()
       .includes(normalized)
   );
 });
}
