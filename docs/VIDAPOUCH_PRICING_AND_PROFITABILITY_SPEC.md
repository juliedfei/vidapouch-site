# VidaPouch Pricing and Profitability Specification

## Purpose

This document defines how VidaPouch plan pricing, pooled supplement-cost allowances, premium-product overages, higher-quantity overages, and database configuration should work.

The goals are to keep every plan profitable, base overages on real costs rather than arbitrary thresholds, explain charges clearly without exposing internal margins, and make pricing rules configurable through Supabase.

## Current Plan Prices

| Plan | Monthly Price | Supplement Limit |
|---|---:|---:|
| Essential | $59.99 | Up to 3 |
| Complete | $79.99 | Up to 5 |
| Premier | $99.99 | Up to 8 |

## Known Break-Even Benchmarks

| Fulfillment Scenario | Break-Even Price |
|---|---:|
| Single-box setup | $45.48 |
| Dual-box setup | $54.43 |

Before final allowances are activated, confirm whether these break-even figures already include supplements, pouches, packaging, labor, payment fees, shipping, spoilage, replacements, customer service, and promotions.

## Current Headroom

Essential versus single-box benchmark:

```text
$59.99 - $45.48 = $14.51
```

Complete versus dual-box benchmark:

```text
$79.99 - $54.43 = $25.56
```

Premier versus dual-box benchmark:

```text
$99.99 - $54.43 = $45.56
```

These amounts are not automatically the plan allowances. They are only total economic headroom before reserving profit, payment fees, risk, and any costs omitted from the break-even figures.

## Critical Break-Even Distinction

### If break-even already includes a reference supplement basket

Separate the figure into:

```text
Break-even
=
fixed non-supplement cost
+
reference supplement cost
```

The pricing engine should use the fixed non-supplement cost separately from the plan's supplement-cost allowance.

### If break-even excludes supplements

The plan must cover:

```text
non-supplement break-even cost
+
pooled supplement-cost allowance
+
risk reserve
+
target profit
```

In that case, a large allowance can eliminate profitability.

## Recommended Pricing Model

VidaPouch should use a pooled plan-level supplement-cost allowance, not a hard allowance per supplement.

Example:

```text
Product 1: $18
Product 2:  $2
Product 3:  $4
Total:     $24
```

A per-product rule could penalize Product 1 even though the total routine is acceptable. A pooled allowance evaluates the complete basket.

```text
Combined buffered monthly supplement cost
=
sum of the buffered monthly cost of every selected product
```

```text
Raw cost overage
=
max(
  0,
  combined buffered monthly supplement cost
  - selected plan pooled allowance
)
```

The plan allowance is internal and database-configurable. It is not shown to customers.

## How Plan Allowances Must Be Determined

For each plan:

```text
Maximum safe pooled allowance
=
plan price
- fixed non-supplement monthly cost
- target profit dollars
- risk reserve
- unrecovered transaction or shipping costs
```

A margin-based version is:

```text
Target profit dollars
=
plan price × target contribution margin
```

Therefore:

```text
Maximum safe pooled allowance
=
plan price
- fixed non-supplement monthly cost
- (plan price × target contribution margin)
- risk reserve
- other unrecovered costs
```

Do not activate final allowances until the break-even model is separated into fixed costs, supplement costs, variable fulfillment costs, target profit, and contingency reserve.

## Product Cost Basis

Recommended default:

```text
Unbuffered monthly product cost
=
median monthly cost of qualified exact listings
```

The median is less distorted by unusually high or low listings.

```text
Buffered monthly product cost
=
unbuffered monthly product cost
×
(1 + sourcing buffer rate)
```

Recommended initial configurable sourcing buffer:

```text
10%
```

Example:

```text
Median exact-listing monthly cost: $8.25
Sourcing buffer:                     10%
Buffered internal cost:             $9.08
```

The $9.08 contributes to the pooled basket total. It does not automatically trigger an item-level charge.

## Higher Daily Quantities

Higher quantities increase the product's monthly internal cost and are evaluated inside the same pooled allowance.

Example:

```text
1 capsule daily:  $6.00 per month
2 capsules daily: $12.00 per month
```

The basket uses $12.00 for that item. A separate surcharge is not automatically added. An overage applies only when the total adjusted basket cost exceeds the plan allowance.

## Customer Overage Charge

A pure pass-through overage is:

```text
Customer overage = raw cost overage
```

A margin-preserving overage is preferable:

```text
Customer overage
=
raw cost overage
÷
(1 - overage gross-margin target)
```

Example:

```text
Raw cost overage:             $4.00
Overage gross-margin target:     25%
Customer overage:             $5.33
```

The overage margin and rounding increment should be database-configurable.

## Customer-Facing Explanation

Do not disclose:

- internal pooled allowance;
- sourcing buffer;
- product cost estimates;
- target margin;
- break-even calculations.

Recommended language:

> This selection includes a premium product cost adjustment.

