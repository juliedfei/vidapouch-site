import {
    serpApiSearch,
   } from "./providers/serpApiSearch";
   
   import type {
    SearchRequest,
    SearchResponse,
    SearchResult,
   } from "./searchTypes";
   
   /*
   * Master search entry point.
   *
   * Every search provider plugs in here.
   */
   export async function searchProduct({
    query,
    preferredDomains,
    maxResults = 10,
   }: SearchRequest): Promise<SearchResponse> {
   
    const providerResults = await Promise.all([
   
      serpApiSearch({
        query,
        preferredDomains,
        maxResults,
      }),
   
    ]);
   
    /*
     * Merge provider results.
     *
     * Eventually:
     *  • Remove duplicates
     *  • Rank confidence
     *  • Prefer official domains
     *  • Cache
     */
    const results: SearchResult[] =
      providerResults.flatMap(
        provider => provider.results
      );
   
    return {
      results,
    };
   }