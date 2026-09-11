import "server-only";

import type {
  SearchPlan,
} from "@/components/search/types/searchPlan";

import type {
  SearchPouchCostConfidence,
  SearchPouchCostContribution,
  SearchPouchItem,
  SearchPouchPooledPricing,
  SearchPouchPooledPricingLine,
} from "@/components/search/types/searchPouch";

import {
  getVidaPouchPricingConfig,
} from "./getVidaPouchPricingConfig";

type CalculatePooledPouchPricingInput = {
  selectedPlan:
    SearchPlan;

  pouchItems:
    SearchPouchItem[];
};

const PLAN_OVERAGE_TOOLTIP =
  "Higher-cost product selections or increased daily quantities may increase your Plan Overage.";

function roundCurrency(
  value:
    number
) {
  return Math.round(
    (
      value +
      Number.EPSILON
    ) *
      100
  ) / 100;
}

function clampNonNegative(
  value:
    number
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    value
  );
}

function roundToIncrement({
  value,
  increment,
}: {
  value:
    number;

  increment:
    number;
}) {
  const safeValue =
    clampNonNegative(
      value
    );

  const safeIncrement =
    Number.isFinite(
      increment
    ) &&
    increment >
      0
      ? increment
      : 0.01;

  return roundCurrency(
    Math.ceil(
      (
        safeValue -
        Number.EPSILON
      ) /
        safeIncrement
    ) *
      safeIncrement
  );
}

function getSelectedMonthlyCost(
  item:
    SearchPouchItem
) {
  if (
    item.pricing &&
    Number.isFinite(
      item.pricing
        .monthlyProductCost
    )
  ) {
    return roundCurrency(
      clampNonNegative(
        item.pricing
          .monthlyProductCost
      )
    );
  }

  return roundCurrency(
    clampNonNegative(
      item.monthlyPrice
    )
  );
}

function getBaselineMonthlyCost(
  item:
    SearchPouchItem
) {
  if (
    typeof item
      .baselineMonthlyPrice ===
      "number" &&
    Number.isFinite(
      item
        .baselineMonthlyPrice
    )
  ) {
    return roundCurrency(
      clampNonNegative(
        item
          .baselineMonthlyPrice
      )
    );
  }

  return getSelectedMonthlyCost(
    item
  );
}

function getMonthlyUnitCount(
  item:
    SearchPouchItem
) {
  if (
    Number.isFinite(
      item.monthlyUnitCount
    ) &&
    item.monthlyUnitCount >
      0
  ) {
    return item
      .monthlyUnitCount;
  }

  return Math.max(
    0,
    item.unitsPerDay *
      30
  );
}

function getItemConfidence(
  item:
    SearchPouchItem
): SearchPouchCostConfidence {
  const selectedMonthlyCost =
    getSelectedMonthlyCost(
      item
    );

  if (
    !Number.isFinite(
      selectedMonthlyCost
    ) ||
    selectedMonthlyCost <=
      0
  ) {
    return "undetermined";
  }

  return "confirmed";
}

function buildContribution(
  item:
    SearchPouchItem
): SearchPouchCostContribution {
  const baselineMonthlyCost =
    getBaselineMonthlyCost(
      item
    );

  const selectedMonthlyCost =
    getSelectedMonthlyCost(
      item
    );

  return {
    pouchItemId:
      item.id,

    productName:
      item.productName,

    brand:
      item.brand,

    unitsPerDay:
      Math.max(
        0,
        item.unitsPerDay
      ),

    monthlyUnitCount:
      getMonthlyUnitCount(
        item
      ),

    baselineMonthlyCost,

    selectedMonthlyCost,

    quantityCostIncrease:
      roundCurrency(
        clampNonNegative(
          selectedMonthlyCost -
            baselineMonthlyCost
        )
      ),

    pricingSource:
      item.pricing
        ?.source ??
      "undetermined",

    confidence:
      getItemConfidence(
        item
      ),

    reason:
      item.pricing
        ?.reason,
  };
}

function getOverallConfidence(
  contributions:
    SearchPouchCostContribution[]
): SearchPouchCostConfidence {
  if (
    contributions.length ===
      0
  ) {
    return "confirmed";
  }

  const unresolvedCount =
    contributions.filter(
      (contribution) =>
        contribution.confidence ===
        "undetermined"
    ).length;

  if (
    unresolvedCount ===
      0
  ) {
    return "confirmed";
  }

  if (
    unresolvedCount ===
      contributions.length
  ) {
    return "undetermined";
  }

  return "partial";
}

function getUnresolvedItemCount(
  contributions:
    SearchPouchCostContribution[]
) {
  return contributions.filter(
    (contribution) =>
      contribution.confidence ===
      "undetermined"
  ).length;
}

