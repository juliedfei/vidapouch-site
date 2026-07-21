export type SearchFormFilter =
 | "Capsule"
 | "Softgel"
 | "Tablet"
 | "Powder"
 | "Gummy"
 | "Liquid";

export type SearchDietaryFilter =
 | "Vegan"
 | "Vegetarian"
 | "Gluten Free"
 | "Dairy Free"
 | "Soy Free"
 | "Non-GMO";

export type SearchTestingFilter =
 | "USP Verified"
 | "NSF Certified"
 | "ConsumerLab Tested"
 | "Informed Choice"
 | "Third-Party Tested"
 | "GMP Quality Assured"
 | "cGMP Manufactured"
 | "NPA GMP Certified";

export type SearchSortOption =
 | "best-match"
 | "quality"
 | "price-low"
 | "value";

export type SearchFilterState = {
 dailyDose: string;

 forms:
   SearchFormFilter[];

 dietaryPreferences:
   SearchDietaryFilter[];

 testing:
   SearchTestingFilter[];

 brand: string;

 vitaPouchEligibleOnly:
   boolean;

 minimumPrice: string;

 maximumPrice: string;

 sort:
   SearchSortOption;
};

export const DEFAULT_SEARCH_FILTERS:
 SearchFilterState = {
   dailyDose:
     "1 capsule",

   forms:
     [],

   dietaryPreferences:
     [],

   testing:
     [],

   brand:
     "all",

   vitaPouchEligibleOnly:
     false,

   minimumPrice:
     "0",

   maximumPrice:
     "100",

   sort:
     "best-match",
 };
