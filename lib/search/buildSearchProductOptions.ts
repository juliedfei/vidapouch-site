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
 
 const MAX_PRODUCT_CARDS = 20;
 
 type ProductGroup = {
  productName: string;
 
  brand: string;
 
  supplement: string;
 
  listings:
    SearchRetailProduct[];
 };
 
 type PreparedSearchProduct = {
  productName: string;
 
  brand: string;
 
  supplement: string;
 
  representativeProduct:
    SearchRetailProduct;
 
  listings:
    SearchRetailProduct[];
 
  listingsCompared: number;
 
  vendorsCompared: number;
 
  lowestMonthlyCost: number;
 
  highestMonthlyCost: number;
 
  averageMonthlyCost: number;
 
  medianMonthlyCost: number;
 
  displayedMonthlyCost: number;
 
  displayedPerCapsuleCost: number;
 
  research:
    ProductResearch | null;
 };
 
 function roundCurrency(
  value: number
 ) {
  return (
    Math.round(value * 100) /
    100
  );
 }
 
 function clampScore(
  value: number
 ) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value)
    )
  );
 }
 
 function normalizeIdentity(
  value: string
 ) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .trim();
 }
 
 function normalizeCompact(
  value: string
 ) {
  return normalizeIdentity(
    value
  ).replace(/\s+/g, "");
 }
 
 /*
 * Creates the part of the product title
 * that distinguishes one product variant
 * from another.
 *
 * Retailer is deliberately not included,
 * allowing one exact product to contain
 * offers from multiple sellers.
 */
 function buildProductVariantIdentity(
  listing: SearchRetailProduct
 ) {
  let title =
    normalizeIdentity(
      listing.productTitle
    );
 
  const removableValues = [
    listing.brand,
    listing.supplement,
    listing.dosage,
  ]
    .map(normalizeIdentity)
    .filter(Boolean)
    .sort(
      (left, right) =>
        right.length -
        left.length
    );
 
  for (
    const removableValue of
    removableValues
  ) {
    title = title
      .replace(
        new RegExp(
          `\\b${removableValue
            .split(/\s+/)
            .join("\\s+")}\\b`,
          "gi"
        ),
        " "
      )
      .trim();
  }
 
  title = title
    /*
     * Dosage values.
     */
    .replace(
      /\b\d+(?:\.\d+)?\s*(?:mcg|mg|g|iu)\b/gi,
      " "
    )
 
    /*
     * Package quantities.
     */
    .replace(
      /\b\d{1,4}\s*(?:count|ct|capsules?|caps?|tablets?|tabs?|caplets?|softgels?|vegcaps?|gummies|gummy|chewables?|chews?|servings?|packets?|sticks?|sachets?)\b/gi,
      " "
    )
 
    /*
     * Form already has its own part of the
     * product identity key.
     */
    .replace(
      /\b(?:capsules?|caps?|tablets?|tabs?|caplets?|softgels?|vegcaps?|veg caps?|gummies|gummy|chewables?|chews?|powder|liquid|drops?|spray)\b/gi,
      " "
    )
 
    /*
     * Generic product language.
     */
    .replace(
      /\b(?:dietary|supplement|vitamin|mineral|bottle|pack|size|health|support|formula|product)\b/gi,
      " "
    )
 
    /*
     * Marketing language that should not
     * create a separate product identity.
     */
    .replace(
      /\b(?:new|official|best seller|bestseller|premium|quality|value size|bonus size|extra strength|max strength|maximum strength|high potency)\b/gi,
      " "
    )
 
    .replace(/\s+/g, " ")
    .trim();
 
  return (
    title ||
    normalizeCompact(
      listing.productTitle
    )
  );
 }
 
 function getProductGroupKey(
  listing: SearchRetailProduct
 ) {
  return [
    normalizeCompact(
      listing.brand
    ),
 
    normalizeCompact(
      listing.supplement
    ),
 
    normalizeCompact(
      buildProductVariantIdentity(
        listing
      )
    ),
 
    normalizeCompact(
      listing.dosage
    ),
 
    normalizeCompact(
      listing.form
    ),
 
    listing.capsulesPerBottle,
  ].join("|");
 }
 
 function getListingTotalPrice(
  listing: SearchRetailProduct
 ) {
  return (
    listing.bottlePrice +
    (
      listing.estimatedShipping ??
      0
    )
  );
 }
 
 /*
 * Keep the least expensive offer from each
 * retailer while preserving offers from
 * different retailers.
 */
 function collapseListingsByRetailer(
  listings: SearchRetailProduct[]
 ) {
  const cheapestByRetailer =
    new Map<
      string,
      SearchRetailProduct
 >();
 
  for (
    const listing of
    listings
  ) {
    const retailerKey =
      normalizeCompact(
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
    (left, right) =>
      getListingTotalPrice(
        left
      ) -
      getListingTotalPrice(
        right
      )
  );
 }
 
 function chooseRepresentativeListing(
  listings: SearchRetailProduct[]
 ) {
  const ranked =
    [...listings].sort(
      (left, right) => {
        const leftCompleteness = [
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
 
          left.form !==
            "Unknown",
 
          left.productTitle.length >
            0,
        ].filter(Boolean).length;
 
        const rightCompleteness = [
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
 
          right.form !==
            "Unknown",
 
          right.productTitle.length >
            0,
        ].filter(Boolean).length;
 
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
  listings: SearchRetailProduct[]
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
      .filter(Boolean)
      .join(" ")
  );
 }
 
 function groupVendorListings(
  listings: SearchRetailProduct[]
 ) {
  const groups =
    new Map<
      string,
      ProductGroup
 >();
 
  for (
    const listing of
    listings
  ) {
    const key =
      getProductGroupKey(
        listing
      );
 
    const existing =
      groups.get(key);
 
    if (existing) {
      existing.listings.push(
        listing
      );
 
      continue;
    }
 
    groups.set(key, {
      productName:
        listing.productTitle,
 
      brand:
        listing.brand.trim(),
 
      supplement:
        listing.supplement.trim(),
 
      listings: [
        listing,
      ],
    });
  }
 
  const groupedProducts =
    Array.from(
      groups.values()
    ).map(
      (group) => {
        const collapsedListings =
          collapseListingsByRetailer(
            group.listings
          );
 
        return {
          ...group,
 
          productName:
            buildProductName(
              collapsedListings
            ),
 
          listings:
            collapsedListings,
        };
      }
    );
 
  console.log(
    "VitaSearch exact products grouped:",
    {
      retailerListingCount:
        listings.length,
 
      productGroupCount:
        groupedProducts.length,
 
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
  listings: SearchRetailProduct[]
 ) {
  return new Set(
    listings.map(
      (listing) =>
        normalizeCompact(
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
 
  vendorsCompared: number;
 
  listingsCompared: number;
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
  confidenceScore: number
 ):
  | "high"
  | "medium"
  | "low" {
  if (
    confidenceScore >= 80
  ) {
    return "high";
  }
 
  if (
    confidenceScore >= 55
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
      .capsulesPerBottle > 0,
 
    Boolean(
      representative.dosage
    ),
 
    representative
      .dosageAmount !== null,
 
    representative
      .dosageUnit !== null,
 
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
    checks.filter(Boolean).length;
 
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
  value: number;
 
  availability: number;
 
  dataCompleteness: number;
 }): SearchProductScore {
  const overall =
    clampScore(
      value * 0.45 +
        availability * 0.35 +
        dataCompleteness *
          0.2
    );
 
  return {
    overall,
 
    value:
      clampScore(value),
 
    productQuality: null,
 
    dosageFit: null,
 
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
 
 async function prepareSearchProduct({
  group,
  capsulesPerDay,
  pricingStrategy,
 }: {
  group: ProductGroup;
 
  capsulesPerDay: number;
 
  pricingStrategy: Awaited<
    ReturnType<
      typeof getPricingStrategy
 >
 >;
 }): Promise<PreparedSearchProduct> {
  /*
   * Initial product results never wait for
   * database or OpenAI enrichment.
   */
  const research:
    ProductResearch | null =
      null;
 
  const pricing =
    calculateDisplayedMonthlyCost(
      group.listings,
      capsulesPerDay,
      pricingStrategy
    );
 
  const monthlyUnits =
    pricing.monthlyCapsules;
 
  const representativeProduct =
    chooseRepresentativeListing(
      group.listings
    );
 
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
      listing[claim] === true
  );
 }
 
 function hasCertification(
  research:
    ProductResearch | null,
 
  patterns:
    RegExp[]
 ) {
  if (!research) {
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
      research?.vegan === true,
 
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
    research?.thirdPartyTested ===
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
 
  capsulesPerDay: number
 ): Promise<SearchProductOption[]> {
  if (
    listings.length === 0
  ) {
    return [];
  }
 
  const pricingStrategy =
    await getPricingStrategy();
 
  const groups =
    groupVendorListings(
      listings
    );
 
  const preparedProducts =
    await Promise.all(
      groups.map(
        (group) =>
          prepareSearchProduct({
            group,
 
            capsulesPerDay,
 
            pricingStrategy,
          })
      )
    );
 
  if (
    preparedProducts.length === 0
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
 
            dosageFit: 100,
 
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
            ?.form?.trim() ||
          (
            representative.form ===
              "Unknown" ||
            representative.form ===
              "Other"
              ? null
              : representative.form
          );
 
        console.log(
          "VitaSearch product prepared:",
          {
            productName:
              prepared.productName,
 
            brand:
              prepared.brand,
 
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
 
            form,
 
            unitLabel:
              representative
                .unitLabel,
 
            vitaPouchFormEligible:
              representative
                .vitaPouchFormEligible,
 
            vendorsCompared:
              prepared
                .vendorsCompared,
 
            vendorOffers:
              prepared.listings.map(
                (listing) => ({
                  retailer:
                    listing.retailer,
 
                  bottlePrice:
                    listing.bottlePrice,
 
                  shipping:
                    listing
                      .estimatedShipping,
 
                  url:
                    listing.url,
                })
              ),
 
            researchFound:
              Boolean(
                prepared.research
              ),
          }
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
 
          /*
           * First-class dosage fields used
           * directly by cards and filters.
           */
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
 
          selected: false,
 
          recommended: false,
 
          reasons: [],
        };
      }
    )
    .sort(
      (left, right) =>
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
    )
    .slice(
      0,
      MAX_PRODUCT_CARDS
    );
 }