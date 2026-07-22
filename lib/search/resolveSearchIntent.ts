import {
    openai,
   } from "@/lib/openai";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import {
    SearchExpansionKind,
    SearchIntentReviewStatus,
    SearchIntentSource,
    SearchIntentType,
   } from "@/lib/generated/prisma/client";
   
   import {
    DEFAULT_SEARCH_INTENT_MODEL,
    MAX_DIRECT_SEARCH_QUERIES,
    MAX_RELATED_SEARCH_QUERIES,
    MAX_SEARCH_INTENT_ALIASES,
    MAX_SEARCH_INTENT_OUTPUT_TOKENS,
    SEARCH_INTENT_INSTRUCTIONS,
    SEARCH_INTENT_SCHEMA,
    SEARCH_INTENT_VERSION,
   } from "./searchIntentOpenAiConfig";
   
   import type {
    OpenAiSearchIntentExpansion,
    OpenAiSearchIntentResult,
   } from "./searchIntentOpenAiConfig";
   
   export type ResolvedSearchExpansion = {
    id:
      string | null;
   
    kind:
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
      number | null;
   };
   
   export type ResolvedSearchIntent = {
    id:
      string | null;
   
    normalizedKey:
      string;
   
    originalQuery:
      string;
   
    displayName:
      string;
   
    intentType:
      SearchIntentType;
   
    source:
      SearchIntentSource;
   
    reviewStatus:
      SearchIntentReviewStatus;
   
    confidence:
      number | null;
   
    includeOriginalMarketplaceQuery:
      boolean;
   
    expansions:
      ResolvedSearchExpansion[];
   
    cacheStatus:
      "hit" | "created";
   };
   
   function clamp(
    value:
      number,
   
    minimum:
      number,
   
    maximum:
      number
   ) {
    return Math.max(
      minimum,
      Math.min(
        maximum,
        value
      )
    );
   }
   
   export function normalizeSearchIntentText(
    value:
      string
   ) {
    return value
      .toLowerCase()
      .replace(
        /&/g,
        " and "
      )
      .replace(
        /['’]/g,
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
   }
   
   function cleanText(
    value:
      string | null |
      undefined
   ) {
    const cleaned =
      value
        ?.replace(
          /\s+/g,
          " "
        )
        .trim();
   
    return cleaned ||
      null;
   }
   
   function cleanStringList(
    values:
      string[],
   
    maximum:
      number
   ) {
    const seen =
      new Set<string>();
   
    const cleaned:
      string[] = [];
   
    for (
      const value of
      values
    ) {
      const trimmed =
        cleanText(
          value
        );
   
      if (
        !trimmed
      ) {
        continue;
      }
   
      const normalized =
        normalizeSearchIntentText(
          trimmed
        );
   
      if (
        !normalized ||
        seen.has(
          normalized
        )
      ) {
        continue;
      }
   
      seen.add(
        normalized
      );
   
      cleaned.push(
        trimmed
      );
   
      if (
        cleaned.length >=
          maximum
      ) {
        break;
      }
    }
   
    return cleaned;
   }
   
   function getSearchIntentModel() {
    return (
      process.env
        .OPENAI_SEARCH_INTENT_MODEL
        ?.trim() ||
      DEFAULT_SEARCH_INTENT_MODEL
    );
   }
   
   function isOpenAiSearchIntentEnabled() {
    const configuredValue =
      process.env
        .ENABLE_OPENAI_SEARCH_INTENT
        ?.trim()
        .toLowerCase();
   
    if (
      configuredValue ===
        undefined ||
      configuredValue ===
        ""
    ) {
      return true;
    }
   
    return [
      "1",
      "true",
      "yes",
      "on",
    ].includes(
      configuredValue
    );
   }
   
   /*
   * These lookup keys allow common commercial wording
   * to reuse one shared database intent.
   *
   * Examples:
   *
   * mood
   * mood supplement
   * mood supplements
   * supplements for mood
   *
   * All can locate the same centrally cached record.
   */
   function buildSearchIntentLookupKeys(
    value:
      string
   ) {
    const normalized =
      normalizeSearchIntentText(
        value
      );
   
    if (
      !normalized
    ) {
      return [];
    }
   
    const candidates =
      new Set<string>([
        normalized,
      ]);
   
    const withoutLeadingShoppingPhrase =
      normalized
        .replace(
          /^(?:shop|buy|find)\s+/,
          ""
        )
        .replace(
          /^(?:supplement|supplements|vitamin|vitamins)\s+for\s+/,
          ""
        )
        .trim();
   
    if (
      withoutLeadingShoppingPhrase
    ) {
      candidates.add(
        withoutLeadingShoppingPhrase
      );
    }
   
    const withoutTrailingCommercialWord =
      withoutLeadingShoppingPhrase
        .replace(
          /\s+(?:supplement|supplements)$/i,
          ""
        )
        .trim();
   
    if (
      withoutTrailingCommercialWord
    ) {
      candidates.add(
        withoutTrailingCommercialWord
      );
    }
   
    const withoutTrailingShoppingPhrase =
      withoutTrailingCommercialWord
        .replace(
          /\s+(?:for sale|to buy|online)$/i,
          ""
        )
        .trim();
   
    if (
      withoutTrailingShoppingPhrase
    ) {
      candidates.add(
        withoutTrailingShoppingPhrase
      );
    }
   
    return Array.from(
      candidates
    );
   }
   
   function getInFlightLookupKey(
    originalQuery:
      string
   ) {
    const lookupKeys =
      buildSearchIntentLookupKeys(
        originalQuery
      );
   
    return (
      lookupKeys[
        lookupKeys.length - 1
      ] ||
      normalizeSearchIntentText(
        originalQuery
      )
    );
   }
   
   function mapIntentType(
    value:
      OpenAiSearchIntentResult[
        "intentType"
      ]
   ): SearchIntentType {
    switch (
      value
    ) {
      case "HEALTH_GOAL":
        return SearchIntentType
          .HEALTH_GOAL;
   
      case "BRAND":
        return SearchIntentType
          .BRAND;
   
      case "DOCTOR_TYPE":
        return SearchIntentType
          .DOCTOR_TYPE;
   
      case "INVALID":
        return SearchIntentType
          .INVALID;
   
      case "SUPPLEMENT":
      default:
        return SearchIntentType
          .SUPPLEMENT;
    }
   }
   
   function mapExpansionKind(
    value:
      OpenAiSearchIntentExpansion[
        "kind"
      ]
   ): SearchExpansionKind {
    switch (
      value
    ) {
      case "RELATED_SUPPLEMENT":
        return SearchExpansionKind
          .RELATED_SUPPLEMENT;
   
      case "BRAND_QUERY":
        return SearchExpansionKind
          .BRAND_QUERY;
   
      case "DOCTOR_QUERY":
        return SearchExpansionKind
          .DOCTOR_QUERY;
   
      case "DIRECT_QUERY":
      default:
        return SearchExpansionKind
          .DIRECT_QUERY;
    }
   }
   
   function getMaximumForKind(
    kind:
      SearchExpansionKind
   ) {
    if (
      kind ===
        SearchExpansionKind
          .DIRECT_QUERY
    ) {
      return MAX_DIRECT_SEARCH_QUERIES;
    }
   
    return MAX_RELATED_SEARCH_QUERIES;
   }
   
   function cleanOpenAiExpansions(
    expansions:
      OpenAiSearchIntentExpansion[]
   ) {
    const seenByKind =
      new Map<
        SearchExpansionKind,
        Set<string>
   >();
   
    const countByKind =
      new Map<
        SearchExpansionKind,
        number
   >();
   
    const cleaned:
      Array<{
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
      }> = [];
   
    for (
      const expansion of
      expansions
    ) {
      const kind =
        mapExpansionKind(
          expansion.kind
        );
   
      const searchTerm =
        cleanText(
          expansion.searchTerm
        );
   
      if (
        !searchTerm
      ) {
        continue;
      }
   
      const normalizedSearchTerm =
        normalizeSearchIntentText(
          searchTerm
        );
   
      if (
        !normalizedSearchTerm
      ) {
        continue;
      }
   
      const seen =
        seenByKind.get(
          kind
        ) ??
        new Set<string>();
   
      if (
        seen.has(
          normalizedSearchTerm
        )
      ) {
        continue;
      }
   
      const currentCount =
        countByKind.get(
          kind
        ) ??
        0;
   
      if (
        currentCount >=
          getMaximumForKind(
            kind
          )
      ) {
        continue;
      }
   
      seen.add(
        normalizedSearchTerm
      );
   
      seenByKind.set(
        kind,
        seen
      );
   
      countByKind.set(
        kind,
        currentCount + 1
      );
   
      cleaned.push({
        expansionKind:
          kind,
   
        searchTerm,
   
        normalizedSearchTerm,
   
        displayName:
          cleanText(
            expansion
              .displayName
          ),
   
        reason:
          cleanText(
            expansion.reason
          ),
   
        priority:
          Math.max(
            1,
            Math.min(
              1000,
              Math.round(
                expansion.priority
              )
            )
          ),
   
        confidence:
          clamp(
            expansion.confidence,
            0,
            1
          ),
      });
    }
   
    return cleaned.sort(
      (
        left,
        right
      ) =>
        left.priority -
        right.priority
    );
   }
   
   function containsCommercialSupplementWord(
    value:
      string
   ) {
    return [
      "supplement",
      "supplements",
      "vitamin",
      "vitamins",
      "capsule",
      "capsules",
      "tablet",
      "tablets",
      "softgel",
      "softgels",
    ].some(
      (word) =>
        value ===
          word ||
        value.startsWith(
          `${word} `
        ) ||
        value.endsWith(
          ` ${word}`
        ) ||
        value.includes(
          ` ${word} `
        )
    );
   }
   
   function buildRequiredDirectQuery(
    originalQuery:
      string,
   
    intentType:
      SearchIntentType
   ) {
    const cleaned =
      cleanText(
        originalQuery
      );
   
    if (
      !cleaned
    ) {
      return null;
    }
   
    const normalized =
      normalizeSearchIntentText(
        cleaned
      );
   
    if (
      containsCommercialSupplementWord(
        normalized
      )
    ) {
      return cleaned;
    }
   
    if (
      intentType ===
        SearchIntentType
          .HEALTH_GOAL
    ) {
      return `${cleaned} supplements`;
    }
   
    if (
      intentType ===
        SearchIntentType
          .SUPPLEMENT
    ) {
      return `${cleaned} supplement`;
    }
   
    return cleaned;
   }
   
   function ensureOriginalDirectQuery({
    originalQuery,
    intentType,
    includeOriginalMarketplaceQuery,
    expansions,
   }: {
    originalQuery:
      string;
   
    intentType:
      SearchIntentType;
   
    includeOriginalMarketplaceQuery:
      boolean;
   
    expansions:
      ReturnType<
        typeof cleanOpenAiExpansions
   >;
   }) {
    if (
      !includeOriginalMarketplaceQuery ||
      intentType ===
        SearchIntentType.INVALID
    ) {
      return expansions;
    }
   
    const requiredQuery =
      buildRequiredDirectQuery(
        originalQuery,
        intentType
      );
   
    if (
      !requiredQuery
    ) {
      return expansions;
    }
   
    const normalizedRequiredQuery =
      normalizeSearchIntentText(
        requiredQuery
      );
   
    const alreadyIncluded =
      expansions.some(
        (expansion) =>
          expansion
            .expansionKind ===
            SearchExpansionKind
              .DIRECT_QUERY &&
          expansion
            .normalizedSearchTerm ===
            normalizedRequiredQuery
      );
   
    if (
      alreadyIncluded
    ) {
      return expansions;
    }
   
    return [
      {
        expansionKind:
          SearchExpansionKind
            .DIRECT_QUERY,
   
        searchTerm:
          requiredQuery,
   
        normalizedSearchTerm:
          normalizedRequiredQuery,
   
        displayName:
          null,
   
        reason:
          "Direct marketplace results matching the customer’s original search.",
   
        priority:
          1,
   
        confidence:
          1,
      },
   
      ...expansions,
    ];
   }
   
   async function loadIntentByNormalizedKey(
    normalizedQuery:
      string
   ) {
    const directMatch =
      await prisma
        .searchIntent
        .findUnique({
          where: {
            normalizedKey:
              normalizedQuery,
          },
   
          include: {
            expansions: {
              where: {
                active:
                  true,
              },
   
              orderBy: [
                {
                  priority:
                    "asc",
                },
   
                {
                  createdAt:
                    "asc",
                },
              ],
            },
          },
        });
   
    if (
      directMatch
    ) {
      return directMatch;
    }
   
    const aliasMatch =
      await prisma
        .searchIntentAlias
        .findUnique({
          where: {
            normalizedAlias:
              normalizedQuery,
          },
   
          include: {
            intent: {
              include: {
                expansions: {
                  where: {
                    active:
                      true,
                  },
   
                  orderBy: [
                    {
                      priority:
                        "asc",
                    },
   
                    {
                      createdAt:
                        "asc",
                    },
                  ],
                },
              },
            },
          },
        });
   
    if (
      !aliasMatch ||
      !aliasMatch.active
    ) {
      return null;
    }
   
    return aliasMatch.intent;
   }
   
   async function loadCachedIntent(
    originalQuery:
      string
   ) {
    const lookupKeys =
      buildSearchIntentLookupKeys(
        originalQuery
      );
   
    for (
      const lookupKey of
      lookupKeys
    ) {
      const match =
        await loadIntentByNormalizedKey(
          lookupKey
        );
   
      if (
        match
      ) {
        return {
          intent:
            match,
   
          matchedLookupKey:
            lookupKey,
   
          lookupKeys,
        };
      }
    }
   
    return {
      intent:
        null,
   
      matchedLookupKey:
        null,
   
      lookupKeys,
    };
   }
   
   type CachedIntent =
    NonNullable<
      Awaited<
        ReturnType<
          typeof loadIntentByNormalizedKey
   >
   >
   >;
   
   function mapCachedIntent({
    cachedIntent,
    originalQuery,
   }: {
    cachedIntent:
      CachedIntent;
   
    originalQuery:
      string;
   }): ResolvedSearchIntent {
    return {
      id:
        cachedIntent.id,
   
      normalizedKey:
        cachedIntent
          .normalizedKey,
   
      originalQuery,
   
      displayName:
        cachedIntent
          .displayName,
   
      intentType:
        cachedIntent
          .intentType,
   
      source:
        cachedIntent.source,
   
      reviewStatus:
        cachedIntent
          .reviewStatus,
   
      confidence:
        cachedIntent
          .confidence ===
          null
          ? null
          : Number(
              cachedIntent
                .confidence
            ),
   
      includeOriginalMarketplaceQuery:
        cachedIntent
          .includeOriginalMarketplaceQuery,
   
      expansions:
        cachedIntent
          .expansions
          .map(
            (
              expansion
            ) => ({
              id:
                expansion.id,
   
              kind:
                expansion
                  .expansionKind,
   
              searchTerm:
                expansion
                  .searchTerm,
   
              normalizedSearchTerm:
                expansion
                  .normalizedSearchTerm,
   
              displayName:
                expansion
                  .displayName,
   
              reason:
                expansion.reason,
   
              priority:
                expansion.priority,
   
              confidence:
                expansion
                  .confidence ===
                  null
                  ? null
                  : Number(
                      expansion
                        .confidence
                    ),
            })
          ),
   
      cacheStatus:
        "hit",
    };
   }
   
   async function incrementIntentUsage(
    intentId:
      string
   ) {
    try {
      await prisma
        .searchIntent
        .update({
          where: {
            id:
              intentId,
          },
   
          data: {
            usageCount: {
              increment:
                1,
            },
   
            lastUsedAt:
              new Date(),
          },
        });
    } catch (
      error
    ) {
      console.warn(
        "VidaSearch could not update search-intent usage:",
        {
          intentId,
   
          error:
            error instanceof
              Error
              ? error.message
              : error,
        }
      );
    }
   }
   
   async function resolveWithOpenAi(
    originalQuery:
      string
   ): Promise<
    OpenAiSearchIntentResult
   >{
    if (
      !isOpenAiSearchIntentEnabled()
    ) {
      console.warn(
        "VidaSearch OpenAI intent resolution is disabled:",
        {
          query:
            originalQuery,
        }
      );
   
      throw new Error(
        "This search has not been recognized yet, and new AI-assisted search interpretation is temporarily disabled."
      );
    }
   
    if (
      !process.env
        .OPENAI_API_KEY
    ) {
      throw new Error(
        "OPENAI_API_KEY is not configured."
      );
    }
   
    const model =
      getSearchIntentModel();
   
    console.log(
      "VidaSearch OpenAI search-intent request started:",
      {
        query:
          originalQuery,
   
        model,
      }
    );
   
    const response =
      await openai.responses.create({
        model,
   
        reasoning: {
          effort:
            "low",
        },
   
        max_output_tokens:
          MAX_SEARCH_INTENT_OUTPUT_TOKENS,
   
        instructions:
          SEARCH_INTENT_INSTRUCTIONS,
   
        input:
          `Resolve this VidaSearch customer query: "${originalQuery}". Produce shopping-oriented search expansions for real purchasable products.`,
   
        text: {
          verbosity:
            "low",
   
          format: {
            type:
              "json_schema",
   
            name:
              "vidasearch_search_intent",
   
            strict:
              true,
   
            schema:
              SEARCH_INTENT_SCHEMA,
          },
        },
      });
   
    console.log(
      "VidaSearch OpenAI search-intent request completed:",
      {
        query:
          originalQuery,
   
        model:
          response.model ??
          model,
   
        inputTokens:
          response.usage
            ?.input_tokens ??
          null,
   
        outputTokens:
          response.usage
            ?.output_tokens ??
          null,
   
        totalTokens:
          response.usage
            ?.total_tokens ??
          null,
      }
    );
   
    const outputText =
      response.output_text
        ?.trim();
   
    if (
      !outputText
    ) {
      throw new Error(
        "OpenAI returned no search-intent result."
      );
    }
   
    try {
      return JSON.parse(
        outputText
      ) as OpenAiSearchIntentResult;
    } catch (
      error
    ) {
      console.error(
        "Unable to parse OpenAI search-intent result:",
        {
          originalQuery,
   
          outputText,
   
          error:
            error instanceof
              Error
              ? error.message
              : error,
        }
      );
   
      throw new Error(
        "Unable to parse the search-intent result."
      );
    }
   }
   
   async function saveResolvedIntent({
    originalQuery,
    aiResult,
   }: {
    originalQuery:
      string;
   
    aiResult:
      OpenAiSearchIntentResult;
   }) {
    const fallbackNormalizedKey =
      normalizeSearchIntentText(
        originalQuery
      );
   
    const normalizedKey =
      normalizeSearchIntentText(
        aiResult
          .normalizedKey
      ) ||
      fallbackNormalizedKey;
   
    const intentType =
      mapIntentType(
        aiResult.intentType
      );
   
    const displayName =
      cleanText(
        aiResult.displayName
      ) ||
      originalQuery.trim();
   
    const confidence =
      clamp(
        aiResult.confidence,
        0,
        1
      );
   
    const includeOriginalMarketplaceQuery =
      intentType ===
        SearchIntentType.INVALID
        ? false
        : aiResult
            .includeOriginalMarketplaceQuery;
   
    const deterministicAliases =
      buildSearchIntentLookupKeys(
        originalQuery
      );
   
    const cleanedAliases =
      cleanStringList(
        [
          originalQuery,
          ...deterministicAliases,
          ...aiResult.aliases,
        ],
        MAX_SEARCH_INTENT_ALIASES
      ).filter(
        (alias) =>
          normalizeSearchIntentText(
            alias
          ) !==
          normalizedKey
      );
   
    const cleanedExpansions =
      ensureOriginalDirectQuery({
        originalQuery,
   
        intentType,
   
        includeOriginalMarketplaceQuery,
   
        expansions:
          cleanOpenAiExpansions(
            aiResult.expansions
          ),
      });
   
    const reviewStatus =
      confidence >=
        0.8
        ? SearchIntentReviewStatus
            .ACTIVE
        : SearchIntentReviewStatus
            .NEEDS_REVIEW;
   
    const model =
      getSearchIntentModel();
   
    return prisma.$transaction(
      async (
        transaction
      ) => {
        const intent =
          await transaction
            .searchIntent
            .upsert({
              where: {
                normalizedKey,
              },
   
              create: {
                normalizedKey,
   
                displayName,
   
                intentType,
   
                source:
                  SearchIntentSource
                    .OPENAI,
   
                reviewStatus,
   
                confidence,
   
                sourceModel:
                  model,
   
                methodologyVersion:
                  SEARCH_INTENT_VERSION,
   
                includeOriginalMarketplaceQuery,
   
                notes:
                  cleanText(
                    aiResult.notes
                  ),
   
                resolvedAt:
                  new Date(),
   
                lastUsedAt:
                  new Date(),
   
                usageCount:
                  1,
              },
   
              update: {
                displayName,
   
                intentType,
   
                source:
                  SearchIntentSource
                    .OPENAI,
   
                reviewStatus,
   
                confidence,
   
                sourceModel:
                  model,
   
                methodologyVersion:
                  SEARCH_INTENT_VERSION,
   
                includeOriginalMarketplaceQuery,
   
                notes:
                  cleanText(
                    aiResult.notes
                  ),
   
                resolvedAt:
                  new Date(),
   
                lastUsedAt:
                  new Date(),
   
                usageCount: {
                  increment:
                    1,
                },
              },
            });
   
        await transaction
          .searchIntentExpansion
          .deleteMany({
            where: {
              intentId:
                intent.id,
   
              source:
                SearchIntentSource
                  .OPENAI,
            },
          });
   
        if (
          cleanedExpansions.length >
            0
        ) {
          await transaction
            .searchIntentExpansion
            .createMany({
              data:
                cleanedExpansions.map(
                  (
                    expansion
                  ) => ({
                    intentId:
                      intent.id,
   
                    expansionKind:
                      expansion
                        .expansionKind,
   
                    searchTerm:
                      expansion
                        .searchTerm,
   
                    normalizedSearchTerm:
                      expansion
                        .normalizedSearchTerm,
   
                    displayName:
                      expansion
                        .displayName,
   
                    reason:
                      expansion.reason,
   
                    priority:
                      expansion.priority,
   
                    active:
                      true,
   
                    source:
                      SearchIntentSource
                        .OPENAI,
   
                    confidence:
                      expansion
                        .confidence,
                  })
                ),
   
              skipDuplicates:
                true,
            });
        }
   
        for (
          const alias of
          cleanedAliases
        ) {
          const normalizedAlias =
            normalizeSearchIntentText(
              alias
            );
   
          if (
            !normalizedAlias
          ) {
            continue;
          }
   
          const existingAlias =
            await transaction
              .searchIntentAlias
              .findUnique({
                where: {
                  normalizedAlias,
                },
              });
   
          if (
            existingAlias &&
            existingAlias
              .intentId !==
              intent.id
          ) {
            continue;
          }
   
          await transaction
            .searchIntentAlias
            .upsert({
              where: {
                normalizedAlias,
              },
   
              create: {
                alias,
   
                normalizedAlias,
   
                intentId:
                  intent.id,
   
                source:
                  SearchIntentSource
                    .OPENAI,
   
                confidence,
   
                active:
                  true,
              },
   
              update: {
                alias,
   
                source:
                  SearchIntentSource
                    .OPENAI,
   
                confidence,
   
                active:
                  true,
              },
            });
        }
   
        return transaction
          .searchIntent
          .findUniqueOrThrow({
            where: {
              id:
                intent.id,
            },
   
            include: {
              expansions: {
                where: {
                  active:
                    true,
                },
   
                orderBy: [
                  {
                    priority:
                      "asc",
                  },
   
                  {
                    createdAt:
                      "asc",
                  },
                ],
              },
            },
          });
      }
    );
   }
   
   /*
   * Prevent two simultaneous requests handled by the
   * same running server instance from purchasing the
   * same OpenAI classification twice.
   *
   * The database's unique keys still protect the saved
   * records. A future distributed lock can extend this
   * protection across separate serverless instances.
   */
   const inFlightIntentResolutions =
    new Map<
      string,
      Promise<CachedIntent>
   >();
   
   async function createAndSaveIntent(
    originalQuery:
      string
   ) {
    const aiResult =
      await resolveWithOpenAi(
        originalQuery
      );
   
    return saveResolvedIntent({
      originalQuery,
   
      aiResult,
    });
   }
   
   async function getOrCreateInFlightIntent(
    originalQuery:
      string
   ) {
    const inFlightKey =
      getInFlightLookupKey(
        originalQuery
      );
   
    const existingPromise =
      inFlightIntentResolutions.get(
        inFlightKey
      );
   
    if (
      existingPromise
    ) {
      console.log(
        "VidaSearch joined an in-flight search-intent resolution:",
        {
          query:
            originalQuery,
   
          inFlightKey,
        }
      );
   
      return existingPromise;
    }
   
    const resolutionPromise =
      createAndSaveIntent(
        originalQuery
      );
   
    inFlightIntentResolutions.set(
      inFlightKey,
      resolutionPromise
    );
   
    try {
      return await resolutionPromise;
    } finally {
      inFlightIntentResolutions.delete(
        inFlightKey
      );
    }
   }
   
   export async function resolveSearchIntent(
    rawQuery:
      string
   ): Promise<
    ResolvedSearchIntent>
   {
    const originalQuery =
      rawQuery.trim();
   
    if (
      !originalQuery
    ) {
      throw new Error(
        "A search query is required."
      );
    }
   
    const normalizedQuery =
      normalizeSearchIntentText(
        originalQuery
      );
   
    if (
      normalizedQuery.length <
        2
    ) {
      return {
        id:
          null,
   
        normalizedKey:
          normalizedQuery,
   
        originalQuery,
   
        displayName:
          originalQuery,
   
        intentType:
          SearchIntentType
            .INVALID,
   
        source:
          SearchIntentSource
            .SYSTEM,
   
        reviewStatus:
          SearchIntentReviewStatus
            .ACTIVE,
   
        confidence:
          1,
   
        includeOriginalMarketplaceQuery:
          false,
   
        expansions:
          [],
   
        cacheStatus:
          "created",
      };
    }
   
    const cachedResult =
      await loadCachedIntent(
        originalQuery
      );
   
    if (
      cachedResult.intent
    ) {
      void incrementIntentUsage(
        cachedResult.intent.id
      );
   
      console.log(
        "VidaSearch search-intent database hit:",
        {
          query:
            originalQuery,
   
          requestedNormalizedKey:
            normalizedQuery,
   
          matchedLookupKey:
            cachedResult
              .matchedLookupKey,
   
          savedNormalizedKey:
            cachedResult
              .intent
              .normalizedKey,
   
          intentType:
            cachedResult
              .intent
              .intentType,
   
          expansionCount:
            cachedResult
              .intent
              .expansions
              .length,
        }
      );
   
      return mapCachedIntent({
        cachedIntent:
          cachedResult.intent,
   
        originalQuery,
      });
    }
   
    console.log(
      "VidaSearch search-intent database miss:",
      {
        query:
          originalQuery,
   
        normalizedQuery,
   
        attemptedLookupKeys:
          cachedResult.lookupKeys,
   
        openAiEnabled:
          isOpenAiSearchIntentEnabled(),
   
        model:
          getSearchIntentModel(),
      }
    );
   
    const savedIntent =
      await getOrCreateInFlightIntent(
        originalQuery
      );
   
    console.log(
      "VidaSearch shared search intent created:",
      {
        query:
          originalQuery,
   
        normalizedKey:
          savedIntent
            .normalizedKey,
   
        intentType:
          savedIntent
            .intentType,
   
        confidence:
          savedIntent
            .confidence ===
            null
            ? null
            : Number(
                savedIntent
                  .confidence
              ),
   
        expansionCount:
          savedIntent
            .expansions
            .length,
   
        model:
          savedIntent
            .sourceModel,
      }
    );
   
    return {
      ...mapCachedIntent({
        cachedIntent:
          savedIntent,
   
        originalQuery,
      }),
   
      cacheStatus:
        "created",
    };
   }