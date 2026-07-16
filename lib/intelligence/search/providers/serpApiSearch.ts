import type {
    SearchRequest,
    SearchResponse,
    SearchResult,
   } from "../searchTypes";
   
   const SERP_API_ENDPOINT =
    "https://serpapi.com/search.json";
   
   type SerpOrganicResult = {
    title?: unknown;
    link?: unknown;
    snippet?: unknown;
   };
   
   type SerpApiResponse = {
    organic_results?: unknown;
    error?: unknown;
   };
   
   function stringValue(
    value: unknown
   ): string | undefined {
    return typeof value === "string"
      ? value
      : undefined;
   }
   
   function calculateConfidence(
    position: number,
    url: string
   ) {
    let confidence =
      Math.max(
        0.25,
        1 - (position - 1) * 0.08
      );
   
    /*
     * Official manufacturer websites
     * receive a confidence boost.
     */
    if (
      !url.includes("amazon.") &&
      !url.includes("walmart.") &&
      !url.includes("target.") &&
      !url.includes("iherb.") &&
      !url.includes("costco.")
    ) {
      confidence += 0.15;
    }
   
    return Math.min(
      1,
      confidence
    );
   }
   
   export async function serpApiSearch({
    query,
    maxResults = 10,
   }: SearchRequest): Promise<SearchResponse> {
   
    const apiKey =
      process.env.SERP_API_KEY;
   
    if (!apiKey) {
      throw new Error(
        "SERP_API_KEY is missing."
      );
    }
   
    const params =
      new URLSearchParams({
   
        engine: "google",
   
        q: query,
   
        num: String(maxResults),
   
        api_key: apiKey,
   
      });
   
    const response =
      await fetch(
        `${SERP_API_ENDPOINT}?${params.toString()}`,
        {
          cache: "no-store",
        }
      );
   
    if (!response.ok) {
      throw new Error(
        `SERP API request failed (${response.status})`
      );
    }
   
    const json =
      (await response.json()) as
        SerpApiResponse;
   
    if (json.error) {
      throw new Error(
        String(json.error)
      );
    }
   
    const organic =
      Array.isArray(
        json.organic_results
      )
        ? json.organic_results
        : [];
   



        const mappedResults: Array<
        SearchResult | null>
       = organic.map(
          (
            result,
            index
          ) => {
         
            const entry =
              result as SerpOrganicResult;
         
            const title =
              stringValue(
                entry.title
              );
         
            const url =
              stringValue(
                entry.link
              );
         
            if (
              !title ||
              !url
            ) {
              return null;
            }
         
            return {
         
              title,
         
              url,
         
              snippet:
                stringValue(
                  entry.snippet
                ),
         
              source:
                "SERP API",
         
              position:
                index + 1,
         
              confidence:
                calculateConfidence(
                  index + 1,
                  url
                ),
         
            };
         
          }
         );
         
         const results: SearchResult[] =
          mappedResults.filter(
            (
              value
            ): value is SearchResult =>
              value !== null
          );






   
    return {
      results,
    };
   }
   