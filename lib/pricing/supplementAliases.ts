const SUPPLEMENT_ALIASES: Record<string, string[]> = {
    "vitamin a": [
      "vitamin a",
      "retinol",
      "retinyl",
      "retinyl palmitate",
      "retinyl acetate",
      "beta carotene",
      "carotenoids",
    ],
   
    "vitamin c": [
      "vitamin c",
      "ascorbic acid",
      "ester-c",
      "ester c",
      "buffered c",
      "liposomal vitamin c",
    ],
   
    "vitamin d": [
      "vitamin d",
      "vitamin d3",
      "d3",
      "cholecalciferol",
      "vitamin d2",
      "ergocalciferol",
    ],
   
    "magnesium": [
      "magnesium",
      "magnesium glycinate",
      "magnesium citrate",
      "magnesium oxide",
      "magnesium malate",
      "magnesium threonate",
    ],
   
    "omega 3": [
      "omega 3",
      "omega-3",
      "fish oil",
      "epa",
      "dha",
    ],
   
    "coq10": [
      "coq10",
      "coenzyme q10",
      "ubiquinol",
    ],
   };
   
   export function getSupplementAliases(
    supplement: string
   ) {
    const normalized =
      supplement
        .trim()
        .toLowerCase();
   
    return (
      SUPPLEMENT_ALIASES[normalized] ??
      [normalized]
    );
   }
   