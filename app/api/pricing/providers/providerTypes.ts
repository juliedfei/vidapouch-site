import type { RetailProduct } from "@/lib/pricing/types";

export type ProductSearchRequest = {
 supplement: string;
 brand?: string;
 dosage?: string;
};

export type ProductProviderResult = {
 provider: string;

 products: RetailProduct[];
};

export interface ProductProvider {
 readonly name: string;

 search(
   request: ProductSearchRequest
 ): Promise<ProductProviderResult>;
}