> Your selected daily quantity increases the monthly product requirement.

> Your selected products and quantities exceed what is included in this plan. The additional monthly charge is shown before checkout.

The interface may identify products as Premium product, Higher monthly quantity, or Included in plan, but the final charge must be calculated against the pooled basket total.

## Database Configuration

### Plan table

```sql
create table public.vidapouch_plans (
  id text primary key,
  name text not null,
  monthly_price numeric(10, 2) not null,
  supplement_limit integer not null,
  pooled_cost_allowance numeric(10, 2),
  fulfillment_scenario text not null,
  is_active boolean not null default true,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Do not insert final pooled allowances until the break-even model is decomposed.

```sql
insert into public.vidapouch_plans (
  id,
  name,
  monthly_price,
  supplement_limit,
  pooled_cost_allowance,
  fulfillment_scenario,
  display_order
)
values
  ('essential', 'Essential', 59.99, 3, null, 'single-box', 1),
  ('complete', 'Complete', 79.99, 5, null, 'dual-box', 2),
  ('premier', 'Premier', 99.99, 8, null, 'dual-box', 3);
```

### Global pricing settings table

```sql
create table public.vidapouch_pricing_settings (
  setting_key text primary key,
  numeric_value numeric,
  text_value text,
  boolean_value boolean,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Suggested settings:

```sql
insert into public.vidapouch_pricing_settings (
  setting_key,
  numeric_value,
  text_value,
  boolean_value,
  description
)
values
  ('sourcing_buffer_rate', 0.10, null, null,
   'Buffer applied to listing-derived monthly product cost'),
  ('minimum_qualified_listing_count', 2, null, null,
   'Minimum exact listings required for confirmed pricing'),
  ('overage_margin_rate', 0.25, null, null,
   'Target gross margin applied to pooled cost overages'),
  ('overage_rounding_increment', 0.01, null, null,
   'Increment used to round the final monthly overage'),
  ('retail_cost_basis_method', null, 'median-exact-listings', null,
   'Method used to calculate listing-derived monthly product cost'),
  ('pooled_plan_overages_enabled', null, null, true,
   'Enables pooled plan-level supplement cost allowances');
```

## Application Calculation Flow

1. Load active plans and pricing settings from Supabase.
2. Cache the configuration server-side.
3. Collect qualified exact listings for each product.
4. Calculate the median monthly product cost.
5. Apply the sourcing buffer.
6. Adjust cost for the selected daily quantity.
7. Sum adjusted costs for all pouch items.
8. Compare the basket total with the selected plan's pooled allowance.
9. Calculate the raw overage.
10. Apply the overage margin.
11. Apply the rounding increment.
12. Show one combined monthly product adjustment.
13. Save a pricing snapshot at checkout.

## Pricing Snapshot Requirement

Save:

- plan price;
- plan allowance;
- selected products;
- selected quantities;
- buffered product costs;
- sourcing buffer;
- raw pooled overage;
- overage margin;
- final overage;
- final monthly total;
- calculation timestamp;
- pricing configuration version.

This prevents future database changes from rewriting an existing order.

## Existing Subscriber Protection

Future pricing should support:

- configuration version;
- effective start and end dates;
- grandfathered plan price;
- grandfathered allowance;
- recalculation only when products or quantities change;
- explicit renewal rules.

## Architecture Correction

The current item-level add-on architecture should be revised.

### Product level

Store:

- baseline monthly cost;
- adjusted monthly cost;
- pricing source;
- cost-basis method;
- sourcing buffer;
- quantity increase flag;
- likely premium-cost contributor flag.

### Pouch level

Calculate:

- total buffered basket cost;
- selected plan pooled allowance;
- raw pooled overage;
- customer-facing overage;
- estimated monthly total.

The final add-on is calculated once at the pouch level.

## Immediate Next Steps

1. Confirm exactly what is included in the $45.48 and $54.43 break-even figures.
2. Separate fixed cost from supplement cost.
3. Choose a target contribution margin.
4. Choose an operating-risk reserve.
5. Calculate the maximum safe pooled allowance for each plan.
6. Create the Supabase tables.
7. replace item-level add-ons with pooled pouch-level pricing.
8. Save pricing snapshots at checkout.
9. Add a manager dashboard later.

## Items That Must Not Be Hard-Coded

- plan prices;
- supplement limits;
- pooled allowances;
- fulfillment scenario;
- sourcing buffer;
- cost-basis method;
- minimum listing count;
- overage margin;
- rounding increment;
- risk reserve;
- shipping rule;
- feature flags;
- effective dates;
- configuration version.

## Final Principle

> The plan absorbs the combined cost of the selected routine up to a confidential, profitability-based plan allowance. When the adjusted basket cost exceeds that allowance, the customer pays a clearly disclosed monthly product adjustment that preserves VidaPouch's target economics.

The allowance remains internal. The customer sees the plan price, selected products, quantities, and any resulting adjustment before checkout.
