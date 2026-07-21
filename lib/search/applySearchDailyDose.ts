import type {
    SearchProductOption,
    SearchProductUnitLabel,
   } from "./searchProductOption";
   
   import type {
    ParsedSearchDailyDose,
   } from "./parseSearchDailyDose";
   
   export type DailyDoseProductResult = {
    product:
      SearchProductOption;
   
    unitsPerDay: number;
   };
   
   function normalizeUnit(
    value:
      SearchProductUnitLabel
   ) {
    return value
      .toLowerCase()
      .trim();
   }
   
   function dosageUnitsMatch(
    left:
      string | null,
   
    right:
      string
   ) {
    if (!left) {
      return false;
    }
   
    return (
      left
        .toLowerCase()
        .trim() ===
      right
        .toLowerCase()
        .trim()
    );
   }
   
   function isWholeNumber(
    value: number
   ) {
    return (
      Number.isFinite(
        value
      ) &&
      value > 0 &&
      Math.abs(
        value -
        Math.round(value)
      ) <
        0.000001
    );
   }
   
   function multiplyPrice(
    value: number,
    unitsPerDay: number
   ) {
    return (
      Math.round(
        value *
          unitsPerDay *
          100
      ) /
      100
    );
   }
   
   function applyUnitsPerDay({
    product,
    unitsPerDay,
   }: {
    product:
      SearchProductOption;
   
    unitsPerDay: number;
   }): DailyDoseProductResult {
    return {
      product: {
        ...product,
   
        lowestMonthlyCost:
          multiplyPrice(
            product
              .lowestMonthlyCost,
            unitsPerDay
          ),
   
        highestMonthlyCost:
          multiplyPrice(
            product
              .highestMonthlyCost,
            unitsPerDay
          ),
   
        averageMonthlyCost:
          multiplyPrice(
            product
              .averageMonthlyCost,
            unitsPerDay
          ),
   
        medianMonthlyCost:
          multiplyPrice(
            product
              .medianMonthlyCost,
            unitsPerDay
          ),
   
        displayedMonthlyCost:
          multiplyPrice(
            product
              .displayedMonthlyCost,
            unitsPerDay
          ),
      },
   
      unitsPerDay,
    };
   }
   
   /*
   * Applies the selected daily dose to one
   * search product.
   *
   * Returns null when the product cannot
   * reliably provide the requested dose
   * using whole physical units.
   */
   export function applySearchDailyDose({
    product,
    dailyDose,
   }: {
    product:
      SearchProductOption;
   
    dailyDose:
      ParsedSearchDailyDose;
   }): DailyDoseProductResult | null {
    if (
      dailyDose.type ===
      "invalid"
    ) {
      /*
       * Invalid or unfinished input should not
       * temporarily erase all search results.
       */
      return applyUnitsPerDay({
        product,
   
        unitsPerDay: 1,
      });
    }
   
    if (
      dailyDose.type ===
      "physical-units"
    ) {
      const productUnit =
        normalizeUnit(
          product.unitLabel
        );
   
      const requestedUnit =
        normalizeUnit(
          dailyDose.unit
        );
   
      /*
       * "unit" is intentionally generic and
       * may apply to any physical product.
       */
      const unitsMatch =
        requestedUnit ===
          "unit" ||
        productUnit ===
          requestedUnit;
   
      if (!unitsMatch) {
        return null;
      }
   
      return applyUnitsPerDay({
        product,
   
        unitsPerDay:
          dailyDose.amount,
      });
    }
   
    /*
     * A precise dosage filter requires a known
     * dosage amount and matching measurement
     * unit.
     */
    if (
      product.dosageAmount ===
        null ||
      !dosageUnitsMatch(
        product.dosageUnit,
        dailyDose.unit
      )
    ) {
      return null;
    }
   
    /*
     * A serving-level dose cannot be safely
     * converted into capsules or tablets
     * unless the serving quantity is known.
     */
    if (
      product.dosageIsPerServing ===
      true
    ) {
      return null;
    }
   
    const unitsPerDay =
      dailyDose.amount /
      product.dosageAmount;
   
    /*
     * Capsules, tablets, softgels, caplets,
     * and gummies cannot be divided.
     *
     * Examples:
     *
     * 250 mg ÷ 250 mg = 1 unit — include
     * 250 mg ÷ 125 mg = 2 units — include
     * 250 mg ÷ 500 mg = 0.5 — exclude
     * 250 mg ÷ 200 mg = 1.25 — exclude
     */
    if (
      !isWholeNumber(
        unitsPerDay
      )
    ) {
      return null;
    }
   
    return applyUnitsPerDay({
      product,
   
      unitsPerDay:
        Math.round(
          unitsPerDay
        ),
    });
   }
   