function getSelectedProductCostTotal(
  contributions:
    SearchPouchCostContribution[]
) {
  return roundCurrency(
    contributions.reduce(
      (
        total,
        contribution
      ) =>
        total +
        contribution
          .selectedMonthlyCost,
      0
    )
  );
}

function buildPricingLines({
  planName,
  planMonthlyPrice,
  planOverageFee,
}: {
  planName:
    string;

  planMonthlyPrice:
    number;

  planOverageFee:
    number;
}): SearchPouchPooledPricingLine[] {
  return [
    {
      label:
        `${planName} Plan`,

      monthlyAmount:
        roundCurrency(
          planMonthlyPrice
        ),
    },

    {
      label:
        "Plan Overage",

      monthlyAmount:
        roundCurrency(
          planOverageFee
        ),
    },
  ];
}

function buildBaseResult({
  selectedPlan,
  itemCount,
  estimatedMonthlyProductCost,
  confidence,
  unresolvedItemCount,
  pricingVersionId,
  status,
  customerMessage,
}: {
  selectedPlan:
    SearchPlan;

  itemCount:
    number;

  estimatedMonthlyProductCost:
    number;

  confidence:
    SearchPouchCostConfidence;

  unresolvedItemCount:
    number;

  pricingVersionId:
    string | null;

  status:
    SearchPouchPooledPricing["status"];

  customerMessage:
    string;
}): SearchPouchPooledPricing {
  /*
   * SearchPlan is the canonical customer-facing
   * plan price. Database pricing configuration can
   * control allowances and overage rules, but a
   * stale database row must never override the price
   * displayed by VidaSearch.
   */
  const planMonthlyPrice =
    roundCurrency(
      selectedPlan.monthlyPrice
    );

  return {
    status,

    planKey:
      selectedPlan.id,

    planName:
      selectedPlan.name,

    planMonthlyPrice,

    itemCount,

    estimatedMonthlyProductCost,

    monthlyPriceAdjustment:
      0,

    planOverageFee:
      0,

    planOverageTooltip:
      PLAN_OVERAGE_TOOLTIP,

    totalMonthlyPrice:
      planMonthlyPrice,

    confidence,

    unresolvedItemCount,

    lines:
      buildPricingLines({
        planName:
          selectedPlan.name,

        planMonthlyPrice,

        planOverageFee:
          0,
      }),

    customerMessage,

    pricingVersionId,

    calculatedAt:
      new Date()
        .toISOString(),
  };
}

function buildDisabledResult({
  selectedPlan,
  itemCount,
  estimatedMonthlyProductCost,
  confidence,
  unresolvedItemCount,
  pricingVersionId,
}: {
  selectedPlan:
    SearchPlan;

  itemCount:
    number;

  estimatedMonthlyProductCost:
    number;

  confidence:
    SearchPouchCostConfidence;

  unresolvedItemCount:
    number;

  pricingVersionId:
    string | null;
}): SearchPouchPooledPricing {
  return buildBaseResult({
    selectedPlan,

    itemCount,

    estimatedMonthlyProductCost,

    confidence,

    unresolvedItemCount,

    pricingVersionId,

    status:
      "disabled",

    customerMessage:
      "",
  });
}

function buildUndeterminedResult({
  selectedPlan,
  itemCount,
  estimatedMonthlyProductCost,
  confidence,
  unresolvedItemCount,
  pricingVersionId,
}: {
  selectedPlan:
    SearchPlan;

  itemCount:
    number;

  estimatedMonthlyProductCost:
    number;

  confidence:
    SearchPouchCostConfidence;

  unresolvedItemCount:
    number;

  pricingVersionId:
    string | null;
}): SearchPouchPooledPricing {
  return buildBaseResult({
    selectedPlan,

    itemCount,

    estimatedMonthlyProductCost,

    confidence,

    unresolvedItemCount,

    pricingVersionId,

    status:
      "undetermined",

    customerMessage:
      "",
  });
}

