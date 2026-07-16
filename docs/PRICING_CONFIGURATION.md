# VidaPouch Pricing Configuration Guide

## Overview

VidaPouch pricing is controlled by the `PricingStrategy` table in the VidaPouch PostgreSQL database.

The PostgreSQL database is hosted and managed through Supabase.

The system works like this:

```text
VidaPouch application
       ↓
Prisma
       ↓
PostgreSQL database
       ↓
Supabase
```

- **Supabase** hosts the PostgreSQL database and provides the dashboard used to view and edit its data.
- **PostgreSQL** is the type of SQL database being used.
- **Prisma** is the code layer that allows the VidaPouch application to read and write PostgreSQL data.

Pricing values should be changed through the Supabase database dashboard until a VidaPouch Manager Portal is built.

---

# How to Open the VidaPouch Database

## Step 1: Open Supabase

Go to:

https://supabase.com/dashboard

## Step 2: Sign In

Sign in using the account associated with the VidaPouch Supabase project.

## Step 3: Open the VidaPouch Project

From the Supabase dashboard, click the project used by the VidaPouch website.

## Step 4: Open the Table Editor

In the navigation menu on the left side, click:

```text
Table Editor
```

The Table Editor lets you view and edit rows in the PostgreSQL database without writing SQL commands.

## Step 5: Find the Pricing Strategy Table

Look for the table named:

```text
PricingStrategy
```

Depending on how Supabase displays Prisma table names, it may appear with the exact capitalization shown above.

Click the table to open it.

---

# What to Do If the PricingStrategy Table Is Empty

The Prisma migration created the table, but it may not have created a pricing strategy row.

If the table contains no rows, click:

```text
Insert
```

or:

```text
Insert row
```

Then enter the pricing settings described below.

Only one pricing strategy row should normally have:

```text
active = true
```

The VidaPouch application loads the most recently updated active row.

---

# PricingStrategy Fields

## active

Controls whether this pricing strategy can be used.

Recommended value:

```text
true
```

At least one row must have `active` set to `true`.

---

## morningConciergeFee

The full concierge fee for a morning-only pouch plan.

Example:

```text
69.99
```

---

## eveningConciergeFee

The full concierge fee for an evening-only pouch plan.

Example:

```text
69.99
```

---

## dualConciergeFee

The full concierge fee for a plan containing both morning and evening pouches.

Example:

```text
89.99
```

---

## serviceAllocationMode

Controls how much of the concierge fee is moved into the displayed supplement prices.

The accepted values are:

```text
transparent
fixed
percentage
fully_bundled
```

The value must be entered exactly as shown, using lowercase letters and the underscore in `fully_bundled`.

---

# Allocation Mode: transparent

Use:

```text
serviceAllocationMode = transparent
```

This moves none of the concierge fee into supplement prices.

Example:

```text
Vitamin C:             $2.47
VidaPouch Concierge:  $69.99
Total:                 $72.46
```

For this mode, these fields are ignored:

```text
fixedServiceAllocation
serviceAllocationPercent
```

They can remain set to zero.

---

# Allocation Mode: fixed

Use:

```text
serviceAllocationMode = fixed
```

Then enter the total dollar amount to move from the concierge fee into the supplement prices using:

```text
fixedServiceAllocation
```

Example:

```text
fixedServiceAllocation = 30.00
```

If the customer has one supplement:

```text
Base Vitamin C price:   $2.47
Allocated concierge:   $30.00
Displayed Vitamin C:   $32.47
Visible concierge:     $39.99
Total:                 $72.46
```

If the customer has three supplements, the $30 allocation is divided evenly:

```text
Vitamin D:    +$10.00
Magnesium:    +$10.00
Omega-3:      +$10.00
```

The total amount moved into the supplements remains exactly $30.

Any leftover cents are distributed automatically so the checkout total remains accurate.

---

# Allocation Mode: percentage

Use:

```text
serviceAllocationMode = percentage
```

Then enter the percentage of the concierge fee to move into supplement pricing using:

```text
serviceAllocationPercent
```

Percentages are entered as decimals.

Examples:

```text
0.25 = 25%
0.40 = 40%
0.50 = 50%
0.75 = 75%
1.00 = 100%
```

Example using a $69.99 concierge fee:

```text
serviceAllocationPercent = 0.50
```

Approximately $35 of the concierge fee would be distributed evenly across the supplements, and the visible concierge fee would be approximately $35.

---

# Allocation Mode: fully_bundled

Use:

```text
serviceAllocationMode = fully_bundled
```

This moves the entire concierge fee into the supplement prices.

Example:

```text
Displayed supplements: $72.46
Visible concierge fee:  $0.00
Total:                  $72.46
```

The customer still pays the same total. Only the presentation changes.

---

# fixedServiceAllocation

This field is used only when:

```text
serviceAllocationMode = fixed
```

Example:

```text
30.00
```

This means that $30 of the concierge fee is divided evenly across all active supplements in the order.

Do not enter a percentage in this field.

---

# serviceAllocationPercent

This field is used only when:

```text
serviceAllocationMode = percentage
```

Enter the value as a decimal.

Example:

```text
0.50
```

means:

```text
50%
```

Do not enter `50`, because that would represent 5,000%.

---

# inventoryBufferPercent

This is the safety buffer added to the internal monthly supplement cost.

It protects VidaPouch against:

- Vendor price fluctuations
- A previously inexpensive vendor becoming unavailable
- Shipping changes
- Sourcing uncertainty
- Small differences between estimated and actual purchasing costs

Enter the value as a decimal.

Examples:

