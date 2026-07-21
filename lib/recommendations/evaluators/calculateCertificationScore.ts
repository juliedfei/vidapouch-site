type CalculateCertificationScoreInput = {
  thirdPartyTested:
    boolean | null;
 
  uspVerified:
    boolean | null;
 
  nsfCertified:
    boolean | null;
 
  certifications:
    string[];
 
  /*
   * Optional so existing callers continue
   * to build until qualityClaims is wired
   * into evaluateProduct().
   */
  qualityClaims?:
    string[];
 };
 
 function clamp(
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
 
 function normalizeClaim(
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
 
 function includesClaim(
  claims: string[],
  patterns: RegExp[]
 ) {
  return claims.some(
    (claim) => {
      const normalized =
        normalizeClaim(
          claim
        );
 
      return patterns.some(
        (pattern) =>
          pattern.test(
            normalized
          )
      );
    }
  );
 }
 
 /*
 * Calculates product quality support from
 * certifications and testing claims.
 *
 * Formal product-level certifications are
 * the strongest signals.
 *
 * Manufacturing and facility claims help,
 * but they are intentionally worth less
 * than finished-product verification.
 */
 export function
 calculateCertificationScore({
  thirdPartyTested,
  uspVerified,
  nsfCertified,
  certifications,
  qualityClaims = [],
 }: CalculateCertificationScoreInput) {
  const normalizedCertifications =
    certifications.filter(Boolean);
 
  const normalizedQualityClaims =
    qualityClaims.filter(Boolean);
 
  const hasNsfCertifiedForSport =
    includesClaim(
      normalizedCertifications,
      [
        /\bnsf certified for sport\b/i,
      ]
    );
 
  const hasNsfCertified =
    nsfCertified === true ||
    includesClaim(
      normalizedCertifications,
      [
        /\bnsf certified\b/i,
      ]
    );
 
  const hasUspVerified =
    uspVerified === true ||
    includesClaim(
      normalizedCertifications,
      [
        /\busp verified\b/i,
        /\busp dietary supplement verified\b/i,
      ]
    );
 
  const hasInformedSport =
    includesClaim(
      normalizedCertifications,
      [
        /\binformed sport\b/i,
      ]
    );
 
  const hasInformedChoice =
    includesClaim(
      normalizedCertifications,
      [
        /\binformed choice\b/i,
      ]
    );
 
  const hasNonGmoProjectVerified =
    includesClaim(
      normalizedCertifications,
      [
        /\bnon gmo project verified\b/i,
      ]
    );
 
  const hasBannedSubstanceTesting =
    includesClaim(
      [
        ...normalizedCertifications,
        ...normalizedQualityClaims,
      ],
      [
        /\bbanned substance tested\b/i,
        /\btested for banned substances\b/i,
      ]
    );
 
  const hasThirdPartyTesting =
    thirdPartyTested === true ||
    includesClaim(
      normalizedQualityClaims,
      [
        /\bthird party tested\b/i,
        /\bindependently tested\b/i,
      ]
    );
 
  const hasNpaGmpCertification =
    includesClaim(
      normalizedQualityClaims,
      [
        /\bnpa gmp certified\b/i,
        /\bnatural products association gmp\b/i,
      ]
    );
 
  const hasGmpQualityAssurance =
    includesClaim(
      normalizedQualityClaims,
      [
        /\bgmp quality assured\b/i,
        /\bgmp quality assurance\b/i,
      ]
    );
 
  const hasCgmpManufacturing =
    includesClaim(
      normalizedQualityClaims,
      [
        /\bcgmp manufactured\b/i,
        /\bcgmp compliant\b/i,
        /\bcgmp certified facility\b/i,
      ]
    );
 
  /*
   * Begin with the strongest single signal.
   *
   * This avoids inflating the score simply
   * because the same underlying standard is
   * represented by multiple related labels.
   */
  let score = 0;
 
  if (
    hasNsfCertifiedForSport
  ) {
    score = Math.max(
      score,
      100
    );
  }
 
  if (hasUspVerified) {
    score = Math.max(
      score,
      98
    );
  }
 
  if (hasNsfCertified) {
    score = Math.max(
      score,
      94
    );
  }
 
  if (hasInformedSport) {
    score = Math.max(
      score,
      90
    );
  }
 
  if (hasInformedChoice) {
    score = Math.max(
      score,
      86
    );
  }
 
  if (
    hasBannedSubstanceTesting
  ) {
    score = Math.max(
      score,
      82
    );
  }
 
  if (
    hasThirdPartyTesting
  ) {
    score = Math.max(
      score,
      78
    );
  }
 
  if (
    hasNonGmoProjectVerified
  ) {
    score = Math.max(
      score,
      68
    );
  }
 
  /*
   * Manufacturing-quality claims are
   * valuable but do not establish that the
   * exact finished product was independently
   * certified.
   */
  if (
    hasNpaGmpCertification
  ) {
    score = Math.max(
      score,
      52
    );
  }
 
  if (
    hasGmpQualityAssurance
  ) {
    score = Math.max(
      score,
      44
    );
  }
 
  if (
    hasCgmpManufacturing
  ) {
    score = Math.max(
      score,
      38
    );
  }
 
  /*
   * Add modest credit when multiple
   * independent quality signals coexist.
   */
  const strongSignalCount = [
    hasNsfCertifiedForSport,
    hasUspVerified,
    hasNsfCertified,
    hasInformedSport,
    hasInformedChoice,
    hasBannedSubstanceTesting,
    hasThirdPartyTesting,
    hasNonGmoProjectVerified,
  ].filter(Boolean).length;
 
  if (
    strongSignalCount >= 2
  ) {
    score += 5;
  }
 
  if (
    strongSignalCount >= 3
  ) {
    score += 3;
  }
 
  return clamp(score);
 }
 