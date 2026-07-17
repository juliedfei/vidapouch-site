"use client";

import { useState } from "react";

export function usePouch() {
 const [selectedProducts, setSelectedProducts] =
   useState<string[]>([]);

 function addProduct(id: string) {
   setSelectedProducts((previous) => {
     if (previous.includes(id)) {
       return previous;
     }

     return [...previous, id];
   });
 }

 function removeProduct(id: string) {
   setSelectedProducts((previous) =>
     previous.filter((item) => item !== id)
   );
 }

 return {
   selectedProducts,
   addProduct,
   removeProduct,
 };
}