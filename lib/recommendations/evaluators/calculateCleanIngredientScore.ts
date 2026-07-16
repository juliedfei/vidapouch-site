type CalculateCleanIngredientScoreInput = {

    artificialColors: boolean | null;
   
    artificialSweeteners: boolean | null;
   
    preservatives: boolean | null;
   
    soyFree: boolean | null;
   
    dairyFree: boolean | null;
   
    glutenFree: boolean | null;
   
    vegan: boolean | null;
   
   };
   
   function clamp(
    value: number
   ) {
    return Math.max(
      0,
      Math.min(
        100,
        value
      )
    );
   }
   
   export function calculateCleanIngredientScore({
   
    artificialColors,
   
    artificialSweeteners,
   
    preservatives,
   
    soyFree,
   
    dairyFree,
   
    glutenFree,
   
    vegan,
   
   }: CalculateCleanIngredientScoreInput) {
   
    /*
     * Start assuming a clean product.
     */
    let score = 100;
   
    /*
     * Deduct for ingredients that many
     * customers actively try to avoid.
     */
   
    if (artificialColors === true) {
      score -= 20;
    }
   
    if (artificialSweeteners === true) {
      score -= 20;
    }
   
    if (preservatives === true) {
      score -= 15;
    }
   
    /*
     * Reward products that support more
     * dietary preferences.
     */
   
    if (soyFree === true) {
      score += 4;
    }
   
    if (dairyFree === true) {
      score += 4;
    }
   
    if (glutenFree === true) {
      score += 4;
    }
   
    if (vegan === true) {
      score += 4;
    }
   
    return clamp(score);
   
   }