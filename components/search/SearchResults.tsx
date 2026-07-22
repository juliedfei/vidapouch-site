"use client";

import {
 useEffect,
 useMemo,
 useState,
} from "react";

import type {
 Dispatch,
 ReactNode,
 SetStateAction,
} from "react";

import ProductCard from "./ProductCard";

import {
 useSearch,
} from "@/lib/search/useSearch";

import {
 applySearchDailyDose,
} from "@/lib/search/applySearchDailyDose";

import {
 parseSearchDailyDose,
} from "@/lib/search/parseSearchDailyDose";

import type {
 SearchProductOption,
} from "@/lib/search/searchProductOption";

import type {
 SearchFilterState,
 SearchSortOption,
 SearchTestingFilter,
} from "./types/searchFilters";

import type {
 SearchPouchItem,
} from "./types/searchPouch";

import {
 SEARCH_PLANS,
} from "./types/searchPlan";

import type {
 SearchPlan,
 SearchPlanId,
 SearchPlanSelection,
} from "./types/searchPlan";

type SearchResultsProps = {
 query:
   string;

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

 pouchItems:
   SearchPouchItem[];

 onAddToPouch: (
   item:
     SearchPouchItem
 ) => void;

 selectedPlanId:
   SearchPlanSelection;

 selectedPlan:
   SearchPlan | null;

 onPlanChange: (
   planId:
     SearchPlanId
 ) => void;
};

const INITIAL_VISIBLE_RESULTS =
 6;

function normalizeText(
 value:
   string
) {
 return value
   .toLowerCase()
   .replace(
     /['’]/g,
     ""
   )
   .replace(
     /[^a-z0-9]+/g,
     " "
   )
   .trim();
}

function parsePrice(
 value:
   string,

 fallback:
   number
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
   Number(
     cleaned
   );

 return Number.isFinite(
   parsed
 )
   ? parsed
   : fallback;
}

function containsClaim(
 claims:
   string[],

 expectedClaim:
   string
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
         (
           testingFilter
         ) =>
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

     if (
       filters
         .vitaPouchEligibleOnly &&
       !product
         .vitaPouchFormEligible
     ) {
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

function SunIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[25px] w-[25px]">

     <circle
       cx="12"
       cy="12"
       r="3.5"
       stroke="currentColor"
       strokeWidth="1.4"
     />

     <path
       d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"
       stroke="currentColor"
       strokeWidth="1.4"
       strokeLinecap="round"
     />
   </svg>
 );
}

function DeliveryIcon() {
 return (
   <svg
     viewBox="0 0 28 24"
     fill="none"
     aria-hidden="true"
     className="h-[25px] w-[29px]">

     <path
       d="M2.5 5.5h14v12h-14zM16.5 9h4.5l4 4v4.5h-8.5z"
       stroke="currentColor"
       strokeWidth="1.4"
       strokeLinejoin="round"
     />

     <circle
       cx="7"
       cy="19"
       r="2"
       stroke="currentColor"
       strokeWidth="1.4"
     />

     <circle
       cx="21"
       cy="19"
       r="2"
       stroke="currentColor"
       strokeWidth="1.4"
     />
   </svg>
 );
}

function CheckCircleIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[25px] w-[25px]">

     <circle
       cx="12"
       cy="12"
       r="9"
       stroke="currentColor"
       strokeWidth="1.4"
     />

     <path
       d="m8 12.2 2.5 2.5 5.5-5.7"
       stroke="currentColor"
       strokeWidth="1.4"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function SupplementIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[18px] w-[18px]">

     <path
       d="M7 4.5h10v15H7z"
       stroke="currentColor"
       strokeWidth="1.4"
       strokeLinejoin="round"
     />

     <path
       d="M9 2.8h6v3H9zM9.5 10h5M9.5 13h5"
       stroke="currentColor"
       strokeWidth="1.4"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function ClockIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[18px] w-[18px]">

     <circle
       cx="12"
       cy="12"
       r="8.5"
       stroke="currentColor"
       strokeWidth="1.4"
     />

     <path
       d="M12 7.5v5l3 2"
       stroke="currentColor"
       strokeWidth="1.4"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function StarIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[18px] w-[18px]">

     <path
       d="m12 3.5 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.5Z"
       stroke="currentColor"
       strokeWidth="1.35"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function ChevronUpIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[15px] w-[15px]">

     <path
       d="m7 14.5 5-5 5 5"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function ChevronDownIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[15px] w-[15px]">

     <path
       d="m7 9.5 5 5 5-5"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 );
}

function PouchOutlineIcon() {
 return (
   <svg
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
     className="h-[18px] w-[18px]">

     <path
       d="M7.5 4.5h9l1 3v11H6.5v-11l1-3Z"
       stroke="currentColor"
       strokeWidth="1.6"
       strokeLinejoin="round"
     />

     <path
       d="M7 8h10"
       stroke="currentColor"
       strokeWidth="1.6"
       strokeLinecap="round"
     />
   </svg>
 );
}

