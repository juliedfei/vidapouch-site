type CalculateCertificationScoreInput = {

    thirdPartyTested: boolean | null;
   
    uspVerified: boolean | null;
   
    nsfCertified: boolean | null;
   
    certifications: string[];
   
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
   
   export function calculateCertificationScore({
    thirdPartyTested,
    uspVerified,
    nsfCertified,
    certifications,
   }: CalculateCertificationScoreInput) {
   
    let score = 0;
   
    /*
     * Third-party testing is the
     * strongest signal.
     */
    if (thirdPartyTested) {
      score += 40;
    }
   
    /*
     * USP is one of the strongest
     * supplement certifications.
     */
    if (uspVerified) {
      score += 30;
    }
   
    /*
     * NSF certification.
     */
    if (nsfCertified) {
      score += 20;
    }
   
    /*
     * Additional certifications
     * provide incremental confidence.
     */
    score += Math.min(
      certifications.length * 2,
      10
    );
   
    return clamp(score);
   
   }
   