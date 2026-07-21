import type {
    SearchPouchTiming,
   } from "@/components/search/types/searchPouch";
   
   import type {
    SearchProductOption,
   } from "@/lib/search/searchProductOption";
   
   type SearchPouchTimingResult = {
    timing:
      SearchPouchTiming;
   
    reason:
      string;
   };
   
   function normalizeText(
    value: string
   ) {
    return value
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        " "
      )
      .trim();
   }
   
   function includesAny(
    value: string,
    terms: string[]
   ) {
    return terms.some(
      (term) =>
        value.includes(
          term
        )
    );
   }
   
   export function getSearchPouchTiming(
    product:
      SearchProductOption
   ): SearchPouchTimingResult {
    const searchableText =
      normalizeText(
        [
          product.productName,
          product.brand,
          product.dosage,
          product.form ?? "",
          ...product.certifications,
          ...product.qualityClaims,
        ].join(" ")
      );
   
    const eveningTerms = [
      "magnesium",
      "melatonin",
      "sleep",
      "night",
      "bedtime",
      "calm",
      "relax",
      "stress relief",
      "l theanine",
      "theanine",
      "glycine",
      "valerian",
      "ashwagandha",
    ];
   
    if (
      includesAny(
        searchableText,
        eveningTerms
      )
    ) {
      return {
        timing:
          "evening",
   
        reason:
          "VidaPouch recommends taking this later in the day based on the supplement type.",
      };
    }
   
    const morningTerms = [
      "vitamin d",
      "vitamin b",
      "b complex",
      "b12",
      "energy",
      "focus",
      "alertness",
      "multivitamin",
      "coq10",
      "coenzyme q10",
      "iron",
      "probiotic",
    ];
   
    if (
      includesAny(
        searchableText,
        morningTerms
      )
    ) {
      return {
        timing:
          "morning",
   
        reason:
          "VidaPouch recommends taking this earlier in the day based on the supplement type.",
      };
    }
   
    return {
      timing:
        "morning",
   
      reason:
        "VidaPouch selected Morning as the default timing for this supplement.",
    };
   }
   