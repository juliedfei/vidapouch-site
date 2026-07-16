import type {
  ProductOption,
 } from "./productOption";
 
 import type {
  Recommendation,
  RecommendationReason,
 } from "./recommendationTypes";
 
 export function recommendProduct(
  products: ProductOption[]
 ): Recommendation | null {
 
  if (products.length === 0) {
    return null;
  }
 
  /*
   * Rank products.
   *
   * Primary:
   *   Overall recommendation score.
   *
   * Secondary:
   *   Confidence.
   *
   * Tertiary:
   *   Lower displayed monthly cost.
   */
  const ranked =
    [...products].sort(
      (left, right) => {
 
        if (
          left.score.overall !==
          right.score.overall
        ) {
          return (
            right.score.overall -
            left.score.overall
          );
        }
 
        if (
          left.confidenceScore !==
          right.confidenceScore
        ) {
          return (
            right.confidenceScore -
            left.confidenceScore
          );
        }
 
        return (
          left.displayedMonthlyCost -
          right.displayedMonthlyCost
        );
 
      }
    );
 
  const winner =
    ranked[0];
 
  winner.recommended = true;
 
  const reasons:
    RecommendationReason[] = [
 
    {
      title:
        "Highest overall recommendation",
 
      description:
        `VIDAPouch determined that ${winner.productName} provides the strongest overall combination of quality, evidence, value, and availability.`,
 
      importance: 100,
    },
 
  ];
 
  return {
 
    product:
      winner.representativeProduct,
 
    score:
      winner.score,
 
    recommended: true,
 
    confidence:
      winner.confidence,
 
    reasons,
 
    alternatives:
      ranked
        .slice(1)
        .map(
          (
            product
          ) =>
            product.representativeProduct
        ),
 
  };
 
 }