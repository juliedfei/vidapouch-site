import {
  NextResponse,
 } from "next/server";
 
 import {
  findSearchProducts,
 } from "@/lib/search/findSearchProducts";
 
 import {
  buildSearchProductOptions,
 } from "@/lib/search/buildSearchProductOptions";
 
 export const runtime =
  "nodejs";
 
 export const dynamic =
  "force-dynamic";
 
 export async function POST(
  request: Request
 ) {
  try {
    const body =
      (await request.json()) as {
        supplement?: string;
        brand?: string;
        capsulesPerDay?: number;
      };
 
    const supplement =
      body.supplement?.trim();
 
    if (!supplement) {
      return NextResponse.json(
        {
          error:
            "Supplement is required.",
        },
        {
          status: 400,
        }
      );
    }
 
    const listings =
      await findSearchProducts({
        supplement,
 
        brand:
          body.brand?.trim() ||
          undefined,
      });
 
    console.log(
      "VitaSearch listings found:",
      listings.length
    );
 
    const products =
      await buildSearchProductOptions(
        listings,
        body.capsulesPerDay ?? 1
      );
 
    console.log(
      "VitaSearch products built:",
      products.length
    );
 
    return NextResponse.json(
      products
    );
  } catch (error) {
    console.error(
      "VitaSearch route failed:",
      error
    );
 
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Search failed.",
      },
      {
        status: 500,
      }
    );
  }
 }