```text
0.05 = 5%
0.10 = 10%
0.15 = 15%
```

Example:

```text
Internal monthly supplement cost: $10.00
Inventory buffer:                  10%
Buffer amount:                     $1.00
```

The base customer price becomes at least:

```text
$11.00
```

before any supplement margin or concierge allocation is added.

---

# supplementMarginPercent

This applies an additional margin to the internal monthly supplement cost.

Enter the value as a decimal.

Examples:

```text
0.00 = 0%
0.10 = 10%
0.15 = 15%
0.25 = 25%
```

Example:

```text
Internal monthly supplement cost: $10.00
Supplement margin:                 15%
Margin amount:                     $1.50
```

This margin is separate from the inventory buffer and the concierge allocation.

---

# Recommended Starting Configuration

A reasonable initial configuration is:

```text
active = true

morningConciergeFee = 69.99

eveningConciergeFee = 69.99

dualConciergeFee = 89.99

serviceAllocationMode = fixed

fixedServiceAllocation = 30.00

serviceAllocationPercent = 0.00

inventoryBufferPercent = 0.10

supplementMarginPercent = 0.00
```

This configuration:

- Keeps the VidaPouch concierge service visible
- Moves $30 of the service fee into supplement pricing
- Adds a 10% protection buffer for sourcing changes
- Does not add a separate supplement profit margin yet

For a one-supplement morning plan with a $2.47 base supplement price, the customer would see approximately:

```text
Vitamin:                $32.47
VidaPouch Concierge:    $39.99
Total:                  $72.46
```

The total remains the same as it would under transparent pricing.

---

# How Concierge Allocation Is Distributed

The configured concierge allocation is distributed evenly across every active supplement in both pouches.

Example:

```text
Hidden concierge amount: $30
Active supplements:        3
```

Each supplement receives:

```text
$10
```

For seven supplements, VidaPouch calculates the allocation in cents and distributes leftover cents across the first supplements.

This prevents rounding from accidentally increasing or decreasing the total order price.

---

# Current Pricing Flow

VidaPouch calculates prices in this order:

```text
Vendor bottle price
       +
Estimated shipping
       ↓
Landed bottle cost
       ↓
Cost per capsule
       ↓
Monthly internal supplement cost
       ↓
Inventory buffer
       ↓
Supplement margin
       ↓
Base customer supplement price
       ↓
Equal share of allocated concierge fee
       ↓
Displayed supplement price
```

The visible concierge fee is calculated as:

```text
Full concierge fee
       -
Amount distributed into supplement prices
       =
Visible concierge fee
```

The customer total should remain unchanged when only the allocation mode changes.

---

# Information the Customer Sees

The customer may see:

- Selected supplement
- Selected brand
- Monthly supplement price
- Visible VidaPouch concierge fee
- Total monthly price

The customer should not see:

- Vendor or retailer used by VidaPouch
- Internal bottle cost
- Internal cost per capsule
- Internal monthly sourcing cost
- Gross margin
- Procurement alternatives
- Internal pricing audit data

---

# Information Reserved for the Future Manager Portal

The future VidaPouch Manager Portal may show:

- Selected product
- Recommended vendor
- Other available vendors
- Bottle price by vendor
- Shipping by vendor
- Landed bottle cost
- Internal monthly cost
- Base customer supplement price
- Concierge allocation assigned to each supplement
- Final displayed supplement price
- Gross margin
- Price history
- Stock availability

This will allow VidaPouch to choose the best vendor without exposing procurement information to customers.

---

# How to Save a Pricing Change in Supabase

After editing a row:

1. Confirm that `active` is set to `true`.
2. Confirm that the allocation mode is spelled exactly correctly.
3. Confirm that percentages are entered as decimals.
4. Save the row using the Supabase save button.
5. Refresh the VidaPouch checkout and create a new checkout calculation.

Because the pricing strategy is loaded from the database during checkout, a new application deployment should not normally be required.

---

# Troubleshooting

## The full concierge fee still appears

Check:

```text
serviceAllocationMode
```

If it is:

```text
transparent
```

then the full concierge fee is expected to remain visible.

For a fixed $30 allocation, use:

```text
serviceAllocationMode = fixed
fixedServiceAllocation = 30.00
```

---

## Nothing changes after editing the database

Check that:

```text
active = true
```

Also confirm that the row was saved successfully.

Then create a new checkout calculation or refresh the checkout page.

If multiple rows are active, VidaPouch uses the active row with the most recent `updatedAt` value.

---

## The displayed supplement price increased, but the concierge fee did not decrease

That would indicate that the checkout allocation logic is not being applied consistently.

The intended behavior is:

```text
Supplement prices increase
by the hidden allocation

and

Visible concierge fee decreases
by the same total amount
```

The total due should remain unchanged.

---

## A percentage produced an unexpectedly large number

Confirm the percentage was entered as a decimal.

Correct:

```text
0.50
```

Incorrect:

```text
50
```

---

## The PricingStrategy table does not appear

Confirm that the Prisma migration was run successfully.

From the VidaPouch project folder, the migration command used was:

```bash
npx prisma migrate dev --name add_pricing_strategy
```

The production database must also receive the applicable migration when deploying.

---

# Important Terminology

## Supabase

Supabase is the platform hosting and managing the VidaPouch PostgreSQL database.

## PostgreSQL

PostgreSQL is the SQL database technology used by VidaPouch.

## Prisma

Prisma is the application code layer that reads and writes the PostgreSQL database.

## PricingStrategy

`PricingStrategy` is the PostgreSQL table containing the configurable VidaPouch pricing rules.

These are related parts of one system, not separate competing databases.