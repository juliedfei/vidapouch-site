import {
    normalizeSearchIntentText,
   } from "@/lib/search/resolveSearchIntent";
   
   import type {
    ParsedBrandCandidate,
   } from "../brandResolutionTypes";
   
   /*
   * Avoid treating these introductory marketplace words
   * as part of a brand.
   *
   * "Best" is deliberately not included because it is
   * part of legitimate brands such as:
   *
   * • Doctor's Best
   * • Best Naturals
   */
   const GENERIC_LEADING_WORDS =
    new Set([
      "buy",
      "shop",
      "official",
    ]);
   
   /*
   * Known supplement and ingredient phrases.
   *
   * When one of these appears after a plausible brand
   * prefix, it marks the beginning of the product name
   * rather than part of the brand.
   *
   * Longer phrases are checked before shorter phrases.
   */
   const SUPPLEMENT_BOUNDARY_PHRASES = [
    "5 hydroxytryptophan",
    "l tryptophan",
    "l theanine",
    "suntheanine l theanine",
    "suntheanine",
    "sam e",
    "same",
    "5 htp",
    "ashwagandha",
    "magnesium",
    "magnesium glycinate",
    "magnesium citrate",
    "magnesium oxide",
    "calcium",
    "melatonin",
    "serotonin",
    "probiotic",
    "probiotics",
    "collagen",
    "biotin",
    "turmeric",
    "curcumin",
    "omega 3",
    "omega",
    "fish oil",
    "saffron",
    "vitamin a",
    "vitamin b",
    "vitamin b12",
    "vitamin c",
    "vitamin d",
    "vitamin d3",
    "vitamin e",
    "zinc",
    "iron",
    "folate",
    "folic acid",
    "coq10",
    "coenzyme q10",
    "creatine",
    "caffeine",
    "theanine",
   ];
   
   /*
   * Product-line and marketing phrases that frequently
   * appear directly after the actual brand.
   *
   * Examples:
   *
   * • Natrol Triple Magnesium
   * • Onnit New Mood
   * • Swanson Full Spectrum Saffron
   * • Irwin Naturals Double Potency 5-HTP
   * • OLLY Ultra Strength Goodbye Stress
   */
   const PRODUCT_DESCRIPTOR_PHRASES = [
    "new mood",
    "full spectrum",
    "double potency",
    "double strength",
    "triple strength",
    "ultra strength",
    "maximum strength",
    "extra strength",
    "high potency",
    "advanced formula",
    "daily support",
    "mood support",
    "stress support",
    "sleep support",
    "immune support",
    "digestive support",
    "joint support",
    "heart support",
    "brain support",
    "calm support",
    "goodbye stress",
    "quick release",
    "time release",
    "extended release",
    "fast acting",
    "triple",
    "new",
    "ultra",
    "maximum",
    "advanced",
    "complete",
    "potency",
    "strength",
    "extract",
    "complex",
    "formula",
    "blend",
    "support",
    "relief",
   ];
   
   /*
   * General product descriptors and dosage-form words.
   */
   const PRODUCT_BOUNDARY_WORDS =
    new Set([
      "supplement",
      "supplements",
      "vitamin",
      "vitamins",
      "mineral",
      "minerals",
      "capsule",
      "capsules",
      "tablet",
      "tablets",
      "caplet",
      "caplets",
      "softgel",
      "softgels",
      "gummy",
      "gummies",
      "chewable",
      "chewables",
      "powder",
      "liquid",
      "drops",
      "tincture",
      "spray",
      "serving",
      "servings",
      "count",
      "mood",
      "stress",
      "calm",
      "sleep",
      "energy",
      "focus",
      "immune",
      "immunity",
      "digestive",
      "joint",
      "heart",
      "brain",
      "wellness",
      "relaxation",
      "enhancer",
      "release",
      "organic",
      "vegan",
      "vegetarian",
      "natural",
      "sugar",
      "free",
    ]);
   
   const NORMALIZED_SUPPLEMENT_PHRASES =
    SUPPLEMENT_BOUNDARY_PHRASES
      .map(
        (
          phrase
        ) =>
          normalizeSearchIntentText(
            phrase
          )
            .split(
              /\s+/
            )
            .filter(
              Boolean
            )
      )
      .sort(
        (
          left,
          right
        ) =>
          right.length -
          left.length
      );
   
   const NORMALIZED_DESCRIPTOR_PHRASES =
    PRODUCT_DESCRIPTOR_PHRASES
      .map(
        (
          phrase
        ) =>
          normalizeSearchIntentText(
            phrase
          )
            .split(
              /\s+/
            )
            .filter(
              Boolean
            )
      )
      .sort(
        (
          left,
          right
        ) =>
          right.length -
          left.length
      );
   
   type ParseResult = {
    candidate:
      string;
   
    confidence:
      number;
   
    reason:
      string;
   };
   
   function cleanCandidate(
    value:
      string
   ) {
    return value
      .replace(
        /[®™©]/g,
        ""
      )
      .replace(
        /^[\s,|:;–—-]+/,
        ""
      )
      .replace(
        /[\s,|:;–—-]+$/,
        ""
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   function cleanTitleForWordAlignment(
    value:
      string
   ) {
    return value
      .replace(
        /[®™©]/g,
        ""
      )
      /*
       * Convert punctuation and hyphens to spaces so:
       *
       * • SAM-e becomes SAM e
       * • L-Theanine becomes L Theanine
       * • 5-HTP becomes 5 HTP
       *
       * This keeps original and normalized word indexes
       * aligned for phrase-boundary detection.
       */
      .replace(
        /[|()[\]{},:;–—/\\-]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   function removeGenericLeadingWords(
    value:
      string
   ) {
    const words =
      value.split(
        /\s+/
      );
   
    while (
      words.length >
        0 &&
      GENERIC_LEADING_WORDS.has(
        normalizeSearchIntentText(
          words[0]
        )
      )
    ) {
      words.shift();
    }
   
    return words.join(
      " "
    );
   }
   
   function wordsMatchAt({
    words,
    phrase,
    startIndex,
   }: {
    words:
      string[];
   
    phrase:
      string[];
   
    startIndex:
      number;
   }) {
    if (
      startIndex <
        0 ||
      startIndex +
        phrase.length >
        words.length
    ) {
      return false;
    }
   
    return phrase.every(
      (
        phraseWord,
        phraseIndex
      ) =>
        words[
          startIndex +
            phraseIndex
        ] ===
        phraseWord
    );
   }
   
   function findFirstPhraseIndex({
    words,
    phrases,
    minimumIndex,
   }: {
    words:
      string[];
   
    phrases:
      string[][];
   
    minimumIndex:
      number;
   }) {
    for (
      let index =
        minimumIndex;
      index <
        words.length;
      index +=
        1
    ) {
      for (
        const phrase of
        phrases
      ) {
        if (
          wordsMatchAt({
            words,
   
            phrase,
   
            startIndex:
              index,
          })
        ) {
          return index;
        }
      }
    }
   
    return -1;
   }
   
   function findFirstBoundaryIndex(
    normalizedWords:
      string[]
   ) {
    const supplementIndex =
      findFirstPhraseIndex({
        words:
          normalizedWords,
   
        phrases:
          NORMALIZED_SUPPLEMENT_PHRASES,
   
        minimumIndex:
          1,
      });
   
    const descriptorIndex =
      findFirstPhraseIndex({
        words:
          normalizedWords,
   
        phrases:
          NORMALIZED_DESCRIPTOR_PHRASES,
   
        minimumIndex:
          1,
      });
   
    const singleWordIndex =
      normalizedWords.findIndex(
        (
          word,
          index
        ) =>
          index >
            0 &&
          (
            PRODUCT_BOUNDARY_WORDS.has(
              word
            ) ||
            /^\d/.test(
              word
            )
          )
      );
   
    const indexes =
      [
        supplementIndex,
        descriptorIndex,
        singleWordIndex,
      ].filter(
        (
          index
        ) =>
          index >
          0
      );
   
    if (
      indexes.length ===
        0
    ) {
      return -1;
    }
   
    return Math.min(
      ...indexes
    );
   }
   
   function titleStartsWithPhrase({
    normalizedWords,
    phrase,
   }: {
    normalizedWords:
      string[];
   
    phrase:
      string[];
   }) {
    return wordsMatchAt({
      words:
        normalizedWords,
   
      phrase,
   
      startIndex:
        0,
    });
   }
   
   function findLeadingSupplementLength(
    normalizedWords:
      string[]
   ) {
    for (
      const phrase of
      NORMALIZED_SUPPLEMENT_PHRASES
    ) {
      if (
        titleStartsWithPhrase({
          normalizedWords,
   
          phrase,
        })
      ) {
        return phrase.length;
      }
    }
   
    return 0;
   }
   
   function trimTrailingProductWords(
    words:
      string[]
   ) {
    const trimmed =
      [
        ...words,
      ];
   
    while (
      trimmed.length >
        0
    ) {
      const lastWord =
        normalizeSearchIntentText(
          trimmed[
            trimmed.length -
              1
          ]
        );
   
      if (
        !lastWord ||
        PRODUCT_BOUNDARY_WORDS.has(
          lastWord
        ) ||
        /^\d/.test(
          lastWord
        )
      ) {
        trimmed.pop();
   
        continue;
      }
   
      break;
    }
   
    return trimmed;
   }
   
   function parseByPhrase(
    title:
      string
   ): ParseResult | null {
    const match =
      title.match(
        /\bby\s+(.+?)(?:\s*[|,;–—-]|$)/i
      );
   
    if (
      !match?.[1]
    ) {
      return null;
    }
   
    const candidate =
      cleanCandidate(
        removeGenericLeadingWords(
          match[1]
        )
      );
   
    if (
      !candidate
    ) {
      return null;
    }
   
    return {
      candidate,
   
      confidence:
        0.92,
   
      reason:
        "Brand parsed from an explicit 'by' phrase.",
    };
   }
   
   /*
   * Handles titles where the supplement comes first and
   * the brand appears afterward.
   *
   * Examples:
   *
   * • Theanine Thorne → Thorne
   * • L-Theanine Pure Encapsulations
   *   → Pure Encapsulations
   * • 5 HTP Natrol → Natrol
   */
   function parseBrandAfterLeadingSupplement(
    title:
      string
   ): ParseResult | null {
    const alignedTitle =
      cleanTitleForWordAlignment(
        title
      );
   
    if (
      !alignedTitle
    ) {
      return null;
    }
   
    const originalWords =
      alignedTitle.split(
        /\s+/
      );
   
    const normalizedWords =
      normalizeSearchIntentText(
        alignedTitle
      )
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );
   
    const supplementWordCount =
      findLeadingSupplementLength(
        normalizedWords
      );
   
    if (
      supplementWordCount ===
        0 ||
      supplementWordCount >=
        originalWords.length
    ) {
      return null;
    }
   
    const remainingWords =
      trimTrailingProductWords(
        originalWords.slice(
          supplementWordCount
        )
      );
   
    if (
      remainingWords.length ===
        0 ||
      remainingWords.length >
        4
    ) {
      return null;
    }
   
    const candidate =
      cleanCandidate(
        removeGenericLeadingWords(
          remainingWords.join(
            " "
          )
        )
      );
   
    if (
      !candidate
    ) {
      return null;
    }
   
    return {
      candidate,
   
      confidence:
        0.76,
   
      reason:
        "Brand parsed after a leading supplement or ingredient name.",
    };
   }
   
   function parsePrefixBeforeProductBoundary(
    title:
      string
   ): ParseResult | null {
    const alignedTitle =
      cleanTitleForWordAlignment(
        title
      );
   
    if (
      !alignedTitle
    ) {
      return null;
    }
   
    const originalWords =
      alignedTitle.split(
        /\s+/
      );
   
    const normalizedWords =
      normalizeSearchIntentText(
        alignedTitle
      )
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );
   
    const boundaryIndex =
      findFirstBoundaryIndex(
        normalizedWords
      );
   
    if (
      boundaryIndex <=
        0
    ) {
      return null;
    }
   
    /*
     * Permit up to five words so legitimate brands such
     * as Whole World Botanicals are not cut off.
     */
    const candidateWords =
      originalWords.slice(
        0,
        Math.min(
          boundaryIndex,
          5
        )
      );
   
    const candidate =
      cleanCandidate(
        removeGenericLeadingWords(
          candidateWords.join(
            " "
          )
        )
      );
   
    if (
      !candidate
    ) {
      return null;
    }
   
    return {
      candidate,
   
      confidence:
        boundaryIndex <=
          3
          ? 0.84
          : 0.74,
   
      reason:
        "Brand parsed from the title prefix before a known supplement or product descriptor.",
    };
   }
   
   function parseDelimitedPrefix(
    title:
      string
   ): ParseResult | null {
    const firstSection =
      title
        .split(
          /[|,;–—:]/
        )[0];
   
    const alignedSection =
      cleanTitleForWordAlignment(
        firstSection
      );
   
    if (
      !alignedSection
    ) {
      return null;
    }
   
    const originalWords =
      alignedSection.split(
        /\s+/
      );
   
    const normalizedWords =
      normalizeSearchIntentText(
        alignedSection
      )
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );
   
    const boundaryIndex =
      findFirstBoundaryIndex(
        normalizedWords
      );
   
    const boundedWords =
      boundaryIndex >
        0
        ? originalWords.slice(
            0,
            boundaryIndex
          )
        : originalWords;
   
    const candidate =
      cleanCandidate(
        removeGenericLeadingWords(
          boundedWords
            .slice(
              0,
              5
            )
            .join(
              " "
            )
        )
      );
   
    if (
      !candidate
    ) {
      return null;
    }
   
    const words =
      candidate.split(
        /\s+/
      );
   
    if (
      words.length >
        5
    ) {
      return null;
    }
   
    return {
      candidate,
   
      confidence:
        boundaryIndex >
          0
          ? 0.68
          : 0.54,
   
      reason:
        boundaryIndex >
          0
          ? "Brand parsed from a delimited title prefix before a product boundary."
          : "Brand parsed from the first delimited title segment.",
    };
   }
   
   function candidateContainsProductPhrase(
    candidate:
      string
   ) {
    const normalizedWords =
      normalizeSearchIntentText(
        candidate
      )
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );
   
    if (
      normalizedWords.length ===
        0
    ) {
      return true;
    }
   
    const startsWithSupplement =
      NORMALIZED_SUPPLEMENT_PHRASES.some(
        (
          phrase
        ) =>
          wordsMatchAt({
            words:
              normalizedWords,
   
            phrase,
   
            startIndex:
              0,
          })
      );
   
    if (
      startsWithSupplement
    ) {
      return true;
    }
   
    return normalizedWords.some(
      (
        word
      ) =>
        PRODUCT_BOUNDARY_WORDS.has(
          word
        ) ||
        /^\d/.test(
          word
        )
    );
   }
   
   function looksLikeInvalidBrand(
    candidate:
      string
   ) {
    const normalized =
      normalizeSearchIntentText(
        candidate
      );
   
    if (
      !normalized
    ) {
      return true;
    }
   
    const words =
      normalized.split(
        /\s+/
      );
   
    if (
      words.length >
        5
    ) {
      return true;
    }
   
    if (
      words.every(
        (
          word
        ) =>
          PRODUCT_BOUNDARY_WORDS.has(
            word
          ) ||
          /^\d/.test(
            word
          )
      )
    ) {
      return true;
    }
   
    /*
     * Reject candidates that are themselves primarily a
     * supplement name or that still include a dosage or
     * obvious product descriptor.
     */
    if (
      candidateContainsProductPhrase(
        candidate
      )
    ) {
      return true;
    }
   
    return false;
   }
   
   export function parseBrandFromTitle(
    productTitle:
      string
   ): ParsedBrandCandidate {
    const cleanedTitle =
      cleanCandidate(
        productTitle
      );
   
    if (
      !cleanedTitle
    ) {
      return {
        candidate:
          null,
   
        normalizedCandidate:
          null,
   
        confidence:
          0,
   
        reason:
          "The product title was empty.",
      };
    }
   
    const strategies =
      [
        parseByPhrase(
          cleanedTitle
        ),
   
        parseBrandAfterLeadingSupplement(
          cleanedTitle
        ),
   
        parsePrefixBeforeProductBoundary(
          cleanedTitle
        ),
   
        parseDelimitedPrefix(
          cleanedTitle
        ),
      ].filter(
        (
          result
        ): result is ParseResult =>
          result !==
          null
      );
   
    const best =
      strategies.sort(
        (
          left,
          right
        ) =>
          right.confidence -
          left.confidence
      )[0];
   
    if (
      !best ||
      looksLikeInvalidBrand(
        best.candidate
      )
    ) {
      return {
        candidate:
          null,
   
        normalizedCandidate:
          null,
   
        confidence:
          0,
   
        reason:
          "No reliable deterministic brand candidate was found.",
      };
    }
   
    return {
      candidate:
        best.candidate,
   
      normalizedCandidate:
        normalizeSearchIntentText(
          best.candidate
        ),
   
      confidence:
        best.confidence,
   
      reason:
        best.reason,
    };
   }
   