export type SearchResult = {

    title: string;
   
    url: string;
   
    snippet?: string;
   
    source: string;
   
    position: number;
   
    confidence: number;
   
   };
   
   export type SearchRequest = {
   
    query: string;
   
    preferredDomains?: string[];
   
    maxResults?: number;
   
   };
   
   export type SearchResponse = {
   
    results: SearchResult[];
   
   };