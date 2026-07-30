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
        .toLowerCase() ??
      "";
   
    const pathname =
      request.nextUrl.pathname;
   
    /*
     * VidaSearch.com:
     * Show the existing /v2 page at the root
     * while keeping vidasearch.com in the browser.
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
   
    /*
     * VidaPouch.com:
     * Redirect the old /v2 address to VidaSearch.com.
     */
    if (
      hostname ===
        "vidapouch.com" ||
      hostname ===
        "www.vidapouch.com"
    ) {
      if (
        pathname ===
          "/v2" ||
        pathname.startsWith(
          "/v2/"
        )
      ) {
        const remainingPath =
          pathname.replace(
            /^\/v2/,
            ""
          );
   
        const destination =
          new URL(
            remainingPath || "/",
            "https://vidasearch.com"
          );
   
        destination.search =
          request.nextUrl.search;
   
        return NextResponse.redirect(
          destination,
          308
        );
      }
    }
   
    return NextResponse.next();
   }
   
   export const config = {
    matcher:
      [
        "/",
        "/v2",
        "/v2/:path*",
      ],
   };
   