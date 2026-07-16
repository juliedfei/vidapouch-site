import {
    NextResponse,
   } from "next/server";
   
   import {
    processNextBrandJob,
   } from "@/lib/intelligence/processNextBrandJob";
   
   export async function POST() {
    try {
      const result =
        await processNextBrandJob();
   
      return NextResponse.json(
        result
      );
    } catch (error) {
      console.error(
        "Brand intelligence worker failed:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Brand intelligence worker failed.",
        },
        {
          status: 500,
        }
      );
    }
   }
   