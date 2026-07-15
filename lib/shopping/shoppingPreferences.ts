import type { ShoppingMode } from "./shoppingModes";

export type ShoppingPreferences = {

 mode: ShoppingMode;

 preferredBrands: string[];

 avoidedBrands: string[];

 preferredRetailers: string[];

 avoidedRetailers: string[];

 prioritizeLowestCost: boolean;

 prioritizeHighestQuality: boolean;

 prioritizeThirdPartyTesting: boolean;

 prioritizeCustomerReviews: boolean;

 preferSubscriptionEligible: boolean;

 allowVidaPouchBrand: boolean;

};

export const DEFAULT_SHOPPING_PREFERENCES: ShoppingPreferences = {

 mode: "recommended",

 preferredBrands: [],

 avoidedBrands: [],

 preferredRetailers: [],

 avoidedRetailers: [],

 prioritizeLowestCost: false,

 prioritizeHighestQuality: true,

 prioritizeThirdPartyTesting: true,

 prioritizeCustomerReviews: true,

 preferSubscriptionEligible: true,

 allowVidaPouchBrand: true,

};
