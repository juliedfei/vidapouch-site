import {
    SearchExpansionKind,
    SearchIntentType,
   } from "@/lib/generated/prisma/client";
   
   type SearchIntentExpansionCandidate = {
    expansionKind:
      SearchExpansionKind;
   
    searchTerm:
      string;
   
    normalizedSearchTerm:
      string;
   
    displayName:
      string | null;
   
    reason:
      string | null;
   
    priority:
      number;
   
    confidence:
      number;
   };
   
   const DISALLOWED_SENSITIVE_SEARCH_TERMS = [
    "doctor",
    "doctors",
    "physician",
    "physicians",
    "specialist",
    "specialists",
    "clinic",
    "clinics",
    "hospital",
    "hospitals",
    "treatment center",
    "therapy",
    "therapist",
    "medical device",
    "wheelchair",
    "walker",
    "diagnostic test",
    "test kit",
    "book",
    "books",
    "prescription",
    "medication",
    "medications",
   ];
   
   function containsDisallowedSearchTerm(
    normalizedSearchTerm:
      string
   ) {
    return DISALLOWED_SENSITIVE_SEARCH_TERMS.some(
      (term) =>
        normalizedSearchTerm ===
          term ||
        normalizedSearchTerm.startsWith(
          `${term} `
        ) ||
        normalizedSearchTerm.endsWith(
          ` ${term}`
        ) ||
        normalizedSearchTerm.includes(
          ` ${term} `
        )
    );
   }
   
   function isSensitiveIntent(
    intentType:
      SearchIntentType
   ) {
    return (
      intentType ===
        SearchIntentType
          .HEALTH_CONDITION ||
      intentType ===
        SearchIntentType
          .LIFE_STAGE
    );
   }
   
   /**
   * Applies deterministic server-side rules to
   * AI-generated search expansions.
   *
   * Sensitive health conditions and life stages may
   * produce only specific supplement expansions.
   * They may not create raw condition searches,
   * practitioner searches, treatment searches, or
   * unrelated marketplace searches.
   */
   export function filterSearchIntentExpansions<
    T extends
      SearchIntentExpansionCandidate,
   >({
    intentType,
    originalQuery,
    expansions,
   }: {
    intentType:
      SearchIntentType;
   
    originalQuery:
      string;
   
    expansions:
      T[];
   }) {
    if (
      !isSensitiveIntent(
        intentType
      )
    ) {
      return expansions;
    }
   
    const normalizedOriginalQuery =
      originalQuery
        .toLowerCase()
        .replace(
          /[’']/g,
          ""
        )
        .replace(
          /[^a-z0-9]+/g,
          " "
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();
   
    return expansions.filter(
      (expansion) => {
        /*
         * Sensitive searches may only expand into
         * individual supplement ingredients or
         * recognized supplement categories.
         */
        if (
          expansion.expansionKind !==
            SearchExpansionKind
              .RELATED_SUPPLEMENT
        ) {
          return false;
        }
   
        if (
          containsDisallowedSearchTerm(
            expansion
              .normalizedSearchTerm
          )
        ) {
          return false;
        }
   
        /*
         * Never send the unchanged health condition
         * or life-stage phrase to the marketplace.
         */
        if (
          expansion
            .normalizedSearchTerm ===
          normalizedOriginalQuery
        ) {
          return false;
        }
   
        return true;
      }
    );
   }
   