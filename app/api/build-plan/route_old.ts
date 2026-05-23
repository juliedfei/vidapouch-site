import { NextResponse } from "next/server";

export async function POST(req: Request) {
 let supplements: any[] = [];
 let goals: string[] = [];

 try {
   const body = await req.json();

   supplements = body.supplements || [];
   goals = body.goals || [];

   const isGoalBasedRequest = goals.length > 0;

   const prompt = isGoalBasedRequest
     ? `
Create a curated supplement pouch routine based ONLY on these selected wellness goals.

Selected goals:
${JSON.stringify(goals)}

Return ONLY this exact JSON shape:
{
 "morning": [],
 "evening": [],
 "unrecognized": [],
 "suggestedAdditions": []
}

Rules:
- This is not medical advice.
- Recommend only common, generally recognizable supplement categories.
- Do NOT recommend prescription medications.
- Do NOT recommend powders, drink mixes, gummies, liquids, foods, or anything not suitable for pill/capsule/tablet pouches.
- Use empty strings for dosage and brand.
- Make the core morning/evening plan feel like a real curated pouch.
- If 1 goal is selected, usually recommend 2–4 total core supplements.
- If 2 goals are selected, usually recommend 3–5 total core supplements.
- If 3 or more goals are selected, recommend 4–6 total core supplements max.
- Avoid redundant supplements in the core plan.
- ONLY recommend core supplements that directly match the selected goals.
- Do NOT recommend supplements for goals that are not selected.
- Do NOT overuse Vitamin D.
- Only recommend Vitamin D when it is strongly relevant, such as Bone / joint support, Immune support, General wellness, or clear Vitamin D-related context.
- If Sleep is NOT selected, do NOT recommend Magnesium or Melatonin.
- If Stress / mood is NOT selected and Sleep is NOT selected, do NOT recommend Magnesium.
- If Sleep IS selected, choose ONE primary sleep support by default.
- For Sleep, prefer Magnesium as the default evening option.
- Do NOT include both Magnesium and Melatonin in the core plan unless the selected goals or wording specifically imply sleep onset trouble or short-term sleep support.
- Melatonin should usually appear as a suggested addition for Sleep, not as a default core plan item.
- For Energy, consider B Complex, CoQ10, or Rhodiola. Use Vitamin D only if it is clearly justified.
- For Focus / brain health, consider Omega-3, B Complex, L-Theanine, or Bacopa.
- For Stress / mood, consider L-Theanine, Ashwagandha, or Magnesium if appropriate.
- For Heart / circulation, consider Omega-3, CoQ10, or Magnesium.
- For Muscle / strength, consider Creatine capsules, Magnesium, or Zinc.
- For Endurance, consider Creatine capsules, CoQ10, or B Complex.
- For Hair / skin / nails, consider Biotin, Collagen capsules, Zinc, or Vitamin C.
- For Gut health, consider Probiotic capsules or Digestive Enzymes capsules.
- For Immune support, consider Vitamin C, Zinc, Elderberry capsules, or Vitamin D.
- For Bone / joint support, consider Vitamin D, Calcium, Magnesium, or Glucosamine capsules.
- For General wellness, consider a balanced mix such as Multivitamin, Omega-3, Probiotic, or Magnesium. Do not default to only Vitamin D.
- If a goal is too medical/specific or unsafe to suggest for, put a review item in unrecognized with reason "needs_confirmation".

Suggested additions rules:
- Add 2–4 optional supplements in suggestedAdditions when helpful.
- Suggested additions should be relevant to the selected goals but not essential to the core plan.
- Do NOT duplicate anything already in morning or evening.
- Include recognizable optional choices users may expect, such as Melatonin for Sleep, Collagen for Hair / skin / nails, CoQ10 for Energy or Heart / circulation, or Creatine capsules for Muscle / strength.
- Suggested additions must also be suitable for pill/capsule/tablet pouches.
- Each suggested addition must include a short reason and suggestedTiming.

Timing rules:
- Morning: energizing vitamins, B Complex, Vitamin D, CoQ10, Omega-3, Creatine.
- Evening: Magnesium, calming support, sleep support.
- If uncertain but recognized, choose the most reasonable time.

Return supplement objects like:
{
 "name": "B Complex",
 "dosage": "",
 "brand": ""
}

For suggested additions, return:
{
 "name": "Melatonin",
 "dosage": "",
 "brand": "",
 "reason": "Optional sleep-onset support.",
 "suggestedTiming": "evening"
}

For unrecognized items, return:
{
 "name": goal or concern,
 "dosage": "",
 "brand": "",
 "reason": "needs_confirmation",
 "note": "Short explanation"
}
`
     : `
Organize this list into morning, evening, and unrecognized.

Return ONLY this exact JSON shape:
{
 "morning": [],
 "evening": [],
 "unrecognized": [],
 "suggestedAdditions": []
}

Rules:
- Keep original objects unchanged when placing them in morning/evening.
- If the item is not clearly a supplement, put it in unrecognized.
- If the item looks misspelled or incomplete, put it in unrecognized with reason "possible_misspelling" and a suggestion if likely.
- Example: "magnesiu" should be unrecognized with suggestion "magnesium".
- Do NOT assume an item is powder unless the user writes powder, drink mix, scoop, liquid, gummy, food, medication, or prescription.
- Plain "creatine" is a recognized supplement and should usually go in morning.
- "creatine capsule" or "creatine pill" is supported and should usually go in morning.
- "creatine powder", "creatine drink mix", or "creatine gummies" should go in unrecognized with reason "unsupported_format".
- If a brand/product is uncertain, put it in unrecognized with reason "needs_confirmation".
- Magnesium should usually be evening, but only if clearly written as magnesium.
- Melatonin should be evening.
- Vitamin D should usually be morning.
- Fish oil / omega should usually be morning.
- For this supplement-entry flow, suggestedAdditions should usually be an empty array.

For unrecognized items, return:
{
 "name": original name,
 "dosage": original dosage or "",
 "brand": original brand or "",
 "suggestion": optional correction,
 "reason": "unrecognized" | "possible_misspelling" | "unsupported_format" | "needs_confirmation",
 "note": short explanation
}

Supplements:
${JSON.stringify(supplements)}
`;

   const response = await fetch("https://api.openai.com/v1/chat/completions", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
     },
     body: JSON.stringify({
       model: "gpt-4o-mini",
       temperature: 0.2,
       messages: [
         {
           role: "system",
           content:
             "You help organize supplement routines. Return ONLY valid JSON. No markdown. Be thoughtful, goal-specific, and varied. Avoid medical claims. Never recommend supplements for goals that were not selected.",
         },
         {
           role: "user",
           content: prompt,
         },
       ],
     }),
   });

   const data = await response.json();

   if (!response.ok) {
     console.error("OpenAI API error:", data);

     return NextResponse.json({
       morning: [],
       evening: [],
       unrecognized: supplements.map((item) => ({
         ...item,
         reason: "needs_confirmation",
         note: "AI plan builder was unavailable, so this item needs review.",
       })),
       suggestedAdditions: [],
       source: "fallback",
     });
   }

   const content = data.choices?.[0]?.message?.content;

   if (!content) {
     return NextResponse.json({
       morning: [],
       evening: [],
       unrecognized: [],
       suggestedAdditions: [],
       source: "fallback",
     });
   }

   const cleaned = content
     .replace(/```json/g, "")
     .replace(/```/g, "")
     .trim();

   const parsed = JSON.parse(cleaned);

   return NextResponse.json({
     morning: parsed.morning || [],
     evening: parsed.evening || [],
     unrecognized: parsed.unrecognized || [],
     suggestedAdditions: parsed.suggestedAdditions || [],
     source: "ai",
   });
 } catch (error) {
   console.error("Build plan route error:", error);

   return NextResponse.json(
     {
       morning: [],
       evening: [],
       unrecognized: supplements.map((item) => ({
         ...item,
         reason: "needs_confirmation",
         note:
           "Something went wrong while building the plan, so this item needs review.",
       })),
       suggestedAdditions: [],
       source: "error",
     },
     { status: 500 }
   );
 }
}
