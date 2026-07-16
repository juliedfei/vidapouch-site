import type {
    RetailProduct,
   } from "@/lib/pricing/types";
   
   import type {
    ProductOption,
    ProductScoreBreakdown,
   } from "./productOption";
   
   import type {
    ProductResearch,
   } from "@/lib/intelligence/productResearch/productResearchTypes";
   
   import {
    getCachedProductResearch,
   } from
   "@/lib/intelligence/productResearch/getCachedProductResearch";



   
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
   } from "./evaluators/calculateAvailabilityScore";
   
   import {
    evaluateProduct,
   } from "./evaluateProduct";
   
   import {
    scoreProduct,
   } from "./scoreProduct";
   
   type ProductGroup = {
    productName: string;
    brand: string;
    supplement: string;
    listings: RetailProduct[];
   };
   
   type PreparedProduct = {
    productName: string;
    brand: string;
    supplement: string;
   
    representativeProduct:
      RetailProduct;
   
    listings:
      RetailProduct[];
   
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
      ProductResearch;
   };
   
   function roundCurrency(
    value: number
   ) {
    return Math.round(
      value * 100
    ) / 100;
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
   * Product identity currently means:
   *
   * Brand + Supplement
   *
   * Examples:
   *
   * NOW + Vitamin C
   * Thorne + Vitamin C
   *
   * Dosage and vendor are deliberately not
   * part of this grouping key.
   */
   function getProductGroupKey(
    listing: RetailProduct
   ) {
    return [
      normalizeCompact(
        listing.brand
      ),
   
      normalizeCompact(
        listing.supplement
      ),
    ].join("|");
   }
   
   function buildProductName({
    brand,
    supplement,
   }: {
    brand: string;
    supplement: string;
   }) {
    return [
      brand.trim(),
      supplement.trim(),
    ]
      .filter(Boolean)
      .join(" ");
   }
   
   function groupVendorListings(
    listings: RetailProduct[]
   ) {
    const groups =
      new Map<
        string,
        ProductGroup
  > ();
   
    for (
      const listing of listings
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
          buildProductName({
            brand:
              listing.brand,
   
            supplement:
              listing.supplement,
          }),
   
        brand:
          listing.brand.trim(),
   
        supplement:
          listing.supplement.trim(),
   
        listings: [
          listing,
        ],
      });
    }
   
    return Array.from(
      groups.values()
    );
   }
   
   /*
   * This is the listing VidaPouch should
   * currently prefer for purchasing.
   *
   * It is selected by landed cost per unit,
   * not by total bottle price.
   */
   function chooseRepresentativeListing(
    listings: RetailProduct[]
   ) {
    const ranked =
      [...listings].sort(
        (left, right) =>
          calculatePerCapsuleCost(
            left
          ) -
          calculatePerCapsuleCost(
            right
          )
      );
   
    return ranked[0];
   }
   
   function countUniqueVendors(
    listings: RetailProduct[]
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
    research: ProductResearch;
    vendorsCompared: number;
    listingsCompared: number;
   }) {
    const researchConfidence =
      Math.round(
        research.aiConfidence *
        60
      );
   
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
   



   async function prepareProduct({
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
   }): Promise<PreparedProduct | null> {
    const research =
      await getCachedProductResearch(
        group.productName
      );
   
    /*
     * Checkout must never wait for OpenAI.
     *
     * Products without completed cached
     * research are excluded from this
     * checkout comparison.
     */
    if (!research) {
      console.log(
        "Skipping uncached product:",
        group.productName
      );
   
      return null;
    }
   
    const pricing =
      calculateDisplayedMonthlyCost(
        group.listings,
        capsulesPerDay,
        pricingStrategy
      );
   
    const monthlyCapsules =
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
          monthlyCapsules
        ),
   
      highestMonthlyCost:
        roundCurrency(
          pricing.pricing
            .highestPerCapsuleCost *
          monthlyCapsules
        ),
   
      averageMonthlyCost:
        roundCurrency(
          pricing.pricing
            .averagePerCapsuleCost *
          monthlyCapsules
        ),
   
      medianMonthlyCost:
        roundCurrency(
          pricing.pricing
            .medianPerCapsuleCost *
          monthlyCapsules
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
   





   export async function buildProductOptions(
    listings: RetailProduct[],
    capsulesPerDay: number
   ): Promise<ProductOption[]> {
    if (
      listings.length === 0
    ) {
      return [];
    }
   
    /*
     * Load the strategy once for the full
     * supplement comparison.
     */
    const pricingStrategy =
      await getPricingStrategy();
   
    const groups =
      groupVendorListings(
        listings
      );
   
      const preparedResults =
      await Promise.all(
        groups.map(
          (group) =>
            prepareProduct({
              group,
              capsulesPerDay,
              pricingStrategy,
            })
        )
      );
     
     const preparedProducts =
      preparedResults.filter(
        (
          product
        ): product is PreparedProduct =>
          product !== null
      );
     
     if (
      preparedProducts.length === 0
     ) {
      return [];
     }




   
    /*
     * Value must be calculated across the
     * competing products for this supplement,
     * not merely across vendors carrying the
     * same product.
     */
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
   
    return preparedProducts.map(
      (
        prepared
      ): ProductOption => {
        const evaluation =
          evaluateProduct(
            prepared.research
          );
   
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
   
        const scoringInput = {
          ...evaluation,
   
          value,
   
          availability,
        };
   
        const productScore =
          scoreProduct(
            scoringInput
          );

          console.log(
            prepared.productName,
            scoringInput,
            productScore
           );
           

   
        /*
         * Product quality is shown as a
         * composite of formulation quality,
         * clean ingredients, and independent
         * certification signals.
         */
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
   
        const score:
          ProductScoreBreakdown = {
            overall:
              productScore.overall,
   
            value:
              productScore.value,
   
            productQuality,
   
            /*
             * This remains temporary until
             * requested dosage compatibility
             * has its own evaluator.
             */
            dosageFit: 100,
   
            /*
             * Availability currently acts as
             * the best available measure of
             * vendor-listing confidence.
             */
            retailerConfidence:
              productScore
                .availability,
   
            dataCompleteness:
              scoringInput
                .dataCompleteness,
          };
   
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
   
        return {
          productName:
            prepared.productName,
   
          brand:
            prepared.brand,
   
          representativeProduct:
            prepared
              .representativeProduct,
   
          listings:
            prepared.listings,
   
          listingsCompared:
            prepared
              .listingsCompared,
   
          vendorsCompared:
            prepared
              .vendorsCompared,
   
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
   
          /*
           * selectDisplayedPrice() currently
           * defaults to the average. Later,
           * PricingStrategy will select
           * lowest, average, median, or
           * highest from the database.
           */
          displayedMonthlyCost:
            prepared
              .displayedMonthlyCost,
   
          score,
   
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
    );
   }