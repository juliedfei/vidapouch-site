import type { Supplement } from "./types";

export function buildDailyPlan(supplements: Supplement[]) {
 const morning: Supplement[] = [];
 const evening: Supplement[] = [];

 supplements.forEach((supplement, index) => {
   const supplementName = supplement.name.toLowerCase();

   if (
     supplementName.includes("magnesium") ||
     supplementName.includes("sleep") ||
     supplementName.includes("melatonin")
   ) {
     evening.push(supplement);
   } else if (
     supplementName.includes("vitamin d") ||
     supplementName.includes("b12") ||
     supplementName.includes("b complex") ||
     supplementName.includes("omega") ||
     supplementName.includes("fish oil")
   ) {
     morning.push(supplement);
   } else {
     index % 2 === 0 ? morning.push(supplement) : evening.push(supplement);
   }
 });

 return { morning, evening };
}
