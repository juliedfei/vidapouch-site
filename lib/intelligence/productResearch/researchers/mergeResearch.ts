import type {
    ProductFact,
    ProductResearch,
    ProductResearchEvidence,
   } from "../productResearchTypes";
   
   type PartialResearch =
    Partial<ProductResearch>;
   
   type MergeResearchInput = {
    productName: string;
   
    officialWebsite:
      PartialResearch;
   
    vendorListings:
      PartialResearch;
   
    reviews:
      PartialResearch;
   
    certifications:
      PartialResearch;
   
    scientificEvidence:
      PartialResearch;
   };
   
   function uniqueStrings(
    values: Array<
      string[] | undefined
   >
   ) {
    return Array.from(
      new Set(
        values
          .flatMap(
            (value) =>
              value ?? []
          )
          .map(
            (value) =>
              value.trim()
          )
          .filter(Boolean)
      )
    );
   }
   
   function uniqueEvidence(
    evidenceGroups: Array<
      ProductResearchEvidence[] |
      undefined
   >
   ) {
    const evidenceByKey =
      new Map<
        string,
        ProductResearchEvidence
   >();
   
    for (
      const evidence of
      evidenceGroups.flatMap(
        (group) =>
          group ?? []
      )
    ) {
      const key = [
        evidence.source
          .trim()
          .toLowerCase(),
   
        evidence.url
          .trim()
          .toLowerCase(),
   
        evidence.title
          .trim()
          .toLowerCase(),
      ].join("|");
   
      const existing =
        evidenceByKey.get(key);
   
      /*
       * Keep the higher-confidence version
       * when the same source is returned by
       * more than one researcher.
       */
      if (
        !existing ||
        evidence.confidence >
          existing.confidence
      ) {
        evidenceByKey.set(
          key,
          evidence
        );
      }
    }
   
    return Array.from(
      evidenceByKey.values()
    );
   }
   
   function mergeFact(
    values: ProductFact[]
   ): ProductFact {
    const knownValues =
      values.filter(
        (
          value
        ): value is boolean =>
          value !== null
      );
   
    if (
      knownValues.length === 0
    ) {
      return null;
    }
   
    const trueCount =
      knownValues.filter(
        Boolean
      ).length;
   
    const falseCount =
      knownValues.length -
      trueCount;
   
    /*
     * Conflicting research remains unknown
     * until stronger source weighting is
     * added.
     */
    if (
      trueCount ===
      falseCount
    ) {
      return null;
    }
   
    return (
      trueCount >
      falseCount
    );
   }
   
   function firstDefined<T>(
    values: Array<
      T | undefined
   >
   ): T | undefined {
    return values.find(
      (value) =>
        value !== undefined
    );
   }
   
   function weightedAverage(
    values: Array<
      number | undefined
   >
   ) {
    const available =
      values.filter(
        (
          value
        ): value is number =>
          typeof value ===
            "number" &&
          Number.isFinite(
            value
          )
      );
   
    if (
      available.length === 0
    ) {
      return undefined;
    }
   
    return (
      available.reduce(
        (total, value) =>
          total + value,
        0
      ) /
      available.length
    );
   }
   
   function clampConfidence(
    value: number
   ) {
    return Math.max(
      0,
      Math.min(
        1,
        value
      )
    );
   }
   
   export function mergeResearch({
    productName,
    officialWebsite,
    vendorListings,
    reviews,
    certifications,
    scientificEvidence,
   }: MergeResearchInput): ProductResearch {
    const sources = [
      officialWebsite,
      vendorListings,
      reviews,
      certifications,
      scientificEvidence,
    ];
   
    const evidence =
      uniqueEvidence(
        sources.map(
          (source) =>
            source.evidence
        )
      );
   
    const sourceConfidences =
      sources
        .map(
          (source) =>
            source.aiConfidence
        )
        .filter(
          (
            value
          ): value is number =>
            typeof value ===
              "number" &&
            Number.isFinite(
              value
            )
        );
   
    const evidenceConfidence =
      evidence.length > 0
        ? evidence.reduce(
            (
              total,
              item
            ) =>
              total +
              item.confidence,
            0
          ) /
          evidence.length
        : 0;
   
    const sourceConfidence =
      sourceConfidences.length >
        0
        ? sourceConfidences.reduce(
            (
              total,
              value
            ) =>
              total + value,
            0
          ) /
          sourceConfidences.length
        : 0;
   
    const aiConfidence =
      clampConfidence(
        sourceConfidence * 0.6 +
        evidenceConfidence * 0.4
      );
   
    const summaries =
      sources
        .map(
          (source) =>
            source.aiSummary
              ?.trim()
        )
        .filter(
          (
            summary
          ): summary is string =>
            Boolean(summary)
        );
   
    return {
      supplement:
        firstDefined(
          sources.map(
            (source) =>
              source.supplement
          )
        ) ?? "",
   
      brand:
        firstDefined(
          sources.map(
            (source) =>
              source.brand
          )
        ) ?? "",
   
      productName,
   
      dosage:
        firstDefined(
          sources.map(
            (source) =>
              source.dosage
          )
        ),
   
      servingSize:
        firstDefined(
          sources.map(
            (source) =>
              source.servingSize
          )
        ),
   
      unitsPerContainer:
        firstDefined(
          sources.map(
            (source) =>
              source
                .unitsPerContainer
          )
        ),
   
      form:
        firstDefined(
          sources.map(
            (source) =>
              source.form
          )
        ),
   
      capsuleType:
        firstDefined(
          sources.map(
            (source) =>
              source.capsuleType
          )
        ),
   
      manufacturer:
        firstDefined(
          sources.map(
            (source) =>
              source.manufacturer
          )
        ),
   
      countryOfOrigin:
        firstDefined(
          sources.map(
            (source) =>
              source
                .countryOfOrigin
          )
        ),
   
      officialProductUrl:
        firstDefined(
          sources.map(
            (source) =>
              source
                .officialProductUrl
          )
        ),
   
      imageUrl:
        firstDefined(
          sources.map(
            (source) =>
              source.imageUrl
          )
        ),
   
      ingredientForm:
        firstDefined(
          sources.map(
            (source) =>
              source.ingredientForm
          )
        ),
   
      ingredients:
        uniqueStrings(
          sources.map(
            (source) =>
              source.ingredients
          )
        ),
   
      inactiveIngredients:
        uniqueStrings(
          sources.map(
            (source) =>
              source
                .inactiveIngredients
          )
        ),
   
      allergens:
        uniqueStrings(
          sources.map(
            (source) =>
              source.allergens
          )
        ),
   
      vegan:
        mergeFact(
          sources.map(
            (source) =>
              source.vegan ??
              null
          )
        ),
   
      vegetarian:
        mergeFact(
          sources.map(
            (source) =>
              source.vegetarian ??
              null
          )
        ),
   
      nonGmo:
        mergeFact(
          sources.map(
            (source) =>
              source.nonGmo ??
              null
          )
        ),
   
      glutenFree:
        mergeFact(
          sources.map(
            (source) =>
              source.glutenFree ??
              null
          )
        ),
   
      soyFree:
        mergeFact(
          sources.map(
            (source) =>
              source.soyFree ??
              null
          )
        ),
   
      dairyFree:
        mergeFact(
          sources.map(
            (source) =>
              source.dairyFree ??
              null
          )
        ),
   
      artificialColors:
        mergeFact(
          sources.map(
            (source) =>
              source
                .artificialColors ??
              null
          )
        ),
   
      artificialSweeteners:
        mergeFact(
          sources.map(
            (source) =>
              source
                .artificialSweeteners ??
              null
          )
        ),
   
      preservatives:
        mergeFact(
          sources.map(
            (source) =>
              source
                .preservatives ??
              null
          )
        ),
   
      thirdPartyTested:
        mergeFact(
          sources.map(
            (source) =>
              source
                .thirdPartyTested ??
              null
          )
        ),
   
      uspVerified:
        mergeFact(
          sources.map(
            (source) =>
              source
                .uspVerified ??
              null
          )
        ),
   
      nsfCertified:
        mergeFact(
          sources.map(
            (source) =>
              source
                .nsfCertified ??
              null
          )
        ),
   
      cgmpManufactured:
        mergeFact(
          sources.map(
            (source) =>
              source
                .cgmpManufactured ??
              null
          )
        ),
   
      certifications:
        uniqueStrings(
          sources.map(
            (source) =>
              source
                .certifications
          )
        ),
   
      commonBenefits:
        uniqueStrings(
          sources.map(
            (source) =>
              source
                .commonBenefits
          )
        ),
   
      commonComplaints:
        uniqueStrings(
          sources.map(
            (source) =>
              source
                .commonComplaints
          )
        ),
   
      averageRating:
        weightedAverage(
          sources.map(
            (source) =>
              source
                .averageRating
          )
        ),
   
      reviewCount:
        firstDefined(
          sources.map(
            (source) =>
              source.reviewCount
          )
        ),
   
      reviewSummary:
        firstDefined(
          [
            reviews.reviewSummary,
            vendorListings
              .reviewSummary,
          ]
        ),
   
      aiSummary:
        summaries.join(
          "\n\n"
        ),
   
      aiConfidence,
   
      evidence,
    };
   }
   