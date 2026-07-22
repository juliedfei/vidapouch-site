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
   
   const SEARCH_INTENT_MODEL =
    "gpt-5.6";
   
   const SEARCH_INTENT_VERSION =
    "search-intent-v1";
   
   const MAX_ALIASES =
    12;
   
   const MAX_DIRECT_QUERIES =
    6;
   
   const MAX_RELATED_QUERIES =
    12;
   
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
   
   type OpenAiSearchIntentExpansion = {
    kind:
      "DIRECT_QUERY" |
      "RELATED_SUPPLEMENT" |
      "BRAND_QUERY" |
      "DOCTOR_QUERY";
   
    searchTerm:
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
   
   type OpenAiSearchIntentResult = {
    normalizedKey:
      string;
   
    displayName:
      string;
   
    intentType:
      "SUPPLEMENT" |
      "HEALTH_GOAL" |
      "BRAND" |
      "DOCTOR_TYPE" |
      "INVALID";
   
    includeOriginalMarketplaceQuery:
      boolean;
   
    aliases:
      string[];
   
    expansions:
      OpenAiSearchIntentExpansion[];
   
    confidence:
      number;
   
    notes:
      string | null;
   };
   
   const SEARCH_INTENT_SCHEMA = {
    type:
      "object",
   
    additionalProperties:
      false,
   
    properties: {
      normalizedKey: {
        type:
          "string",
      },
   
      displayName: {
        type:
          "string",
      },
   
      intentType: {
        type:
          "string",
   
        enum: [
          "SUPPLEMENT",
          "HEALTH_GOAL",
          "BRAND",
          "DOCTOR_TYPE",
          "INVALID",
        ],
      },
   
      includeOriginalMarketplaceQuery: {
        type:
          "boolean",
      },
   
      aliases: {
        type:
          "array",
   
        items: {
          type:
            "string",
        },
      },
   
      expansions: {
        type:
          "array",
   
        items: {
          type:
            "object",
   
          additionalProperties:
            false,
   
          properties: {
            kind: {
              type:
                "string",
   
              enum: [
                "DIRECT_QUERY",
                "RELATED_SUPPLEMENT",
                "BRAND_QUERY",
                "DOCTOR_QUERY",
              ],
            },
   
            searchTerm: {
              type:
                "string",
            },
   
            displayName: {
              type: [
                "string",
                "null",
              ],
            },
   
            reason: {
              type: [
                "string",
                "null",
              ],
            },
   
            priority: {
              type:
                "integer",
   
              minimum:
                1,
   
              maximum:
                1000,
            },
   
            confidence: {
              type:
                "number",
   
              minimum:
                0,
   
              maximum:
                1,
            },
          },
   
          required: [
            "kind",
            "searchTerm",
            "displayName",
            "reason",
            "priority",
            "confidence",
          ],
        },
      },
   
      confidence: {
        type:
          "number",
   
        minimum:
          0,
   
        maximum:
          1,
      },
   
      notes: {
        type: [
          "string",
          "null",
        ],
      },
    },
   
    required: [
      "normalizedKey",
      "displayName",
      "intentType",
      "includeOriginalMarketplaceQuery",
      "aliases",
      "expansions",
      "confidence",
      "notes",
    ],
   } as const;
   
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
      return MAX_DIRECT_QUERIES;
    }
   
    return MAX_RELATED_QUERIES;
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
   



   
   /*
   * JavaScript does not support the free-spacing /x
   * regular-expression flag, so this performs the
   * same commercial-term check without relying on it.
   */
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
   
   async function loadCachedIntent(
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
   
   function mapCachedIntent({
    cachedIntent,
    originalQuery,
   }: {
    cachedIntent:
      NonNullable<
        Awaited<
          ReturnType<
            typeof loadCachedIntent
   >
   >
   >;
   
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
            error instanceof Error
              ? error.message
              : error,
        }
      );
    }
   }
   
   async function resolveWithOpenAi(
    originalQuery:
      string
   ): Promise<OpenAiSearchIntentResult> {
    if (
      !process.env
        .OPENAI_API_KEY
    ) {
      throw new Error(
        "OPENAI_API_KEY is not configured."
      );
    }
   
    const response =
      await openai.responses.create({
        model:
          SEARCH_INTENT_MODEL,
   
        instructions: `
   You are the search-intent resolver for VidaSearch, a supplement shopping and comparison service.
   
   Your job is to interpret a customer search and produce marketplace search queries that return real purchasable products.
   
   VidaSearch product results must remain purchase-oriented. They must lead to actual products, brands, prices, retailer listings, ratings, and vendor purchase links.
   
   INTENT TYPES
   
   SUPPLEMENT:
   The customer is searching for a specific supplement, vitamin, mineral, botanical, amino acid, protein, probiotic, or related supplement ingredient.
   
   HEALTH_GOAL:
   The customer is searching for a wellness goal, such as sleep, mood support, energy, digestion, focus, stress, immunity, joint support, or skin health.
   
   BRAND:
   The customer is searching for a supplement brand.
   
   DOCTOR_TYPE:
   The customer is searching for a practitioner category. This intent is reserved for a future practitioner search experience.
   
   INVALID:
   The query is unrelated to supplements, wellness goals, supplement brands, or practitioner categories.
   
   MARKETPLACE SEARCH RULES
   
   - Preserve direct marketplace discovery.
   - For a health goal, include direct commercial queries that can find products explicitly marketed for that goal.
   - Example: a search for "mood" should include queries such as "mood supplements" and "mood support supplement."
   - Do not replace direct goal-product searches with only ingredient searches.
   - Related supplement expansions must still be shopping queries, not informational topics.
   - Search terms should be concise and commercially useful for Google Shopping or another product-search provider.
   - Avoid overly narrow wording that would unnecessarily exclude relevant products.
   - Generate multiple useful related supplement categories when appropriate.
   - Do not impose an artificial product-count limit. These are query expansions, not final products.
   - Do not generate duplicate or nearly identical queries.
   - Do not generate queries for prescription medications, controlled drugs, or disease treatments.
   - "Mood stabilizer" is commonly a prescription-treatment term. For supplement shopping, use terms such as "mood support supplement," "mood balance supplement," or "emotional wellness supplement" instead.
   - Do not imply that supplements diagnose, prevent, cure, or treat diseases.
   - Keep reasons neutral and brief.
   - For INVALID intent, return no expansions.
   - For DOCTOR_TYPE intent, do not create supplement-product expansions.
   
   DATABASE RULES
   
   - normalizedKey should be a short canonical form suitable for database lookup.
   - aliases should include realistic alternate phrasings, not speculative phrases.
   - confidence must reflect certainty about the classification.
   - includeOriginalMarketplaceQuery should normally be true for SUPPLEMENT, HEALTH_GOAL, and BRAND intents.
   - The application will automatically ensure that the original commercial marketplace phrase is included, so expansions should add useful coverage rather than repeat the same phrase many times.
   
   OUTPUT RULES
   
   Return data only through the required JSON schema.
   Do not return prose outside the schema.
        `,
   
        input: `
   Resolve this VidaSearch customer query:
   
   ${originalQuery}
   
   Create search expansions that will ultimately return actual purchasable product listings with vendor offers.
   
   For a broad health goal, preserve products explicitly marketed for the goal and also include related supplement categories.
        `,
   
        text: {
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
            error instanceof Error
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
   
    const cleanedAliases =
      cleanStringList(
        [
          originalQuery,
          ...aiResult.aliases,
        ],
        MAX_ALIASES
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
   
    const saved =
      await prisma.$transaction(
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
                    SEARCH_INTENT_MODEL,
   
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
                    SEARCH_INTENT_MODEL,
   
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
   
    return saved;
   }
   
   export async function resolveSearchIntent(
    rawQuery:
      string
   ): Promise<ResolvedSearchIntent> {
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
   
    const cachedIntent =
      await loadCachedIntent(
        normalizedQuery
      );
   
    if (
      cachedIntent
    ) {
      void incrementIntentUsage(
        cachedIntent.id
      );
   
      console.log(
        "VidaSearch search-intent cache hit:",
        {
          query:
            originalQuery,
   
          normalizedKey:
            cachedIntent
              .normalizedKey,
   
          intentType:
            cachedIntent
              .intentType,
   
          expansionCount:
            cachedIntent
              .expansions
              .length,
        }
      );
   
      return mapCachedIntent({
        cachedIntent,
   
        originalQuery,
      });
    }
   
    console.log(
      "VidaSearch search-intent cache miss:",
      {
        query:
          originalQuery,
   
        normalizedQuery,
      }
    );
   
    const aiResult =
      await resolveWithOpenAi(
        originalQuery
      );
   
    const savedIntent =
      await saveResolvedIntent({
        originalQuery,
   
        aiResult,
      });
   
    console.log(
      "VidaSearch search intent created:",
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