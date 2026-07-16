import { openai } from "@/lib/openai";

export type AISearchRequest = {
 /*
  * High-level instructions.
  */
 systemPrompt: string;

 /*
  * User request.
  */
 userPrompt: string;

 /*
  * Optional JSON schema.
  *
  * When omitted, plain text is returned.
  */
 schema?: object;

 /*
  * Optional model override.
  */
 model?: string;
};

export async function performAISearch({
 systemPrompt,
 userPrompt,
 schema,
 model = "gpt-5",
}: AISearchRequest) {

 const response =
   await openai.responses.create({

     model,

     input: [
       {
         role: "system",
         content: systemPrompt,
       },
       {
         role: "user",
         content: userPrompt,
       },
     ],

   });

 /*
  * Phase 1
  *
  * Plain-text responses.
  *
  * Later we'll upgrade this helper to:
  *
  * • Web Search
  * • Structured Outputs
  * • Automatic schema validation
  * • Automatic retries
  * • Logging
  * • Usage metrics
  * • Cost tracking
  * • Caching
  */

 if (!schema) {
   return response.output_text;
 }

 /*
  * Placeholder.
  *
  * Structured Outputs are the next feature
  * we'll add.
  */
 return response.output_text;

}
