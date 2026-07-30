import type {
    NextRequest,
   } from "next/server";
   
   import {
    NextResponse,
   } from "next/server";
   
   export function proxy(
    request:
      NextRequest
   ) {
    const hostname =
      request.headers
        .get(
          "host"
        )
        ?.split(
          ":"
        )[0]
        .toLowerCase();
   
    const pathname =
      request.nextUrl.pathname;
   
    /*
     * Show the existing /v2 experience at
     * vidasearch.com without displaying /v2
     * in the browser address.
     */
    if (
      hostname ===
        "vidasearch.com" ||
      hostname ===
        "www.vidasearch.com"
    ) {
      if (
        pathname ===
        "/"
      ) {
        const rewriteUrl =
          request.nextUrl.clone();
   
        rewriteUrl.pathname =
          "/v2";
   
        return NextResponse.rewrite(
          rewriteUrl
        );
      }
    }
   
    return NextResponse.next();
   }
   
   export const config = {
    matcher:
      [
        "/",
      ],
   };
   