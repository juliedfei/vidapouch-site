import {
    NextRequest,
    NextResponse,
   } from "next/server";
   
   import {
    SearchIntentReviewStatus,
    SearchIntentType,
   } from "@/lib/generated/prisma/client";
   
   import {
    prisma,
   } from "@/lib/db";
   
   const MINIMUM_QUERY_LENGTH =
    2;
   
   const MAX_QUERY_LENGTH =
    100;
   
   const MAX_RESULTS =
    8;
   
   const DATABASE_RESULT_LIMIT =
    12;
   



    type SuggestionType =
    | "supplement"
    | "goal"
    | "condition"
    | "life-stage"
    | "brand"
    | "search";



   
   type SearchSuggestion = {
    id:
      string;
   
    label:
      string;
   
    query:
      string;
   
    type:
      SuggestionType;
   
    score:
      number;
   };
   
   function cleanText(
    value:
      string
   ) {
    return value
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   function normalizeText(
    value:
      string
   ) {
    return cleanText(
      value
    )
      .toLowerCase()
      .replace(
        /[®™©]/g,
        ""
      )
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
   
   function calculateMatchScore({
    query,
    label,
    alias,
    baseScore,
   }: {
    query:
      string;
   
    label:
      string;
   
    alias?:
      string | null;
   
    baseScore:
      number;
   }) {
    const normalizedQuery =
      normalizeText(
        query
      );
   
    const normalizedLabel =
      normalizeText(
        label
      );
   
    const normalizedAlias =
      alias
        ? normalizeText(
            alias
          )
        : "";
   
    if (
      normalizedLabel ===
        normalizedQuery
    ) {
      return baseScore +
        100;
    }
   
    if (
      normalizedAlias ===
        normalizedQuery
    ) {
      return baseScore +
        95;
    }
   
    if (
      normalizedLabel.startsWith(
        normalizedQuery
      )
    ) {
      return baseScore +
        80;
    }
   
    if (
      normalizedAlias.startsWith(
        normalizedQuery
      )
    ) {
      return baseScore +
        75;
    }
   
    const labelWords =
      normalizedLabel.split(
        " "
      );
   
    if (
      labelWords.some(
        (
          word
        ) =>
          word.startsWith(
            normalizedQuery
          )
      )
    ) {
      return baseScore +
        60;
    }
   
    if (
      normalizedLabel.includes(
        normalizedQuery
      )
    ) {
      return baseScore +
        45;
    }
   
    if (
      normalizedAlias.includes(
        normalizedQuery
      )
    ) {
      return baseScore +
        40;
    }
   
    return baseScore;
   }
   
   function deduplicateSuggestions(
    suggestions:
      SearchSuggestion[]
   ) {
    const suggestionsByKey =
      new Map<
        string,
        SearchSuggestion
   >();
   
    for (
      const suggestion of
      suggestions
    ) {
      const key =
        [
          suggestion.type,
          normalizeText(
            suggestion.query
          ),
        ].join(
          ":"
        );
   
      const existing =
        suggestionsByKey.get(
          key
        );
   
      if (
        !existing ||
        suggestion.score >
          existing.score
      ) {
        suggestionsByKey.set(
          key,
          suggestion
        );
      }
    }
   
    return Array.from(
      suggestionsByKey.values()
    )
      .sort(
        (
          first,
          second
        ) => {
          if (
            second.score !==
            first.score
          ) {
            return (
              second.score -
              first.score
            );
          }
   
          return first.label.localeCompare(
            second.label
          );
        }
      )
      .slice(
        0,
        MAX_RESULTS
      );
   }
   
   async function findSupplementSuggestions(
    query:
      string
   ): Promise<
    SearchSuggestion[]
   >{
    const supplements =
      await prisma.supplement.findMany({
        where: {
          OR: [
            {
              canonicalName: {
                contains:
                  query,
   
                mode:
                  "insensitive",
              },
            },
            {
              aliases: {
                some: {
                  alias: {
                    contains:
                      query,
   
                    mode:
                      "insensitive",
                  },
                },
              },
            },
          ],
        },
   
        select: {
          id:
            true,
   
          canonicalName:
            true,
   
          aliases: {
            where: {
              alias: {
                contains:
                  query,
   
                mode:
                  "insensitive",
              },
            },
   
            select: {
              alias:
                true,
            },
   
            take:
              3,
          },
        },
   
        take:
          DATABASE_RESULT_LIMIT,
      });
   
    return supplements.map(
      (
        supplement
      ) => {
        const matchingAlias =
          supplement.aliases[0]
            ?.alias ??
          null;
   
        return {
          id:
            `supplement:${supplement.id}`,
   
          label:
            supplement.canonicalName,
   
          query:
            supplement.canonicalName,
   
          type:
            "supplement",
   
          score:
            calculateMatchScore({
              query,
   
              label:
                supplement.canonicalName,
   
              alias:
                matchingAlias,
   
              baseScore:
                400,
            }),
        };
      }
    );
   }
   




   async function findHealthTopicSuggestions(
    query:
      string
   ): Promise<
    SearchSuggestion[]
  > {
    const intents =
      await prisma.searchIntent.findMany({
        where: {
          intentType: {
            in: [
              SearchIntentType
                .HEALTH_GOAL,
   
              SearchIntentType
                .HEALTH_CONDITION,
   
              SearchIntentType
                .LIFE_STAGE,
            ],
          },
   
          reviewStatus: {
            in: [
              SearchIntentReviewStatus
                .ACTIVE,
   
              SearchIntentReviewStatus
                .NEEDS_REVIEW,
            ],
          },
   
          OR: [
            {
              displayName: {
                contains:
                  query,
   
                mode:
                  "insensitive",
              },
            },
            {
              normalizedKey: {
                contains:
                  normalizeText(
                    query
                  ),
              },
            },
            {
              aliases: {
                some: {
                  active:
                    true,
   
                  alias: {
                    contains:
                      query,
   
                    mode:
                      "insensitive",
                  },
                },
              },
            },
          ],
        },
   
        select: {
          id:
            true,
   
          displayName:
            true,
   
          normalizedKey:
            true,
   
          intentType:
            true,
   
          usageCount:
            true,
   
          aliases: {
            where: {
              active:
                true,
   
              alias: {
                contains:
                  query,
   
                mode:
                  "insensitive",
              },
            },
   
            select: {
              alias:
                true,
            },
   
            take:
              3,
          },
        },
   
        orderBy: [
          {
            usageCount:
              "desc",
          },
          {
            displayName:
              "asc",
          },
        ],
   
        take:
          DATABASE_RESULT_LIMIT,
      });
   
    return intents.map(
      (
        intent
      ) => {
        const matchingAlias =
          intent.aliases[0]
            ?.alias ??
          null;
   
        const suggestionType:
          SuggestionType =
          intent.intentType ===
            SearchIntentType
              .HEALTH_CONDITION
            ? "condition"
            : intent.intentType ===
                SearchIntentType
                  .LIFE_STAGE
              ? "life-stage"
              : "goal";
   
        const baseScore =
          intent.intentType ===
            SearchIntentType
              .HEALTH_GOAL
            ? 300
            : intent.intentType ===
                SearchIntentType
                  .HEALTH_CONDITION
              ? 290
              : 280;
   
        return {
          id:
            `${suggestionType}:${intent.id}`,
   
          label:
            intent.displayName,
   
          query:
            intent.displayName,
   
          type:
            suggestionType,
   
          score:
            calculateMatchScore({
              query,
   
              label:
                intent.displayName,
   
              alias:
                matchingAlias,
   
              baseScore:
                baseScore +
                Math.min(
                  intent.usageCount,
                  25
                ),
            }),
        };
      }
    );
   }





   
   async function findBrandSuggestions(
    query:
      string
   ): Promise<
    SearchSuggestion[]
   >{
    const brands =
      await prisma.brand.findMany({
        where: {
          AND: [
            {
              canonicalName: {
                not: {
                  startsWith:
                    "Retired —",
                },
              },
            },
            {
              OR: [
                {
                  canonicalName: {
                    contains:
                      query,
   
                    mode:
                      "insensitive",
                  },
                },
                {
                  aliases: {
                    some: {
                      alias: {
                        contains:
                          query,
   
                        mode:
                          "insensitive",
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
   
        select: {
          id:
            true,
   
          canonicalName:
            true,
   
          aliases: {
            where: {
              alias: {
                contains:
                  query,
   
                mode:
                  "insensitive",
              },
            },
   
            select: {
              alias:
                true,
            },
   
            take:
              3,
          },
        },
   
        take:
          DATABASE_RESULT_LIMIT,
      });
   
    return brands.map(
      (
        brand
      ) => {
        const matchingAlias =
          brand.aliases[0]
            ?.alias ??
          null;
   
        return {
          id:
            `brand:${brand.id}`,
   
          label:
            brand.canonicalName,
   
          query:
            brand.canonicalName,
   
          type:
            "brand",
   
          score:
            calculateMatchScore({
              query,
   
              label:
                brand.canonicalName,
   
              alias:
                matchingAlias,
   
              baseScore:
                200,
            }),
        };
      }
    );
   }
   
   function buildFreeTextSuggestion(
    query:
      string
   ): SearchSuggestion {
    return {
      id:
        `search:${normalizeText(
          query
        )}`,
   
      label:
        `Search for “${query}”`,
   
      query,
   
      type:
        "search",
   
      score:
        10,
    };
   }
   
   export async function GET(
    request:
      NextRequest
   ) {
    const rawQuery =
      request.nextUrl.searchParams
        .get(
          "q"
        ) ??
      "";
   
    const query =
      cleanText(
        rawQuery
      ).slice(
        0,
        MAX_QUERY_LENGTH
      );
   
    if (
      query.length <
      MINIMUM_QUERY_LENGTH
    ) {
      return NextResponse.json({
        suggestions: [],
      });
    }
   
    try {
      
      
      
        const [
            supplementSuggestions,
            healthTopicSuggestions,
            brandSuggestions,
           ] =
            await Promise.all([
              findSupplementSuggestions(
                query
              ),
           
              findHealthTopicSuggestions(
                query
              ),
           
              findBrandSuggestions(
                query
              ),
            ]);
           




   
            const databaseSuggestions =
            deduplicateSuggestions([
              ...supplementSuggestions,
              ...healthTopicSuggestions,
              ...brandSuggestions,
            ]);




   
      const hasExactSuggestion =
        databaseSuggestions.some(
          (
            suggestion
          ) =>
            normalizeText(
              suggestion.query
            ) ===
            normalizeText(
              query
            )
        );
   
      const suggestions =
        hasExactSuggestion
          ? databaseSuggestions
          : deduplicateSuggestions([
              ...databaseSuggestions,
              buildFreeTextSuggestion(
                query
              ),
            ]);
   
      return NextResponse.json(
        {
          suggestions:
            suggestions.map(
              (
                suggestion
              ) => ({
                id:
                  suggestion.id,
   
                label:
                  suggestion.label,
   
                query:
                  suggestion.query,
   
                type:
                  suggestion.type,
              })
            ),
        },
        {
          headers: {
            "Cache-Control":
              "private, max-age=30, stale-while-revalidate=60",
          },
        }
      );
    } catch (
      error
    ) {
      console.error(
        "VidaSearch suggestion route failed:",
        {
          query,
   
          error:
            error instanceof
              Error
              ? error.message
              : String(
                  error
                ),
        }
      );
   
      return NextResponse.json(
        {
          suggestions: [
            {
              id:
                `search:${normalizeText(
                  query
                )}`,
   
              label:
                `Search for “${query}”`,
   
              query,
   
              type:
                "search",
            },
          ],
        },
        {
          status:
            200,
        }
      );
    }
   }
   