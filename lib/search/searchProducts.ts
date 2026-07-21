import type {
  SearchProductOption,
 } from "@/lib/search/searchProductOption";
 
 export async function searchProducts({
  supplement,
  brand,
  capsulesPerDay = 1,
  signal,
 }: {
  supplement: string;
  brand?: string;
  capsulesPerDay?: number;
  signal?: AbortSignal;
 }): Promise<SearchProductOption[]> {
  const response = await fetch(
    "/api/search",
    {
      method: "POST",
 
      headers: {
        "Content-Type":
          "application/json",
      },
 
      body: JSON.stringify({
        supplement,
        brand,
        capsulesPerDay,
      }),
 
      signal,
    }
  );
 
  if (!response.ok) {
    const errorBody =
      await response
        .json()
        .catch(() => null);
 
    throw new Error(
      errorBody?.error ||
        "Search failed."
    );
  }
 
  return response.json();
 }
 