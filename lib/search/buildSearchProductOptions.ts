import {
  getCachedProductResearchBatch,
 } from "@/lib/intelligence/productResearch/getCachedProductResearchBatch";


 
 import type {
  SearchRetailProduct,
 } from "./searchRetailProduct";
 
 import type {
  SearchProductOption,
  SearchProductScore,
 } from "./searchProductOption";
 
 import type {
  ProductResearch,
 } from "@/lib/intelligence/productResearch/productResearchTypes";
 
 import {
  calculatePerCapsuleCost,
 } from "@/lib/pricing/productPricing/calculatePerCapsuleCost";
 
 import {
  calculateDisplayedMonthlyCost,
 } from "@/lib/pricing/productPricing/calculateDisplayedMonthlyCost";
 
 import {
  calculateValueScore,
 } from "@/lib/pricing/productPricing/calculateValueScore";
 
 import {
  getPricingStrategy,
 } from "@/lib/pricing/getPricingStrategy";
 
 import {
  calculateAvailabilityScore,
 } from "@/lib/recommendations/evaluators/calculateAvailabilityScore";
 
 import {
  evaluateProduct,
 } from "@/lib/recommendations/evaluateProduct";
 
 import {
  scoreProduct,
 } from "@/lib/recommendations/scoreProduct";
 
 type ProductGroup = {
  productName:
    string;
 
  brand:
    string;
 
  supplement:
    string;
 
  listings:
    SearchRetailProduct[];
 
  shoppingProductIds:
    Set<string>;
 
  identityTokens:
    Set<string>;
 };
 
 type PreparedSearchProduct = {
  productName:
    string;
 
  brand:
    string;
 
  supplement:
    string;
 
  representativeProduct:
    SearchRetailProduct;
 
  listings:
    SearchRetailProduct[];
 
  listingsCompared:
    number;
 
  vendorsCompared:
    number;
 
  lowestMonthlyCost:
    number;
 
  highestMonthlyCost:
    number;
 
  averageMonthlyCost:
    number;
 
  medianMonthlyCost:
    number;
 
  displayedMonthlyCost:
    number;
 
  displayedPerCapsuleCost:
    number;
 
  research:
    ProductResearch | null;
 };
 
 function roundCurrency(
  value:
    number
 ) {
  return (
    Math.round(
      value * 100
    ) / 100
  );
 }
 
 function clampScore(
  value:
    number
 ) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        value
      )
    )
  );
 }
 
 function normalizeIdentity(
  value:
    string
 ) {
  return value
    .toLowerCase()
    .replace(
      /[®™©]/g,
      " "
    )
    .replace(
      /['’]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
 }
 
 function normalizeCompact(
  value:
    string
 ) {
  return normalizeIdentity(
    value
  ).replace(
    /\s+/g,
    ""
  );
 }
 
 function escapeRegExp(
  value:
    string
 ) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
 }
 
 function normalizeRetailerIdentity(
  retailer:
    string
 ) {
  return normalizeIdentity(
    retailer
  )
    .replace(
      /\b(?:com|inc|llc|online|marketplace|store|stores|shop)\b/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
 }
 
 function getStableShoppingProductId(
  listing:
    SearchRetailProduct
 ) {
  return listing
    .shoppingProductId
    ?.trim() ||
    null;
 }
 
 /*
 * Produces a title identity that is stable across
 * minor Google Shopping title variations.
 *
 * Retailer wording, pricing language, dosage form,
 * package count, and general marketing language
 * should not create a second product row.
 *
 * Dosage, form, and container count remain separate
 * parts of the final comparison key.
 */
 function buildCanonicalTitleIdentity(
  listing:
    SearchRetailProduct
 ) {
  let title =
    normalizeIdentity(
      listing.productTitle
    );
 
  const removablePhrases =
    [
      listing.dosage,
      listing.form,
    ]
      .map(
        (value) =>
          normalizeIdentity(
            value ?? ""
          )
      )
      .filter(
        Boolean
      )
      .sort(
        (
          left,
          right
        ) =>
          right.length -
          left.length
      );
 
  for (
    const phrase of
    removablePhrases
  ) {
    title =
      title.replace(
        new RegExp(
          `\\b${escapeRegExp(
            phrase
          ).replace(
            /\\ /g,
            "\\s+"
          )}\\b`,
          "gi"
        ),
        " "
      );
  }
 
  title =
    title
      /*
       * Explicit dosage values.
       */
      .replace(
        /\b\d+(?:\.\d+)?\s*(?:mcg|mg|g|iu)\b/gi,
        " "
      )
 
      /*
       * Package quantities.
       */
      .replace(
        /\b\d{1,4}\s*(?:count|ct|capsules?|caps?|tablets?|tabs?|caplets?|soft[\s-]?gels?|vegcaps?|veg\s+caps?|gummies|gummy|chewables?|chews?|servings?|packets?|sticks?|sachets?|bottles?)\b/gi,
        " "
      )
 
      /*
       * Dosage forms are stored separately.
       */
      .replace(
        /\b(?:capsules?|caps?|tablets?|tabs?|caplets?|soft[\s-]?gels?|vegcaps?|veg\s+caps?|gummies|gummy|chewables?|chews?|powder|liquid|drops?|spray)\b/gi,
        " "
      )
 
      /*
       * Retail and shipping language.
       */
      .replace(
        /\b(?:free shipping|free delivery|same day|subscribe and save|subscription|bundle|multi pack|multipack)\b/gi,
        " "
      )
 
      /*
       * Generic product language.
       */
      .replace(
        /\b(?:dietary|supplement|vitamin|vitamins|mineral|minerals|bottle|pack|package|size|health|formula|product)\b/gi,
        " "
      )
 
      /*
       * Marketing language that should not create
       * another product identity.
       */
      .replace(
        /\b(?:new|official|original|best seller|bestseller|premium|quality|value size|bonus size|extra strength|max strength|maximum strength|high potency|advanced|complete)\b/gi,
        " "
      )
 
      /*
       * Common punctuation-derived conjunctions.
       */
      .replace(
        /\b(?:with|plus|and)\b/gi,
        " "
      )
 
      .replace(
        /\s+/g,
        " "
      )
      .trim();
 
  return (
    title ||
    normalizeIdentity(
      listing.productTitle
    )
  );
 }
 
 function buildIdentityTokens(
  listing:
    SearchRetailProduct
 ) {
  const titleIdentity =
    buildCanonicalTitleIdentity(
      listing
    );
 
  const ignoredTokens =
    new Set([
      "the",
      "a",
      "an",
      "for",
      "of",
      "to",
      "by",
      "support",
      "daily",
      "natural",
    ]);
 
  return new Set(
    titleIdentity
      .split(
        /\s+/
      )
      .map(
        (token) =>
          token.trim()
      )
      .filter(
        (token) =>
          token.length >
            1 &&
          !ignoredTokens.has(
            token
          )
      )
  );
 }
 
 function calculateTokenSimilarity(
  left:
    Set<string>,
 
  right:
    Set<string>
 ) {
  if (
    left.size ===
      0 ||
    right.size ===
      0
  ) {
    return 0;
  }
 
  let intersectionCount =
    0;
 
  for (
    const token of
    left
  ) {
    if (
      right.has(
        token
      )
    ) {
      intersectionCount +=
        1;
    }
  }
 
  const smallerSetSize =
    Math.min(
      left.size,
      right.size
    );
 
  return (
    intersectionCount /
    smallerSetSize
  );
 }
 
 function normalizeDosageIdentity(
  listing:
    SearchRetailProduct
 ) {
  if (
    listing.dosageAmount !==
      null &&
    listing.dosageUnit !==
      null
  ) {
    return [
      listing.dosageAmount,
      listing.dosageUnit,
      listing.dosageIsPerServing ??
        "unknown",
    ].join(
      "|"
    );
  }
 
  return normalizeCompact(
    listing.dosage
  );
 }
 
 function normalizeFormIdentity(
  listing:
    SearchRetailProduct
 ) {
  return normalizeCompact(
    listing.form
  );
 }
 
 function listingsHaveCompatibleVariant(
  left:
    SearchRetailProduct,
 
  right:
    SearchRetailProduct
 ) {
  const leftDosage =
    normalizeDosageIdentity(
      left
    );
 
  const rightDosage =
    normalizeDosageIdentity(
      right
    );
 
  if (
    leftDosage &&
    rightDosage &&
    leftDosage !==
      rightDosage
  ) {
    return false;
  }
 
  const leftForm =
    normalizeFormIdentity(
      left
    );
 
  const rightForm =
    normalizeFormIdentity(
      right
    );
 
  if (
    leftForm &&
    rightForm &&
    leftForm !==
      "unknown" &&
    rightForm !==
      "unknown" &&
    leftForm !==
      rightForm
  ) {
    return false;
  }
 
  /*
   * A known package-count difference normally means
   * the customer is looking at a different purchasable
   * product variant.
   */
  if (
    left.capsulesPerBottle >
      0 &&
    right.capsulesPerBottle >
      0 &&
    left.capsulesPerBottle !==
      right.capsulesPerBottle
  ) {
    return false;
  }
 
  return true;
 }
 
 function groupContainsShoppingProductId(
  group:
    ProductGroup,
 
  listing:
    SearchRetailProduct
 ) {
  const shoppingProductId =
    getStableShoppingProductId(
      listing
    );
 
  return (
    shoppingProductId !==
      null &&
    group.shoppingProductIds.has(
      shoppingProductId
    )
  );
 }
 
 function groupLooksLikeSameProduct(
  group:
    ProductGroup,
 
  listing:
    SearchRetailProduct
 ) {
  const representative =
    group.listings[0];
 
  if (
    !representative ||
    !listingsHaveCompatibleVariant(
      representative,
      listing
    )
  ) {
    return false;
  }
 
  const listingTokens =
    buildIdentityTokens(
      listing
    );
 
  const similarity =
    calculateTokenSimilarity(
      group.identityTokens,
      listingTokens
    );
 
  /*
   * A high containment score permits small title
   * differences such as:
   *
   * "MagOx 400 Magnesium Tablets"
   * "Mag-Ox 400 Magnesium Oxide Tablets"
   *
   * Dosage, form, and package-count compatibility
   * are checked separately above.
   */
  if (
    similarity >=
      0.8
  ) {
    return true;
  }
 
  const groupTitle =
    buildCanonicalTitleIdentity(
      representative
    );
 
  const listingTitle =
    buildCanonicalTitleIdentity(
      listing
    );
 
  return (
    groupTitle.length >
      4 &&
    listingTitle.length >
      4 &&
    (
      groupTitle.includes(
        listingTitle
      ) ||
      listingTitle.includes(
        groupTitle
      )
    )
  );
 }
 
 function findMatchingProductGroup(
  groups:
    ProductGroup[],
 
  listing:
    SearchRetailProduct
 ) {
  /*
   * Google Shopping product identity is the
   * strongest signal and is independent of vendor.
   */
  const shoppingProductMatch =
    groups.find(
      (group) =>
        groupContainsShoppingProductId(
          group,
          listing
        )
    );
 
  if (
    shoppingProductMatch
  ) {
    return shoppingProductMatch;
  }
 
  return groups.find(
    (group) =>
      groupLooksLikeSameProduct(
        group,
        listing
      )
  );
 }
 
 function addListingToGroup(
  group:
    ProductGroup,
 
  listing:
    SearchRetailProduct
 ) {
  group.listings.push(
    listing
  );
 
  const shoppingProductId =
    getStableShoppingProductId(
      listing
    );
 
  if (
    shoppingProductId
  ) {
    group.shoppingProductIds.add(
      shoppingProductId
    );
  }
 
  for (
    const token of
    buildIdentityTokens(
      listing
    )
  ) {
    group.identityTokens.add(
      token
    );
  }
 }
 
 function createProductGroup(
  listing:
    SearchRetailProduct
 ): ProductGroup {
  const shoppingProductIds =
    new Set<string>();
 
  const shoppingProductId =
    getStableShoppingProductId(
      listing
    );
 
  if (
    shoppingProductId
  ) {
    shoppingProductIds.add(
      shoppingProductId
    );
  }
 
  return {
    productName:
      listing.productTitle,
 
    brand:
      listing.brand.trim(),
 
    supplement:
      listing.supplement.trim(),
 
    listings: [
      listing,
    ],
 
    shoppingProductIds,
 
    identityTokens:
      buildIdentityTokens(
        listing
      ),
  };
 }
 
 function getListingTotalPrice(
  listing:
    SearchRetailProduct
 ) {
  return (
    listing.bottlePrice +
    (
      listing.estimatedShipping ??
      0
    )
  );
 }
 
 function getListingDeduplicationKey(
  listing:
    SearchRetailProduct
 ) {
  const shoppingProductId =
    getStableShoppingProductId(
      listing
    );
 
  return [
    normalizeRetailerIdentity(
      listing.retailer
    ),
 
    shoppingProductId ??
      buildCanonicalTitleIdentity(
        listing
      ),
 
    normalizeDosageIdentity(
      listing
    ),
 
    normalizeFormIdentity(
      listing
    ),
 
    listing.capsulesPerBottle,
  ].join(
    "|"
  );
 }
 
 /*
 * Remove duplicate offers inside one product group.
 *
 * This first collapses exact duplicate rows and then
 * keeps the least expensive offer from each retailer.
 */
 function collapseListingsByRetailer(
  listings:
    SearchRetailProduct[]
 ) {
  const exactListings =
    new Map<
      string,
      SearchRetailProduct
 >();
 
  for (
    const listing of
    listings
  ) {
    const exactKey =
      getListingDeduplicationKey(
        listing
      );
 
    const current =
      exactListings.get(
        exactKey
      );
 
    if (
      !current ||
      getListingTotalPrice(
        listing
      ) <
        getListingTotalPrice(
          current
        )
    ) {
      exactListings.set(
        exactKey,
        listing
      );
    }
  }
 
  const cheapestByRetailer =
    new Map<
      string,
      SearchRetailProduct
 >();
 
  for (
    const listing of
    exactListings.values()
  ) {
    const retailerKey =
      normalizeRetailerIdentity(
        listing.retailer
      );
 
    const current =
      cheapestByRetailer.get(
        retailerKey
      );
 
    if (
      !current ||
      getListingTotalPrice(
        listing
      ) <
        getListingTotalPrice(
          current
        )
    ) {
      cheapestByRetailer.set(
        retailerKey,
        listing
      );
    }
  }
 
  return Array.from(
    cheapestByRetailer.values()
  ).sort(
    (
      left,
      right
    ) =>
      getListingTotalPrice(
        left
      ) -
      getListingTotalPrice(
        right
      )
  );
 }
 
 function chooseRepresentativeListing(
  listings:
    SearchRetailProduct[]
 ) {
  const ranked =
    [
      ...listings,
    ].sort(
      (
        left,
        right
      ) => {
        const leftCompleteness =
          [
            Boolean(
              left.imageUrl
            ),
 
            Boolean(
              left.url
            ),
 
            Boolean(
              left.rating
            ),
 
            Boolean(
              left.reviewCount
            ),
 
            Boolean(
              left.dosage
            ),
 
            Boolean(
              left.shoppingProductId
            ),
 
            left.form !==
              "Unknown",
 
            left.productTitle.length >
              0,
          ].filter(
            Boolean
          ).length;
 
        const rightCompleteness =
          [
            Boolean(
              right.imageUrl
            ),
 
            Boolean(
              right.url
            ),
 
            Boolean(
              right.rating
            ),
 
            Boolean(
              right.reviewCount
            ),
 
            Boolean(
              right.dosage
            ),
 
            Boolean(
              right.shoppingProductId
            ),
 
            right.form !==
              "Unknown",
 
            right.productTitle.length >
              0,
          ].filter(
            Boolean
          ).length;
 
        if (
          rightCompleteness !==
          leftCompleteness
        ) {
          return (
            rightCompleteness -
            leftCompleteness
          );
        }
 
        return (
          calculatePerCapsuleCost(
            left
          ) -
          calculatePerCapsuleCost(
            right
          )
        );
      }
    );
 
  return ranked[0];
 }
 
 function buildProductName(
  listings:
    SearchRetailProduct[]
 ) {
  const representative =
    chooseRepresentativeListing(
      listings
    );
 
  return (
    representative.productTitle ||
    [
      representative.brand,
      representative.supplement,
      representative.dosage,
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      )
  );
 }
 
 function groupVendorListings(
  listings:
    SearchRetailProduct[]
 ) {
  const groups:
    ProductGroup[] = [];
 
  for (
    const listing of
    listings
  ) {
    const existingGroup =
      findMatchingProductGroup(
        groups,
        listing
      );
 
    if (
      existingGroup
    ) {
      addListingToGroup(
        existingGroup,
        listing
      );
 
      continue;
    }
 
    groups.push(
      createProductGroup(
        listing
      )
    );
  }
 
  const groupedProducts =
    groups.map(
      (group) => {
        const collapsedListings =
          collapseListingsByRetailer(
            group.listings
          );
 
        const representative =
          chooseRepresentativeListing(
            collapsedListings
          );
 



          return {
            ...group,
           
            productName:
              buildProductName(
                collapsedListings
              ),
           
            brand:
              representative.brand
                .trim(),
           
            supplement:
              representative
                .supplement
                .trim(),
           
            listings:
              collapsedListings,
           };




      }
    );
 
  console.log(
    "VidaSearch exact products grouped:",
    {
      retailerListingCount:
        listings.length,
 
      productGroupCount:
        groupedProducts.length,
 
      duplicateListingsRemoved:
        Math.max(
          0,
          listings.length -
            groupedProducts.reduce(
              (
                total,
                group
              ) =>
                total +
                group.listings.length,
              0
            )
        ),
 
      groups:
        groupedProducts.map(
          (group) => {
            const representative =
              chooseRepresentativeListing(
                group.listings
              );
 
            return {
              productName:
                group.productName,
 
              brand:
                group.brand,
 
              shoppingProductId:
                representative
                  .shoppingProductId ??
                null,
 
              dosage:
                representative.dosage,
 
              dosageAmount:
                representative
                  .dosageAmount,
 
              dosageUnit:
                representative
                  .dosageUnit,
 
              dosageIsPerServing:
                representative
                  .dosageIsPerServing,
 
              form:
                representative.form,
 
              unitLabel:
                representative
                  .unitLabel,
 
              count:
                representative
                  .capsulesPerBottle,
 
              vendors:
                group.listings.map(
                  (listing) => ({
                    retailer:
                      listing.retailer,
 
                    price:
                      listing.bottlePrice,
                  })
                ),
            };
          }
        ),
    }
  );
 
  return groupedProducts;
 }
 
 function countUniqueVendors(
  listings:
    SearchRetailProduct[]
 ) {
  return new Set(
    listings.map(
      (listing) =>
        normalizeRetailerIdentity(
          listing.retailer
        )
    )
  ).size;
 }
 
 function calculateConfidenceScore({
  research,
  vendorsCompared,
  listingsCompared,
 }: {
  research:
    ProductResearch | null;
 
  vendorsCompared:
    number;
 
  listingsCompared:
    number;
 }) {
  const researchConfidence =
    research
      ? Math.round(
          research.aiConfidence *
            60
        )
      : 0;
 
  const vendorConfidence =
    Math.min(
      25,
      vendorsCompared * 5
    );
 
  const listingConfidence =
    Math.min(
      15,
      listingsCompared * 3
    );
 
  return Math.min(
    100,
    researchConfidence +
      vendorConfidence +
      listingConfidence
  );
 }
 
 function getConfidenceLabel(
  confidenceScore:
    number
 ):
  | "high"
  | "medium"
  | "low" {
  if (
    confidenceScore >=
    80
  ) {
    return "high";
  }
 
  if (
    confidenceScore >=
    55
  ) {
    return "medium";
  }
 
  return "low";
 }
 
 function calculateSearchDataCompleteness(
  prepared:
    PreparedSearchProduct
 ) {
  const representative =
    prepared.representativeProduct;
 
  const checks = [
    Boolean(
      prepared.brand
    ),
 
    Boolean(
      prepared.supplement
    ),
 
    Boolean(
      representative.productTitle
    ),
 
    Boolean(
      representative.retailer
    ),
 
    representative.bottlePrice >
      0,
 
    representative
      .capsulesPerBottle >
      0,
 
    Boolean(
      representative.dosage
    ),
 
    representative
      .dosageAmount !==
      null,
 
    representative
      .dosageUnit !==
      null,
 
    representative.form !==
      "Unknown",
 
    Boolean(
      representative.url
    ),
 
    Boolean(
      representative.imageUrl
    ),
 
    prepared.listingsCompared >
      0,
 
    prepared.vendorsCompared >
      0,
  ];
 
  const completedChecks =
    checks.filter(
      Boolean
    ).length;
 
  return Math.round(
    (
      completedChecks /
      checks.length
    ) * 100
  );
 }
 
 function buildPreliminaryScore({
  value,
  availability,
  dataCompleteness,
 }: {
  value:
    number;
 
  availability:
    number;
 
  dataCompleteness:
    number;
 }): SearchProductScore {
  return {
    overall:
      null,
 
    value:
      clampScore(
        value
      ),
 
    productQuality:
      null,
 
    dosageFit:
      null,
 
    retailerConfidence:
      clampScore(
        availability
      ),
 
    dataCompleteness:
      clampScore(
        dataCompleteness
      ),
  };
 }
 


 function prepareSearchProduct({
  group,
  capsulesPerDay,
  pricingStrategy,
  research,
 }: {
  group:
    ProductGroup;
 
  capsulesPerDay:
    number;
 
  pricingStrategy:
    Awaited<
      ReturnType<
        typeof getPricingStrategy
 >
 >;
 
  research:
    ProductResearch | null;
 }): PreparedSearchProduct {
  const representativeProduct =
    chooseRepresentativeListing(
      group.listings
    );
 
  const pricing =
    calculateDisplayedMonthlyCost(
      group.listings,
      capsulesPerDay,
      pricingStrategy
    );
 
  const monthlyUnits =
    pricing.monthlyCapsules;
 
  return {
    productName:
      group.productName,
 
    brand:
      group.brand,
 
    supplement:
      group.supplement,
 
    representativeProduct,
 
    listings:
      group.listings,
 
    listingsCompared:
      group.listings.length,
 
    vendorsCompared:
      countUniqueVendors(
        group.listings
      ),
 
    lowestMonthlyCost:
      roundCurrency(
        pricing.pricing
          .lowestPerCapsuleCost *
          monthlyUnits
      ),
 
    highestMonthlyCost:
      roundCurrency(
        pricing.pricing
          .highestPerCapsuleCost *
          monthlyUnits
      ),
 
    averageMonthlyCost:
      roundCurrency(
        pricing.pricing
          .averagePerCapsuleCost *
          monthlyUnits
      ),
 
    medianMonthlyCost:
      roundCurrency(
        pricing.pricing
          .medianPerCapsuleCost *
          monthlyUnits
      ),
 
    displayedMonthlyCost:
      roundCurrency(
        pricing.monthlyCost
      ),
 
    displayedPerCapsuleCost:
      pricing.perCapsulePrice,
 
    research,
  };
 }
 




 function hasListingClaim(
  listings:
    SearchRetailProduct[],
 
  claim:
    | "nsfCertified"
    | "uspVerified"
    | "thirdPartyTested"
    | "vegan"
    | "nonGmo"
    | "glutenFree"
 ) {
  return listings.some(
    (listing) =>
      listing[
        claim
      ] ===
      true
  );
 }
 
 function hasCertification(
  research:
    ProductResearch | null,
 
  patterns:
    RegExp[]
 ) {
  if (
    !research
  ) {
    return false;
  }
 
  return research.certifications.some(
    (certification) =>
      patterns.some(
        (pattern) =>
          pattern.test(
            certification
          )
      )
  );
 }
 
 function buildDietaryPreferences(
  research:
    ProductResearch | null
 ) {
  return {
    vegan:
      research?.vegan ===
      true,
 
    vegetarian:
      research?.vegetarian ===
      true,
 
    glutenFree:
      research?.glutenFree ===
      true,
 
    dairyFree:
      research?.dairyFree ===
      true,
 
    soyFree:
      research?.soyFree ===
      true,
 
    nonGmo:
      research?.nonGmo ===
      true,
  };
 }
 
 function buildThirdPartyTesting(
  research:
    ProductResearch | null
 ) {
  const uspVerified =
    research?.uspVerified ===
      true ||
    hasCertification(
      research,
      [
        /\busp\b/i,
        /\busp verified\b/i,
      ]
    );
 
  const nsfCertified =
    research?.nsfCertified ===
      true ||
    hasCertification(
      research,
      [
        /\bnsf\b/i,
        /\bnsf certified\b/i,
      ]
    );
 
  const consumerLabTested =
    hasCertification(
      research,
      [
        /\bconsumerlab\b/i,
        /\bconsumer lab\b/i,
      ]
    );
 
  const informedChoice =
    hasCertification(
      research,
      [
        /\binformed choice\b/i,
        /\binformed sport\b/i,
      ]
    );
 
  const thirdPartyTested =
    research
      ?.thirdPartyTested ===
      true ||
    uspVerified ||
    nsfCertified ||
    consumerLabTested ||
    informedChoice;
 
  return {
    thirdPartyTested,
 
    uspVerified,
 
    nsfCertified,
 
    consumerLabTested,
 
    informedChoice,
  };
 }
 



 export async function buildSearchProductOptions(
  listings:
    SearchRetailProduct[],
 
  capsulesPerDay:
    number,
 
  options?: {
    includeCachedResearch?:
      boolean;
  }
 ): Promise<
  SearchProductOption[]
 >{




  if (
    listings.length ===
    0
  ) {
    return [];
  }
 
  const pricingStrategy =
    await getPricingStrategy();
 
  const groups =
    groupVendorListings(
      listings
    );
 




    const includeCachedResearch =
    options
      ?.includeCachedResearch !==
    false;
   
   const researchByProduct =
    includeCachedResearch
      ? await getCachedProductResearchBatch(
          groups.map((group) => {
            const representative =
              chooseRepresentativeListing(
                group.listings
              );
   
            return {
              key:
                group.productName,
   
              productName:
                group.productName,
   
              shoppingProductId:
                representative
                  .shoppingProductId,
            };
          })
        )
      : new Map<
          string,
          ProductResearch
   >();





   
   const preparedProducts =
    groups.map((group) =>
      prepareSearchProduct({
        group,
   
        capsulesPerDay,
   
        pricingStrategy,
   
        research:
          researchByProduct.get(
            group.productName
          ) ?? null,
      })
    );
   





 
  if (
    preparedProducts.length ===
    0
  ) {
    return [];
  }
 
  const displayedPrices =
    preparedProducts.map(
      (product) =>
        product
          .displayedPerCapsuleCost
    );
 
  const lowestProductPrice =
    Math.min(
      ...displayedPrices
    );
 
  const highestProductPrice =
    Math.max(
      ...displayedPrices
    );
 
  return preparedProducts
    .map(
      (
        prepared
      ): SearchProductOption => {
        const value =
          calculateValueScore({
            displayedPerCapsulePrice:
              prepared
                .displayedPerCapsuleCost,
 
            lowestPerCapsulePrice:
              lowestProductPrice,
 
            highestPerCapsulePrice:
              highestProductPrice,
          });
 
        const availability =
          calculateAvailabilityScore({
            vendorCount:
              prepared
                .vendorsCompared,
 
            listingCount:
              prepared
                .listingsCompared,
          });
 
        const dataCompleteness =
          calculateSearchDataCompleteness(
            prepared
          );
 
        let score =
          buildPreliminaryScore({
            value,
 
            availability,
 
            dataCompleteness,
          });
 
        if (
          prepared.research
        ) {
          const evaluation =
            evaluateProduct(
              prepared.research
            );
 
          const scoringInput = {
            ...evaluation,
 
            value,
 
            availability,
          };
 
          const productScore =
            scoreProduct(
              scoringInput
            );
 
          const productQuality =
            Math.round(
              (
                scoringInput.quality +
                scoringInput
                  .cleanIngredients +
                scoringInput
                  .certifications
              ) / 3
            );
 
          score = {
            overall:
              productScore.overall,
 
            value:
              productScore.value,
 
            productQuality,
 
            dosageFit:
              100,
 
            retailerConfidence:
              productScore
                .availability,
 
            dataCompleteness:
              scoringInput
                .dataCompleteness,
          };
        }
 
        const confidenceScore =
          calculateConfidenceScore({
            research:
              prepared.research,
 
            vendorsCompared:
              prepared
                .vendorsCompared,
 
            listingsCompared:
              prepared
                .listingsCompared,
          });
 
        const representative =
          prepared
            .representativeProduct;
 
        const dietaryPreferences =
          buildDietaryPreferences(
            prepared.research
          );
 
        const thirdPartyTesting =
          buildThirdPartyTesting(
            prepared.research
          );
 
        const form =
          prepared.research
            ?.form
            ?.trim() ||
          (
            representative.form ===
              "Unknown" ||
            representative.form ===
              "Other"
              ? null
              : representative.form
          );
 




 
        return {
          productName:
            prepared.productName,
 
          brand:
            prepared.brand,
 
          representativeProduct:
            representative,
 
          listings:
            prepared.listings,
 
          listingsCompared:
            prepared
              .listingsCompared,
 
          vendorsCompared:
            prepared
              .vendorsCompared,
 
          dosage:
            representative.dosage,
 
          dosageAmount:
            representative
              .dosageAmount,
 
          dosageUnit:
            representative
              .dosageUnit,
 
          dosageIsPerServing:
            representative
              .dosageIsPerServing,
 
          unitLabel:
            representative
              .unitLabel,
 
          vitaPouchFormEligible:
            representative
              .vitaPouchFormEligible,
 
          lowestMonthlyCost:
            prepared
              .lowestMonthlyCost,
 
          highestMonthlyCost:
            prepared
              .highestMonthlyCost,
 
          averageMonthlyCost:
            prepared
              .averageMonthlyCost,
 
          medianMonthlyCost:
            prepared
              .medianMonthlyCost,
 
          displayedMonthlyCost:
            prepared
              .displayedMonthlyCost,
 
          score,
 
          researchStatus:
            prepared.research
              ? "complete"
              : "undetermined",
 
          form,
 
          dietaryPreferences,
 
          thirdPartyTesting,
 
          certifications:
            prepared.research
              ?.certifications ??
            [],
 
          qualityClaims:
            prepared.research
              ?.qualityClaims ??
            [],
 
          verifiedClaims: {
            nsfCertified:
              thirdPartyTesting
                .nsfCertified ||
              hasListingClaim(
                prepared.listings,
                "nsfCertified"
              ),
 
            uspVerified:
              thirdPartyTesting
                .uspVerified ||
              hasListingClaim(
                prepared.listings,
                "uspVerified"
              ),
 
            thirdPartyTested:
              thirdPartyTesting
                .thirdPartyTested ||
              hasListingClaim(
                prepared.listings,
                "thirdPartyTested"
              ),
 
            vegan:
              dietaryPreferences
                .vegan ||
              hasListingClaim(
                prepared.listings,
                "vegan"
              ),
 
            nonGmo:
              dietaryPreferences
                .nonGmo ||
              hasListingClaim(
                prepared.listings,
                "nonGmo"
              ),
 
            glutenFree:
              dietaryPreferences
                .glutenFree ||
              hasListingClaim(
                prepared.listings,
                "glutenFree"
              ),
          },
 
          confidenceScore,
 
          confidence:
            getConfidenceLabel(
              confidenceScore
            ),
 
          selected:
            false,
 
          recommended:
            false,
 
          reasons:
            [],
        };
      }
    )
    .sort(
      (
        left,
        right
      ) =>
        right.vendorsCompared -
          left.vendorsCompared ||
        (
          right.score.overall ??
          0
        ) -
          (
            left.score.overall ??
            0
          )
    );
 }
 