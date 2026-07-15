export type CatalogIngredient = {
    supplementId: string;
   
    canonicalName: string;
   
    amount: number | null;
   
    unit: string | null;
   
    amountBasis:
      | "CAPSULE"
      | "TABLET"
      | "SOFTGEL"
      | "CAPLET"
      | "SERVING"
      | "CONTAINER"
      | null;
   
    isPrimary: boolean;
   };
   
   export type CatalogListing = {
    id: string;
   
    retailerId: string;
   
    retailerName: string;
   
    listingTitle: string;
   
    url: string | null;
   
    bottlePrice: number | null;
   
    shipping: number | null;
   
    currency: string;
   
    inStock: boolean | null;
   
    sellerName: string | null;
   
    sellerVerified: boolean | null;
   
    lastSeenAt: string;
   
    averageRating: number | null;
   
    reviewCount: number | null;
   };
   
   export type CatalogBrand = {
    id: string;
   
    canonicalName: string;
   
    practitionerGrade: boolean | null;
   
    thirdPartyTestingProgram: boolean | null;
   
    cgmpCertified: boolean | null;
   
    veganOptions: boolean | null;
   
    hypoallergenic: boolean | null;
   
    priceTier:
      | "BUDGET"
      | "VALUE"
      | "MIDRANGE"
      | "PREMIUM"
      | "PROFESSIONAL"
      | null;
   
    availability:
      | "LIMITED"
      | "MODERATE"
      | "WIDE"
      | "NATIONAL"
      | null;
   };
   
   export type CatalogProduct = {
    id: string;
   
    canonicalTitle: string;
   
    manufacturerSku: string | null;
   
    upc: string | null;
   
    form:
      | "CAPSULE"
      | "TABLET"
      | "SOFTGEL"
      | "CAPLET"
      | "OTHER"
      | null;
   
    unitsPerContainer: number | null;
   
    servingSize: number | null;
   
    servingsPerContainer: number | null;
   
    productUrl: string | null;
   
    active: boolean;
   
    brand: CatalogBrand;
   
    ingredients: CatalogIngredient[];
   
    listings: CatalogListing[];
   };
   
   export type CatalogProductFilters = {
    supplementName?: string;
   
    brandName?: string;
   
    form?: CatalogProduct["form"];
   
    practitionerGradeOnly?: boolean;
   
    thirdPartyTestedOnly?: boolean;
   
    cgmpCertifiedOnly?: boolean;
   
    veganOnly?: boolean;
   
    hypoallergenicOnly?: boolean;
   
    inStockOnly?: boolean;
   
    maximumBottlePrice?: number;
   
    minimumAverageRating?: number;
   
    minimumReviewCount?: number;
   };