type PromotionDetailProps = {
 icon:
   ReactNode;

 title:
   string;

 description:
   string;
};

function PromotionDetail({
 icon,
 title,
 description,
}: PromotionDetailProps) {
 return (
   <div
     className="
       flex
       min-w-0
       items-start
       gap-3
     ">

     <span
       className="
         flex
         h-[42px]
         w-[42px]
         shrink-0
         items-center
         justify-center
         text-[#A46F42]
       ">

       {icon}
     </span>

     <div className="min-w-0">
       <p
         className="
           text-[12px]
           font-semibold
           text-[#182127]
         ">

         {title}
       </p>

       <p
         className="
           mt-1
           text-[10.5px]
           leading-[1.5]
           text-[#626A6D]
         ">

         {description}
       </p>
     </div>
   </div>
 );
}

type SearchPlanSelectorProps = {
 selectedPlanId:
   SearchPlanSelection;

 selectedSupplementCount:
   number;

 onPlanChange: (
   planId:
     SearchPlanId
 ) => void;
};

function SearchPlanSelector({
 selectedPlanId,
 selectedSupplementCount,
 onPlanChange,
}: SearchPlanSelectorProps) {
 return (
   <section className="mb-4">
     <div
       className="
         mb-3
         flex
         flex-wrap
         items-end
         justify-between
         gap-3
       ">

       <div>
         <h3
           className="
             text-[19px]
             font-semibold
             text-[#172127]
           "
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>

           Build your personalized VidaPouch
         </h3>

         <p
           className="
             mt-1
             text-[11px]
             leading-[1.5]
             text-[#667074]
           ">

           Optional monthly plans that organize
           your exact supplements into convenient
           daily pouches.
         </p>
       </div>

       {selectedPlanId ===
         null && (
         <span
           className="
             rounded-full
             border
             border-[#E2D7CC]
             bg-[#FBF8F3]
             px-3
             py-1.5
             text-[10px]
             font-semibold
             text-[#71675F]
           ">

           No plan selected
         </span>
       )}
     </div>

     <div
       className="
         grid
         grid-cols-1
         gap-3
         md:grid-cols-3
       ">

       {SEARCH_PLANS.map(
         (plan) => {
           const selected =
             plan.id ===
             selectedPlanId;

           const planTooSmall =
             selectedSupplementCount >
             plan.supplementLimit;

           return (
             <button
               key={
                 plan.id
               }
               type="button"
               onClick={
                 () =>
                   onPlanChange(
                     plan.id
                   )
               }
               disabled={
                 planTooSmall
               }
               aria-pressed={
                 selected
               }
               className={`
                 min-w-0
                 rounded-[10px]
                 border
                 px-4
                 py-4
                 text-left
                 transition
                 ${
                   selected
                     ? `
                         border-[#8C1D40]
                         bg-[#FFFDFB]
                         shadow-[inset_0_0_0_1px_#8C1D40]
                       `
                     : `
                         border-[#E7DFD6]
                         bg-white
                         hover:border-[#CDB8AC]
                         hover:bg-[#FFFCF9]
                       `
                 }
                 disabled:cursor-not-allowed
                 disabled:opacity-45
               `}>

               <div
                 className="
                   flex
                   items-start
                   justify-between
                   gap-3
                 ">

                 <div
                   className="
                     flex
                     min-w-0
                     items-center
                     gap-2
                   ">

                   {selected && (
                     <span
                       className="
                         flex
                         h-[18px]
                         w-[18px]
                         shrink-0
                         items-center
                         justify-center
                         rounded-full
                         bg-[#8C1D40]
                         text-[10px]
                         font-bold
                         text-white
                       "
                       aria-hidden="true">

                       ✓
                     </span>
                   )}

                   <h4
                     className="
                       text-[16px]
                       font-semibold
                       text-[#171C1F]
                     ">

                     {plan.name}
                   </h4>
                 </div>

                 <p
                   className="
                     shrink-0
                     text-[16px]
                     font-bold
                     text-[#4F1118]
                   ">

                   $
                   {plan.monthlyPrice.toFixed(
                     2
                   )}

                   <span
                     className="
                       ml-0.5
                       text-[10px]
                       font-medium
                       text-[#5F6669]
                     ">

                     /mo
                   </span>
                 </p>
               </div>

               <div
                 className="
                   mt-4
                   flex
                   items-center
                   gap-2.5
                   text-[#A56D3F]
                 ">

                 <SupplementIcon />

                 <p
                   className="
                     text-[11px]
                     font-medium
                     text-[#3D4548]
                   ">

                   {plan.description}
                 </p>
               </div>

               <div
                 className="
                   my-3
                   border-t
                   border-[#EEE5DD]
                 "
               />

               <div
                 className="
                   flex
                   items-start
                   gap-2.5
                   text-[#A56D3F]
                 ">

                 {plan.id ===
                   "essential" ? (
                   <SupplementIcon />
                 ) : plan.id ===
                   "complete" ? (
                   <ClockIcon />
                 ) : (
                   <StarIcon />
                 )}

                 <p
                   className="
                     text-[10.5px]
                     leading-[1.45]
                     text-[#525B5E]
                   ">

                   {plan.selectionDescription}
                 </p>
               </div>

               {planTooSmall && (
                 <p
                   className="
                     mt-3
                     text-[10px]
                     font-semibold
                     text-[#A23636]
                   ">

                   This plan is too small for your
                   current routine.
                 </p>
               )}
             </button>
           );
         }
       )}
     </div>
   </section>
 );
}

type VidaPouchPromotionProps = {
 expanded:
   boolean;

 onToggle:
   () => void;
};

function VidaPouchPromotion({
 expanded,
 onToggle,
}: VidaPouchPromotionProps) {
 if (!expanded) {
   return (
     <button
       type="button"
       onClick={
         onToggle
       }
       aria-expanded="false"
       aria-controls="vidapouch-promotion-content"
       className="
         mb-4
         flex
         min-h-[48px]
         w-full
         items-center
         justify-between
         gap-4
         rounded-[10px]
         border
         border-[#E8DED4]
         bg-[#FCF9F5]
         px-4
         py-3
         text-left
         transition
         hover:border-[#D3C2B3]
         hover:bg-[#FAF5EF]
         focus:outline-none
         focus-visible:ring-2
         focus-visible:ring-[#8C1D40]
         focus-visible:ring-offset-2
       ">

       <span
         className="
           flex
           min-w-0
           items-center
           gap-3
         ">

         <span
           className="
             flex
             h-[30px]
             w-[30px]
             shrink-0
             items-center
             justify-center
             rounded-full
             bg-[#F4E9DE]
             text-[#8C1D40]
           ">

           <PouchOutlineIcon />
         </span>

         <span className="min-w-0">
           <span
             className="
               block
               text-[12px]
               font-semibold
               text-[#26342F]
             ">

             What is VidaPouch?
           </span>

           <span
             className="
               block
               truncate
               text-[10.5px]
               text-[#697276]
             ">

             Personalized daily supplement
             pouches, organized and shipped
             monthly.
           </span>
         </span>
       </span>

       <span
         className="
           flex
           shrink-0
           items-center
           gap-1.5
           text-[10.5px]
           font-semibold
           text-[#7D0E1C]
         ">

         Show VidaPouch
         <ChevronDownIcon />
       </span>
     </button>
   );
 }

 return (
   <section
     id="vidapouch-promotion-content"
     className="
       relative
       mb-4
       overflow-hidden
       rounded-[10px]
       border
       border-[#E8DED4]
       bg-[#FCF9F5]
     ">

     <button
       type="button"
       onClick={
         onToggle
       }
       aria-expanded="true"
       aria-controls="vidapouch-promotion-content"
       className="
         absolute
         right-3
         top-3
         z-20
         flex
         h-[32px]
         items-center
         justify-center
         gap-1.5
         rounded-full
         border
         border-[#DED1C5]
         bg-[rgba(255,255,255,0.94)]
         px-3
         text-[10px]
         font-semibold
         text-[#665C55]
         shadow-[0_2px_8px_rgba(46,32,20,0.06)]
         backdrop-blur-sm
         transition
         hover:border-[#C9B3A3]
         hover:bg-white
         hover:text-[#7D0E1C]
         focus:outline-none
         focus-visible:ring-2
         focus-visible:ring-[#8C1D40]
         focus-visible:ring-offset-2
       ">

       Hide
       <ChevronUpIcon />
     </button>

     <div
       className="
         grid
         min-h-[170px]
         grid-cols-1
         lg:grid-cols-[310px_minmax(0,1fr)]
       ">

       <div
         className="
           relative
           min-h-[190px]
           overflow-hidden
           bg-[#E8DED2]
           lg:min-h-0
         ">

         <img
           src="/images/search/vidapouch-box.PNG"
           alt="VidaPouch personalized morning and evening supplement pouches"
           className="
             absolute
             inset-0
             h-full
             w-full
             object-cover
           "
         />

         <div
           className="
             absolute
             inset-0
             bg-[linear-gradient(90deg,rgba(0,0,0,0.02),rgba(0,0,0,0))]
           "
         />
       </div>

       <div
         className="
           px-6
           pb-5
           pt-14
           sm:pt-12
           lg:px-7
           lg:pb-5
           lg:pt-5
           lg:pr-[92px]
         ">

         <h3
           className="
             text-[25px]
             leading-tight
             text-[#17362C]
             lg:text-[29px]
           "
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>

           What is VidaPouch?
         </h3>

         <p
           className="
             mt-1.5
             text-[13px]
             font-medium
             text-[#2F3B3B]
           ">

           Personalized daily pouches, made for you.
         </p>

         <div
           className="
             mt-5
             grid
             grid-cols-1
             gap-5
             md:grid-cols-3
           ">

           <PromotionDetail
             icon={
               <SunIcon />
             }
             title="Organized by time of day"
             description="Morning and evening pouches built around your routine."
           />

           <PromotionDetail
             icon={
               <DeliveryIcon />
             }
             title="Shipped monthly"
             description="Convenient, discreet, and delivered directly to you."
           />

           <PromotionDetail
             icon={
               <CheckCircleIcon />
             }
             title="Your plan, your way"
             description="Choose your exact supplement brands and dosages."
           />
         </div>
       </div>
     </div>
   </section>
 );
}

export default function SearchResults({
 query,
 filters,
 onFiltersChange,
 onAvailableBrandsChange,
 pouchItems,
 onAddToPouch,
 selectedPlanId,
 selectedPlan,
 onPlanChange,
}: SearchResultsProps) {
 const {
   results:
     searchProducts,
   loading,
   error,
 } =
   useSearch(
     query
   );

 const [
   visibleResultCount,
   setVisibleResultCount,
 ] =
   useState(
     INITIAL_VISIBLE_RESULTS
   );

 const [
   promotionExpanded,
   setPromotionExpanded,
 ] =
   useState(
     true
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
       const parsedDailyDose =
         parseSearchDailyDose(
           filters.dailyDose
         );

       const doseAdjustedProducts =
         searchProducts.flatMap(
           (product) => {
             const adjusted =
               applySearchDailyDose({
                 product,

                 dailyDose:
                   parsedDailyDose,
               });

             return adjusted
               ? [
                   adjusted.product,
                 ]
               : [];
           }
         );

       const matchingProducts =
         filterProducts({
           products:
             doseAdjustedProducts,

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
   query.trim().length >
     0
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

 function togglePromotion() {
   setPromotionExpanded(
     (current) =>
       !current
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
           {filteredProducts.length !==
           1
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

         <span>
           Sort by:
         </span>

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

     <VidaPouchPromotion
       expanded={
         promotionExpanded
       }
       onToggle={
         togglePromotion
       }
     />

     <SearchPlanSelector
       selectedPlanId={
         selectedPlanId
       }
       selectedSupplementCount={
         pouchItems.length
       }
       onPlanChange={
         onPlanChange
       }
     />

     <div
       className="
         mb-4
         flex
         items-start
         gap-3
         rounded-[9px]
         border
         border-[#E8DDD3]
         bg-[#FCF8F3]
         px-4
         py-3
       ">

       <span
         className="
           flex
           h-[19px]
           w-[19px]
           shrink-0
           items-center
           justify-center
           rounded-full
           border
           border-[#9B8B7C]
           text-[11px]
           font-semibold
           text-[#665B52]
         "
         aria-hidden="true">

         i
       </span>

       <p
         className="
           text-[11px]
           leading-[1.55]
           text-[#504943]
         ">

         {selectedPlan ? (
           <>
             Choose your exact brand and dosage.
             Your {selectedPlan.name} Plan includes
             up to{" "}
             {selectedPlan.supplementLimit} supplements.
             Premium products and higher daily
             quantities may show an additional
             monthly charge before checkout.
           </>
         ) : (
           <>
             Buying a bottle does not require a
             VidaPouch plan. Select a plan only
             when you would like your supplements
             organized and delivered in personalized
             daily pouches.
           </>
         )}
       </p>
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

             Buy Bottle

             <span
               className="
                 ml-1
                 font-medium
                 text-[#596366]
               ">

               <br />
               Other Retailers
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
             ">

             Add to VidaPouch Plan

             <span
               className="
                 block
                 text-[10px]
                 font-medium
                 text-[#6A7174]
               ">

               Ships in your daily pouch
             </span>
           </div>
         </div>

         {/* Product comparison rows */}

         <div>
           {visibleProducts.map(
             (product) => (
               <ProductCard
                 key={`${product.brand}-${product.productName}`}
                 product={
                   product
                 }
                 isInPouch={
                   pouchItems.some(
                     (item) =>
                       item.id ===
                       (
                         product
                           .representativeProduct
                           .shoppingProductId ??
                         `${product.brand}-${product.productName}`
                       )
                   )
                 }
                 selectedPlan={
                   selectedPlan
                 }
                 selectedSupplementCount={
                   pouchItems.length
                 }
                 onAddToPouch={
                   onAddToPouch
                 }
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