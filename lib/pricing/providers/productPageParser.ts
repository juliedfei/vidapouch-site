export type ParsedProductDetails = {
    brand?: string;
    dosage?: string;
    capsulesPerBottle?: number;
    servingSize?: number;
   };
   
   export function parseProductPage(
    html: string
   ): ParsedProductDetails {
    void html;
   
    return {};
   }