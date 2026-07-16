import { openai } from "@/lib/openai";

export async function testOpenAI() {
 const response = await openai.responses.create({
   model: "gpt-5",
   input: "Reply with exactly the word: Connected",
 });

 console.log(response.output_text);
}