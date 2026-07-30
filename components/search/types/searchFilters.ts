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
 | "value"
 | "price-low"
 | "bottle-price-low";

export type SearchFilterState = {
 /*
  * Blank means no dose filtering.
  *
  * A dose is applied only after the
  * customer explicitly enters one.
  */
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
   /*
    * Do not default to "1 capsule."
    *
    * That would silently remove softgels,
    * gummies, tablets, and products whose
    * form is not yet known.
    */
   dailyDose:
     "",

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
