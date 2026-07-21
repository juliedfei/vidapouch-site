type SupplementAliasDefinition = {
  /*
   * Names that may legitimately identify
   * this supplement in a product listing.
   */
  aliases: string[];
 
  /*
   * Controlled Google Shopping searches.
   *
   * These should be specific enough to
   * return supplement products without
   * producing large numbers of unrelated
   * matches.
   */
  searchTerms: string[];
 };
 
 const SUPPLEMENT_ALIASES:
  Record<
    string,
    SupplementAliasDefinition
 > = {
  "vitamin a": {
    aliases: [
      "vitamin a",
      "retinol",
      "retinyl",
      "retinyl palmitate",
      "retinyl acetate",
      "beta carotene",
      "beta-carotene",
      "carotenoids",
    ],
 
    searchTerms: [
      "vitamin a",
      "vitamin a capsules",
      "vitamin a tablets",
      "retinyl palmitate supplement",
      "beta carotene supplement",
    ],
  },
 
  "vitamin c": {
    aliases: [
      "vitamin c",
      "ascorbic acid",
      "ascorbate",
      "sodium ascorbate",
      "calcium ascorbate",
      "ester-c",
      "ester c",
      "buffered vitamin c",
      "buffered c",
      "liposomal vitamin c",
    ],
 
    searchTerms: [
      "vitamin c supplement",
      "vitamin c capsules",
      "vitamin c tablets",
      "ascorbic acid supplement",
      "buffered vitamin c supplement",
    ],
  },
 
  "vitamin d": {
    aliases: [
      "vitamin d",
      "vitamin d3",
      "d3",
      "cholecalciferol",
      "vitamin d2",
      "d2",
      "ergocalciferol",
    ],
 
    searchTerms: [
      "vitamin d supplement",
      "vitamin d3 supplement",
      "vitamin d3 capsules",
      "vitamin d3 tablets",
      "cholecalciferol supplement",
    ],
  },
 
  "vitamin e": {
    aliases: [
      "vitamin e",
      "tocopherol",
      "alpha tocopherol",
      "alpha-tocopherol",
      "mixed tocopherols",
      "tocotrienols",
    ],
 
    searchTerms: [
      "vitamin e supplement",
      "vitamin e capsules",
      "vitamin e softgels",
      "tocopherol supplement",
    ],
  },
 
  "vitamin k": {
    aliases: [
      "vitamin k",
      "vitamin k1",
      "vitamin k2",
      "k1",
      "k2",
      "phylloquinone",
      "menaquinone",
      "mk-4",
      "mk4",
      "mk-7",
      "mk7",
    ],
 
    searchTerms: [
      "vitamin k supplement",
      "vitamin k2 supplement",
      "vitamin k2 capsules",
      "vitamin k2 mk7",
    ],
  },
 
  "vitamin b1": {
    aliases: [
      "vitamin b1",
      "b1",
      "thiamine",
      "thiamin",
      "benfotiamine",
    ],
 
    searchTerms: [
      "vitamin b1 supplement",
      "thiamine supplement",
      "benfotiamine supplement",
    ],
  },
 
  "vitamin b2": {
    aliases: [
      "vitamin b2",
      "b2",
      "riboflavin",
      "riboflavin 5 phosphate",
      "riboflavin-5-phosphate",
    ],
 
    searchTerms: [
      "vitamin b2 supplement",
      "riboflavin supplement",
      "riboflavin capsules",
    ],
  },
 
  "vitamin b3": {
    aliases: [
      "vitamin b3",
      "b3",
      "niacin",
      "niacinamide",
      "nicotinamide",
    ],
 
    searchTerms: [
      "vitamin b3 supplement",
      "niacin supplement",
      "niacinamide supplement",
    ],
  },
 
  "vitamin b5": {
    aliases: [
      "vitamin b5",
      "b5",
      "pantothenic acid",
      "pantothenate",
    ],
 
    searchTerms: [
      "vitamin b5 supplement",
      "pantothenic acid supplement",
    ],
  },
 
  "vitamin b6": {
    aliases: [
      "vitamin b6",
      "b6",
      "pyridoxine",
      "pyridoxal 5 phosphate",
      "pyridoxal-5-phosphate",
      "p5p",
      "p-5-p",
    ],
 
    searchTerms: [
      "vitamin b6 supplement",
      "pyridoxine supplement",
      "p5p supplement",
    ],
  },
 
  "vitamin b12": {
    aliases: [
      "vitamin b12",
      "b12",
      "cobalamin",
      "methylcobalamin",
      "cyanocobalamin",
      "adenosylcobalamin",
      "hydroxocobalamin",
    ],
 
    searchTerms: [
      "vitamin b12 supplement",
      "vitamin b12 tablets",
      "methylcobalamin supplement",
      "b12 capsules",
    ],
  },
 
  folate: {
    aliases: [
      "folate",
      "folic acid",
      "methylfolate",
      "l methylfolate",
      "l-methylfolate",
      "5 mthf",
      "5-mthf",
      "methyltetrahydrofolate",
    ],
 
    searchTerms: [
      "folate supplement",
      "folic acid supplement",
      "methylfolate supplement",
      "5 mthf supplement",
    ],
  },
 
  biotin: {
    aliases: [
      "biotin",
      "vitamin b7",
      "b7",
    ],
 
    searchTerms: [
      "biotin supplement",
      "biotin capsules",
      "biotin tablets",
    ],
  },
 
  magnesium: {
    aliases: [
      "magnesium",
      "magnesium glycinate",
      "magnesium bisglycinate",
      "magnesium citrate",
      "magnesium oxide",
      "magnesium malate",
      "magnesium threonate",
      "magnesium l threonate",
      "magnesium l-threonate",
      "magnesium taurate",
    ],
 
    searchTerms: [
      "magnesium supplement",
      "magnesium capsules",
      "magnesium tablets",
      "magnesium glycinate supplement",
      "magnesium citrate supplement",
    ],
  },
 
  calcium: {
    aliases: [
      "calcium",
      "calcium citrate",
      "calcium carbonate",
      "calcium malate",
      "calcium hydroxyapatite",
    ],
 
    searchTerms: [
      "calcium supplement",
      "calcium capsules",
      "calcium tablets",
      "calcium citrate supplement",
    ],
  },
 
  zinc: {
    aliases: [
      "zinc",
      "zinc picolinate",
      "zinc citrate",
      "zinc gluconate",
      "zinc glycinate",
      "zinc bisglycinate",
    ],
 
    searchTerms: [
      "zinc supplement",
      "zinc capsules",
      "zinc tablets",
      "zinc picolinate supplement",
    ],
  },
 
  iron: {
    aliases: [
      "iron",
      "ferrous sulfate",
      "ferrous fumarate",
      "ferrous bisglycinate",
      "iron bisglycinate",
      "carbonyl iron",
      "heme iron",
    ],
 
    searchTerms: [
      "iron supplement",
      "iron capsules",
      "iron tablets",
      "iron bisglycinate supplement",
    ],
  },
 
  selenium: {
    aliases: [
      "selenium",
      "selenomethionine",
      "sodium selenite",
    ],
 
    searchTerms: [
      "selenium supplement",
      "selenium capsules",
      "selenomethionine supplement",
    ],
  },
 
  potassium: {
    aliases: [
      "potassium",
      "potassium citrate",
      "potassium chloride",
      "potassium gluconate",
    ],
 
    searchTerms: [
      "potassium supplement",
      "potassium capsules",
      "potassium tablets",
    ],
  },
 
  "omega 3": {
    aliases: [
      "omega 3",
      "omega-3",
      "fish oil",
      "epa",
      "dha",
      "eicosapentaenoic acid",
      "docosahexaenoic acid",
      "algae oil",
      "algal oil",
    ],
 
    searchTerms: [
      "omega 3 supplement",
      "omega 3 fish oil",
      "fish oil capsules",
      "epa dha supplement",
      "algae omega 3 supplement",
    ],
  },
 
  "fish oil": {
    aliases: [
      "fish oil",
      "omega 3",
      "omega-3",
      "epa",
      "dha",
      "eicosapentaenoic acid",
      "docosahexaenoic acid",
    ],
 
    searchTerms: [
      "fish oil supplement",
      "fish oil capsules",
      "omega 3 fish oil",
      "epa dha supplement",
    ],
  },
 
  coq10: {
    aliases: [
      "coq10",
      "coq 10",
      "coenzyme q10",
      "coenzyme q 10",
      "ubiquinol",
      "ubiquinone",
    ],
 
    searchTerms: [
      "coq10 supplement",
      "coq10 capsules",
      "coenzyme q10 supplement",
      "ubiquinol supplement",
    ],
  },
 
  probiotic: {
    aliases: [
      "probiotic",
      "probiotics",
      "probiotic blend",
      "lactobacillus",
      "bifidobacterium",
      "bacillus coagulans",
      "saccharomyces boulardii",
    ],
 
    searchTerms: [
      "probiotic supplement",
      "probiotic capsules",
      "daily probiotic",
      "probiotic tablets",
    ],
  },
 
  turmeric: {
    aliases: [
      "turmeric",
      "curcumin",
      "curcuminoids",
      "turmeric extract",
    ],
 
    searchTerms: [
      "turmeric supplement",
      "turmeric capsules",
      "curcumin supplement",
      "curcumin capsules",
    ],
  },
 
  ashwagandha: {
    aliases: [
      "ashwagandha",
      "withania somnifera",
      "ksm-66",
      "ksm 66",
      "sensoril",
    ],
 
    searchTerms: [
      "ashwagandha supplement",
      "ashwagandha capsules",
      "ksm 66 ashwagandha",
      "sensoril ashwagandha",
    ],
  },
 
  melatonin: {
    aliases: [
      "melatonin",
    ],
 
    searchTerms: [
      "melatonin supplement",
      "melatonin tablets",
      "melatonin capsules",
      "melatonin gummies",
    ],
  },
 
  collagen: {
    aliases: [
      "collagen",
      "collagen peptides",
      "hydrolyzed collagen",
      "bovine collagen",
      "marine collagen",
    ],
 
    searchTerms: [
      "collagen supplement",
      "collagen capsules",
      "collagen tablets",
      "collagen peptides supplement",
    ],
  },
 
  creatine: {
    aliases: [
      "creatine",
      "creatine monohydrate",
      "creatine hcl",
      "creatine hydrochloride",
    ],
 
    searchTerms: [
      "creatine supplement",
      "creatine capsules",
      "creatine tablets",
      "creatine monohydrate supplement",
    ],
  },
 };
 
 function normalizeSupplementName(
  supplement: string
 ) {
  return supplement
    .trim()
    .toLowerCase()
    .replace(
      /[‐-‒–—]/g,
      "-"
    )
    .replace(
      /\s+/g,
      " "
    );
 }
 
 function getDefinition(
  supplement: string
 ) {
  const normalized =
    normalizeSupplementName(
      supplement
    );
 
  const directDefinition =
    SUPPLEMENT_ALIASES[
      normalized
    ];
 
  if (directDefinition) {
    return directDefinition;
  }
 
  /*
   * Allow an alias such as "D3",
   * "ascorbic acid", or "fish oil" to find
   * its canonical supplement definition.
   */
  for (
    const definition of
    Object.values(
      SUPPLEMENT_ALIASES
    )
  ) {
    const aliasMatch =
      definition.aliases.some(
        (alias) =>
          normalizeSupplementName(
            alias
          ) === normalized
      );
 
    if (aliasMatch) {
      return definition;
    }
  }
 
  return null;
 }
 
 export function getSupplementAliases(
  supplement: string
 ) {
  const normalized =
    normalizeSupplementName(
      supplement
    );
 
  const definition =
    getDefinition(
      normalized
    );
 
  if (!definition) {
    return [
      normalized,
    ];
  }
 
  return Array.from(
    new Set([
      normalized,
      ...definition.aliases.map(
        normalizeSupplementName
      ),
    ])
  );
 }
 
 export function getSupplementSearchTerms(
  supplement: string
 ) {
  const normalized =
    normalizeSupplementName(
      supplement
    );
 
  const definition =
    getDefinition(
      normalized
    );
 
  if (!definition) {
    return [
      `${normalized} supplement`,
      `${normalized} capsules`,
      `${normalized} tablets`,
    ];
  }
 
  return Array.from(
    new Set(
      definition.searchTerms.map(
        normalizeSupplementName
      )
    )
  );
 }