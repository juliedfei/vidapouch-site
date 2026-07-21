export type RecommendationWeights = {
    quality: number;
   
    reviews: number;
   
    value: number;
   
    evidence: number;
   
    availability: number;
   };
   
   export const
   DEFAULT_RECOMMENDATION_WEIGHTS:
    RecommendationWeights = {
      /*
       * Product quality is the strongest
       * factor. This now reflects actual
       * certification, testing, and
       * clean-ingredient information.
       */
      quality: 45,
   
      /*
       * Customer reviews remain useful, but
       * they do not outweigh verified product
       * quality or research support.
       */
      reviews: 10,
   
      /*
       * Price matters only after quality.
       * A cheap product cannot earn a strong
       * overall score from value alone.
       */
      value: 10,
   
      /*
       * Research evidence and confidence are
       * heavily weighted so unsupported claims
       * do not receive a strong score.
       */
      evidence: 25,
   
      /*
       * Retail availability remains relevant,
       * but it is not a quality signal.
       */
      availability: 10,
    };
   