export async function calculatePooledPouchPricing({
  selectedPlan,
  pouchItems,
}: CalculatePooledPouchPricingInput):
  Promise<SearchPouchPooledPricing> {
  const pricingConfig =
    await getVidaPouchPricingConfig();

  const configuredPlan =
    pricingConfig
      .plans
      .find(
        (plan) =>
          plan.planKey ===
            selectedPlan.id &&
          plan.active
      );

  const contributions =
    pouchItems.map(
      buildContribution
    );

  const itemCount =
    contributions.length;

  const confidence =
    getOverallConfidence(
      contributions
    );

  const unresolvedItemCount =
    getUnresolvedItemCount(
      contributions
    );

  const unbufferedProductCost =
    getSelectedProductCostTotal(
      contributions
    );

  const bufferedProductCost =
    roundCurrency(
      unbufferedProductCost *
        (
          1 +
          pricingConfig
            .settings
            .sourcingBufferRate
        )
    );

  const estimatedMonthlyProductCost =
    unbufferedProductCost;

  if (
    !configuredPlan
  ) {
    return buildUndeterminedResult({
      selectedPlan,

      itemCount,

      estimatedMonthlyProductCost,

      confidence,

      unresolvedItemCount:
        Math.max(
          1,
          unresolvedItemCount
        ),

      pricingVersionId:
        pricingConfig
          .pricingVersionId,
    });
  }

  if (
    itemCount >
    configuredPlan
      .supplementLimit
  ) {
    return buildUndeterminedResult({
      selectedPlan,

      itemCount,

      estimatedMonthlyProductCost,

      confidence,

      unresolvedItemCount,

      pricingVersionId:
        pricingConfig
          .pricingVersionId,
    });
  }

  if (
    !pricingConfig
      .settings
      .pooledPlanOveragesEnabled
  ) {
    return buildDisabledResult({
      selectedPlan,

      itemCount,

      estimatedMonthlyProductCost,

      confidence,

      unresolvedItemCount,

      pricingVersionId:
        pricingConfig
          .pricingVersionId,
    });
  }

  const pooledCostAllowance =
    configuredPlan
      .pooledCostAllowance;

  if (
    pooledCostAllowance ===
      null
  ) {
    return buildDisabledResult({
      selectedPlan,

      itemCount,

      estimatedMonthlyProductCost,

      confidence,

      unresolvedItemCount,

      pricingVersionId:
        pricingConfig
          .pricingVersionId,
    });
  }

  if (
    unresolvedItemCount >
      0 &&
    (
      pricingConfig
        .settings
        .uncertainPricingBehavior ===
        "confirm-before-checkout" ||
      pricingConfig
        .settings
        .uncertainPricingBehavior ===
        "block-selection"
    )
  ) {
    return buildUndeterminedResult({
      selectedPlan,

      itemCount,

      estimatedMonthlyProductCost,

      confidence,

      unresolvedItemCount,

      pricingVersionId:
        pricingConfig
          .pricingVersionId,
    });
  }

  const rawOverage =
    roundCurrency(
      clampNonNegative(
        bufferedProductCost -
          pooledCostAllowance
      )
    );

  /*
   * Customer-facing plan price comes from the
   * canonical SearchPlan configuration.
   */
  const configuredMonthlyPrice =
    roundCurrency(
      selectedPlan
        .monthlyPrice
    );

  if (
    rawOverage <=
      0
  ) {
    return {
      status:
        "included",

      planKey:
        selectedPlan.id,

      planName:
        selectedPlan.name,

      planMonthlyPrice:
        configuredMonthlyPrice,

      itemCount,

      estimatedMonthlyProductCost,

      monthlyPriceAdjustment:
        0,

      planOverageFee:
        0,

      planOverageTooltip:
        PLAN_OVERAGE_TOOLTIP,

      totalMonthlyPrice:
        configuredMonthlyPrice,

      confidence,

      unresolvedItemCount,

      lines:
        buildPricingLines({
          planName:
            selectedPlan.name,

          planMonthlyPrice:
            configuredMonthlyPrice,

          planOverageFee:
            0,
        }),

      customerMessage:
        "",

      pricingVersionId:
        pricingConfig
          .pricingVersionId,

      calculatedAt:
        new Date()
          .toISOString(),
    };
  }

  const marginRate =
    Math.min(
      0.95,
      Math.max(
        0,
        pricingConfig
          .settings
          .overageMarginRate
      )
    );

  const unroundedPlanOverage =
    rawOverage /
    (
      1 -
      marginRate
    );

  const planOverageFee =
    roundToIncrement({
      value:
        unroundedPlanOverage,

      increment:
        pricingConfig
          .settings
          .overageRoundingIncrement,
    });

  const totalMonthlyPrice =
    roundCurrency(
      configuredMonthlyPrice +
        planOverageFee
    );

  return {
    status:
      "adjustment",

    planKey:
      selectedPlan.id,

    planName:
      selectedPlan.name,

    planMonthlyPrice:
      configuredMonthlyPrice,

    itemCount,

    estimatedMonthlyProductCost,

    monthlyPriceAdjustment:
      planOverageFee,

    planOverageFee,

    planOverageTooltip:
      PLAN_OVERAGE_TOOLTIP,

    totalMonthlyPrice,

    confidence,

    unresolvedItemCount,

    lines:
      buildPricingLines({
        planName:
          selectedPlan.name,

        planMonthlyPrice:
          configuredMonthlyPrice,

        planOverageFee,
      }),

    customerMessage:
      "",

    pricingVersionId:
      pricingConfig
        .pricingVersionId,

    calculatedAt:
      new Date()
        .toISOString(),
  };
}
