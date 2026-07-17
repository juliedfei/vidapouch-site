"use client";

import { useMemo, useState } from "react";

import { mockProducts } from "../data/mockProducts";

export function useSearch() {
 const [query, setQuery] = useState("Magnesium");

 const results = useMemo(() => {
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
 }, [query]);

 return {
   query,
   setQuery,
   results,
 };
}
