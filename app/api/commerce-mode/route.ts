import {
    NextResponse,
   } from "next/server";
   
   import {
    getVidaPouchSalesMode,
   } from "@/lib/commerce/getVidaPouchSalesMode";
   
   export const runtime =
    "nodejs";
   
   export const dynamic =
    "force-dynamic";
   
   export async function GET() {
    try {
      const salesMode =
        await getVidaPouchSalesMode();
   
      return NextResponse.json(
        {
          salesMode,
        },
        {
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        }
      );
    } catch (
      error
    ) {
      console.error(
        "Unable to load VidaPouch sales mode:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Unable to load the current VidaPouch sales mode.",
        },
        {
          status:
            500,
   
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        }
      );
    }
   }
   