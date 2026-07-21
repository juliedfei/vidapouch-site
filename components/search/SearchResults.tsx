"use client";

import {
 useEffect,
 useMemo,
 useState,
} from "react";

import type {
 Dispatch,
 SetStateAction,
} from "react";

import ProductCard from "./ProductCard";

import {
 useSearch,
} from "@/lib/search/useSearch";

import type {
 SearchProductOption,
} from "@/lib/search/searchProductOption";

import type {
 SearchFilterState,
 SearchSortOption,
 SearchTestingFilter,
} from "./types/searchFilters";





type SearchResultsProps = {
  query: string;
 
  filters:
    SearchFilterState;
 
  onFiltersChange:
    Dispatch<
      SetStateAction<
        SearchFilterState
 >
 >;
 
  onAvailableBrandsChange:
    Dispatch<
      SetStateAction<
        string[]
 >
 >;
 };
 






const INITIAL_VISIBLE_RESULTS = 6;

function normalizeText(
 value: string
) {
 return value
   .toLowerCase()
   .replace(/['’]/g, "")
   .replace(
     /[^a-z0-9]+/g,
     " "
   )
   .trim();
}

function parsePrice(
 value: string,
 fallback: number
) {
 const cleaned =
   value.replace(
     /[^0-9.]/g,
     ""
   );

 if (!cleaned) {
   return fallback;
 }

 const parsed =
   Number(cleaned);

 return Number.isFinite(
   parsed
 )
   ? parsed
   : fallback;
}

function containsClaim(
 claims: string[],
 expectedClaim: string
) {
 const normalizedExpected =
   normalizeText(
     expectedClaim
   );

 return claims.some(
   (claim) =>
     normalizeText(
       claim
     ).includes(
       normalizedExpected
     )
 );
}

function matchesTestingFilter(
 product:
   SearchProductOption,

 filter:
   SearchTestingFilter
) {
 switch (filter) {
   case "USP Verified":
     return (
       product
         .thirdPartyTesting
         .uspVerified ||
       containsClaim(
         product.certifications,
         "USP Verified"
       )
     );

   case "NSF Certified":
     return (
       product
         .thirdPartyTesting
         .nsfCertified ||
       containsClaim(
         product.certifications,
         "NSF Certified"
       )
     );

   case "ConsumerLab Tested":
     return (
       product
         .thirdPartyTesting
         .consumerLabTested ||
       containsClaim(
         product.certifications,
         "ConsumerLab"
       ) ||
       containsClaim(
         product.qualityClaims,
         "ConsumerLab"
       )
     );

   case "Informed Choice":
     return (
       product
         .thirdPartyTesting
         .informedChoice ||
       containsClaim(
         product.certifications,
         "Informed Choice"
       ) ||
       containsClaim(
         product.certifications,
         "Informed Sport"
       )
     );

   case "Third-Party Tested":
     return (
       product
         .thirdPartyTesting
         .thirdPartyTested ||
       containsClaim(
         product.qualityClaims,
         "Third-Party Tested"
       )
     );

   case "GMP Quality Assured":
     return containsClaim(
       product.qualityClaims,
       "GMP Quality Assured"
     );

   case "cGMP Manufactured":
     return containsClaim(
       product.qualityClaims,
       "cGMP Manufactured"
     );

   case "NPA GMP Certified":
     return containsClaim(
       product.qualityClaims,
       "NPA GMP Certified"
     );

   default:
     return false;
 }
}

function matchesDietaryFilters(
 product:
   SearchProductOption,

 filters:
   SearchFilterState
) {
 return filters
   .dietaryPreferences
   .every(
     (preference) => {
       switch (
         preference
       ) {
         case "Vegan":
           return product
             .dietaryPreferences
             .vegan;

         case "Vegetarian":
           return product
             .dietaryPreferences
             .vegetarian;

         case "Gluten Free":
           return product
             .dietaryPreferences
             .glutenFree;

         case "Dairy Free":
           return product
             .dietaryPreferences
             .dairyFree;

         case "Soy Free":
           return product
             .dietaryPreferences
             .soyFree;

         case "Non-GMO":
           return product
             .dietaryPreferences
             .nonGmo;

         default:
           return true;
       }
     }
   );
}

function filterProducts({
 products,
 filters,
}: {
 products:
   SearchProductOption[];

 filters:
   SearchFilterState;
}) {
 const minimumPrice =
   parsePrice(
     filters.minimumPrice,
     0
   );

 const maximumPrice =
   parsePrice(
     filters.maximumPrice,
     Number
       .POSITIVE_INFINITY
   );

 const selectedBrand =
   normalizeText(
     filters.brand
   );

 return products.filter(
   (product) => {
     const matchesForm =
       filters.forms.length ===
         0 ||
       filters.forms.some(
         (form) =>
           normalizeText(
             product.form ??
             ""
           ) ===
           normalizeText(
             form
           )
       );

     if (!matchesForm) {
       return false;
     }

     if (
       !matchesDietaryFilters(
         product,
         filters
       )
     ) {
       return false;
     }

     const matchesTesting =
       filters.testing.length ===
         0 ||
       filters.testing.some(
         (testingFilter) =>
           matchesTestingFilter(
             product,
             testingFilter
           )
       );

     if (!matchesTesting) {
       return false;
     }

     const matchesBrand =
       selectedBrand ===
         "all" ||
       normalizeText(
         product.brand
       ) ===
         selectedBrand;

     if (!matchesBrand) {
       return false;
     }

     const monthlyPrice =
       product
         .displayedMonthlyCost;

     return (
       monthlyPrice >=
         minimumPrice &&
       monthlyPrice <=
         maximumPrice
     );
   }
 );
}

function sortProducts({
 products,
 sort,
}: {
 products:
   SearchProductOption[];

 sort:
   SearchSortOption;
}) {
 const sorted =
   [...products];

 switch (sort) {
   case "quality":
     return sorted.sort(
       (
         left,
         right
       ) =>
         (
           right.score
             .productQuality ??
           -1
         ) -
         (
           left.score
             .productQuality ??
           -1
         ) ||
         (
           right.score
             .overall ??
           -1
         ) -
         (
           left.score
             .overall ??
           -1
         )
     );

   case "price-low":
     return sorted.sort(
       (
         left,
         right
       ) =>
         left
           .displayedMonthlyCost -
         right
           .displayedMonthlyCost
     );

   case "value":
     return sorted.sort(
       (
         left,
         right
       ) =>
         (
           right.score.value ??
           -1
         ) -
         (
           left.score.value ??
           -1
         )
     );

   case "best-match":
   default:
     return sorted.sort(
       (
         left,
         right
       ) =>
         (
           right.score.overall ??
           -1
         ) -
         (
           left.score.overall ??
           -1
         ) ||
         right.vendorsCompared -
           left.vendorsCompared
     );
 }
}




export default function SearchResults({
  query,
  filters,
  onFiltersChange,
  onAvailableBrandsChange,
 }: SearchResultsProps) {




 const {
   results:
     searchProducts,
   loading,
   error,
 } = useSearch(query);




 const [
   visibleResultCount,
   setVisibleResultCount,
 ] = useState(
   INITIAL_VISIBLE_RESULTS
 );


 useEffect(
  () => {
    const brands =
      Array.from(
        new Set(
          searchProducts
            .map(
              (product) =>
                product.brand
                  .trim()
            )
            .filter(
              (brand) =>
                brand.length >
                  0 &&
                brand
                  .toLowerCase() !==
                  "unknown brand"
            )
        )
      ).sort(
        (
          left,
          right
        ) =>
          left.localeCompare(
            right
          )
      );

    onAvailableBrandsChange(
      brands
    );

    /*
     * Reset a previously selected brand
     * when it is not present in the new
     * search results.
     */
    onFiltersChange(
      (current) => {
        if (
          current.brand ===
            "all" ||
          brands.some(
            (brand) =>
              normalizeText(
                brand
              ) ===
              normalizeText(
                current.brand
              )
          )
        ) {
          return current;
        }

        return {
          ...current,

          brand:
            "all",
        };
      }
    );
  },
  [
    searchProducts,
    onAvailableBrandsChange,
    onFiltersChange,
  ]
);





 const filteredProducts =
   useMemo(
     () => {
       const matchingProducts =
         filterProducts({
           products:
             searchProducts,

           filters,
         });

       return sortProducts({
         products:
           matchingProducts,

         sort:
           filters.sort,
       });
     },
     [
       searchProducts,
       filters,
     ]
   );

 useEffect(
   () => {
     setVisibleResultCount(
       INITIAL_VISIBLE_RESULTS
     );
   },
   [
     query,
     filters,
   ]
 );

 const resultLabel =
   query.trim().length > 0
     ? query.trim()
     : "All Products";

 const visibleProducts =
   filteredProducts.slice(
     0,
     visibleResultCount
   );

 const hiddenResultCount =
   Math.max(
     0,
     filteredProducts.length -
       visibleProducts.length
   );

 function showAllResults() {
   setVisibleResultCount(
     filteredProducts.length
   );
 }

 function changeSort(
   sort:
     SearchSortOption
 ) {
   onFiltersChange(
     (current) => ({
       ...current,

       sort,
     })
   );
 }

 if (loading) {
   return (
     <div
       className="
         w-full
         rounded-[10px]
         border
         border-[#EEE7DF]
         bg-white
         px-8
         py-16
         text-center
       ">

       <h3
         className="
           text-[26px]
           text-[#081620]
         "
         style={{
           fontFamily:
             'Georgia, "Times New Roman", serif',
         }}>

         Searching products
       </h3>

       <p
         className="
           mt-3
           text-[#667074]
         ">

         Comparing available products and
         retailers.
       </p>
     </div>
   );
 }

 if (error) {
   return (
     <div
       className="
         w-full
         rounded-[10px]
         border
         border-[#EEE7DF]
         bg-white
         px-8
         py-16
         text-center
       ">

       <h3
         className="
           text-[26px]
           text-[#081620]
         "
         style={{
           fontFamily:
             'Georgia, "Times New Roman", serif',
         }}>

         Unable to load products
       </h3>

       <p
         className="
           mt-3
           text-[#667074]
         ">

         Please try the search again.
       </p>
     </div>
   );
 }

 return (
   <div className="w-full bg-white">
     {/* Results heading and sort control */}

     <div
       className="
         flex
         flex-wrap
         items-start
         justify-between
         gap-5
         pb-4
       ">

       <div>
         <h2
           className="
             text-[26px]
             leading-tight
             text-[#081620]
             lg:text-[29px]
           "
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>

           Results for:{" "}
           <span className="text-[#71162F]">
             {resultLabel}
           </span>
         </h2>

         <p
           className="
             mt-2
             text-[13px]
             text-[#667074]
           ">

           Showing{" "}
           {visibleProducts.length} of{" "}
           {filteredProducts.length} result
           {filteredProducts.length !== 1
             ? "s"
             : ""}
         </p>
       </div>

       <label
         className="
           flex
           h-[44px]
           items-center
           gap-2
           rounded-[8px]
           border
           border-[#E7DFD6]
           bg-white
           px-4
           text-[13px]
           text-[#667074]
           shadow-[0_1px_4px_rgba(36,49,53,0.03)]
         ">

         <span>Sort by:</span>

         <select
           value={
             filters.sort
           }
           onChange={
             (event) =>
               changeSort(
                 event.target
                   .value as
                   SearchSortOption
               )
           }
           aria-label="Sort products"
           className="
             cursor-pointer
             appearance-none
             bg-transparent
             pr-6
             font-semibold
             text-[#081620]
             outline-none
           "
           style={{
             backgroundImage:
               "linear-gradient(45deg, transparent 50%, #667074 50%), linear-gradient(135deg, #667074 50%, transparent 50%)",

             backgroundPosition:
               "calc(100% - 8px) 50%, calc(100% - 3px) 50%",

             backgroundSize:
               "5px 5px, 5px 5px",

             backgroundRepeat:
               "no-repeat",
           }}>

           <option value="best-match">
             Best Match
           </option>

           <option value="quality">
             Highest Quality
           </option>

           <option value="price-low">
             Lowest Price
           </option>

           <option value="value">
             Best Value
           </option>
         </select>
       </label>
     </div>

     {filteredProducts.length >
     0 ? (
       <div
         className="
           overflow-hidden
           rounded-[10px]
           border
           border-[#EEE7DF]
           bg-white
         ">

         {/* Desktop column headings */}

         <div
           className="
             hidden
             min-h-[48px]
             grid-cols-[minmax(0,1.55fr)_minmax(150px,0.9fr)_minmax(150px,0.9fr)]
             items-center
             border-b
             border-[#EEE7DF]
             bg-white
             lg:grid
           ">

           <div
             className="
               px-5
               text-[13px]
               font-semibold
               text-[#081620]
             ">

             Product &amp; Quality
           </div>

           <div
             className="
               border-l
               border-[#F0E9E1]
               px-5
               text-[13px]
               font-semibold
               text-[#081620]
             ">

             Buy Bottle{" "}

             <span
               className="
                 ml-1
                 font-medium
                 text-[#596366]
               ">

               <br />
               (Other Retailers)
             </span>
           </div>

           <div
             className="
               border-l
               border-[#F0E9E1]
               px-5
               text-[13px]
               font-semibold
               text-[#8C1D40]
               underline
               decoration-[#CDA7B2]
               underline-offset-4
             ">

             Add to VidaPouch
           </div>
         </div>

         {/* How-to-buy callout */}

         <div
           className="
             flex
             items-center
             gap-4
             border-b
             border-[#EEE7DF]
             bg-[#FCF8F3]
             px-5
             py-5
             lg:px-6
             lg:py-6
           ">

           <div
             className="
               flex
               h-[58px]
               w-[58px]
               flex-none
               items-center
               justify-center
             ">

             <img
               src="/images/home-v2/icons/scale.PNG"
               alt=""
               aria-hidden="true"
               className="
                 h-[54px]
                 w-[54px]
                 object-contain
               "
             />
           </div>

           <div>
             <h3
               className="
                 text-[17px]
                 font-semibold
                 text-[#081620]
               ">

               Choose how you want to buy
             </h3>

             <p
               className="
                 mt-1
                 max-w-[620px]
                 text-[13px]
                 leading-[1.55]
                 text-[#354044]
               ">

               Buy a full bottle from trusted
               retailers, or add to your
               personalized pouch and only pay
               for what you need.
             </p>
           </div>
         </div>

         {/* Product comparison rows */}

         <div>
           {visibleProducts.map(
             (product) => (
               <ProductCard
                 key={`${product.brand}-${product.productName}`}
                 product={product}
               />
             )
           )}
         </div>

         {/* Results footer */}

         {hiddenResultCount >
           0 && (
           <div
             className="
               border-t
               border-[#EEE7DF]
               bg-white
               px-5
               py-4
               text-center
             ">

             <button
               type="button"
               onClick={
                 showAllResults
               }
               className="
                 inline-flex
                 items-center
                 gap-2
                 text-[13px]
                 font-semibold
                 text-[#081620]
                 transition
                 hover:text-[#8C1D40]
               ">

               See all{" "}
               {filteredProducts.length}{" "}
               results

               <span
                 aria-hidden="true"
                 className="text-[17px]">

                 ↓
               </span>
             </button>

             <p
               className="
                 mt-1
                 text-[10px]
                 text-[#7A8386]
               ">

               {hiddenResultCount} more product
               {hiddenResultCount !==
               1
                 ? "s"
                 : ""}
             </p>
           </div>
         )}
       </div>
     ) : (
       <div
         className="
           rounded-[10px]
           border
           border-[#EEE7DF]
           bg-white
           px-8
           py-16
           text-center
         ">

         <h3
           className="
             text-[26px]
             text-[#081620]
           "
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>

           No matching products
         </h3>

         <p
           className="
             mt-3
             text-[#667074]
           ">

           Clear one or more filters to see
           additional products.
         </p>
       </div>
     )}
   </div>
 );
}
