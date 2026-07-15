export type RecommendationWeights = {

    quality: number;
   
    reviews: number;
   
    value: number;
   
    evidence: number;
   
    availability: number;
   
   };
   
   export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
   
    quality: 35,
   
    reviews: 20,
   
    value: 20,
   
    evidence: 15,
   
    availability: 10,
   
   };