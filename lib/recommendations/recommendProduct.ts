import type {
  BrandOption,
  } from "./brandOption";
  
  import type {
  Recommendation,
  RecommendationReason,
  } from "./recommendationTypes";
  
  export function recommendProduct(
  brands: BrandOption[]
  ): Recommendation | null {
  
  if (brands.length === 0) {
    return null;
  }
  
  /*
   * Highest recommendation score wins.
   * If two brands receive the same score,
   * the lower monthly price wins.
   */
  const ranked = [...brands].sort(
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
  
      return (
        left.estimatedMonthlyCost -
        right.estimatedMonthlyCost
      );
    }
  );
  
  const winner = ranked[0];
  
  const reasons: RecommendationReason[] = [
    {
      title:
        "Highest overall recommendation",
  
      description:
        `This brand achieved an overall recommendation score of ${winner.score.overall}/100.`,
  
      importance: 100,
    },
  ];
  
  winner.recommended = true;
  



  return {
    product: winner.representativeProduct,
   
    score: winner.score,
   
    recommended: true,
   
    confidence: winner.confidence,
   
    reasons,
   
    alternatives: ranked
      .slice(1)
      .map((brand) => brand.representativeProduct),
   };



  }