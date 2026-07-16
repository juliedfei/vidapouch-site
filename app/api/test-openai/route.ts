import { NextResponse } from "next/server";

import { testOpenAI } from "@/lib/intelligence/testOpenAI";

export async function GET() {
 await testOpenAI();

 return NextResponse.json({
   success: true,
 });
}