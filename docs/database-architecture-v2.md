# VidaPouch Database Architecture — Version 2

## Purpose

This document defines the long-term architecture for the VidaPouch data platform.

The goal is to build a knowledge system that is:

- Intelligent
- Explainable
- Continuously improving
- Easy to maintain
- Fast enough for real-time recommendations

The PostgreSQL database is the permanent source of truth.

External searches, AI research, retailer data, and APIs are discovery mechanisms—not the production database itself.

---

# Vision

VidaPouch should know:

- Every major supplement brand
- Every important supplement ingredient
- Every retail product
- Every retailer selling that product
- Product-specific reviews
- Current and historical prices
- Certifications
- Scientific evidence
- AI-generated product quality scores

The recommendation engine should explain **why** every recommendation was made.

---

# Guiding Principles

## 1. Database First

Recommendations should come primarily from our database.

The AI should use live searches only to discover new information or verify existing information.

---

## 2. Product Reviews Belong to Products

A brand does not have one universal review score.

Example:

NOW Magnesium Glycinate
★★★★★ 4.8

NOW Vitamin C
★★★★☆ 4.2

These are different products and must be scored independently.

---

## 3. Brand Reputation Is Separate

Brand information includes things like:

- Manufacturing reputation
- Practitioner grade
- Third-party testing
- cGMP compliance
- Certifications
- Regulatory history

This information changes slowly.

---

## 4. Dynamic Data Is Time-Based

Some information changes frequently:

- Prices
- Inventory
- Reviews
- Product availability

These should be refreshed automatically.

---

## 5. Everything Must Be Explainable

Every recommendation should be traceable.

Example:

"We recommended this product because:

• High-quality manufacturer
• Strong third-party testing
• Excellent customer reviews
• Lowest monthly cost
• Correct dosage"

---

# Core Data Model

The long-term database consists of the following major entities.

## Brand

Represents the company customers recognize.

Examples:

- Nature Made
- NOW
- Thorne
- Pure Encapsulations

Stores:

- manufacturer
- website
- practitioner grade
- cGMP
- quality metadata
- aliases

---

## Manufacturer

Represents the actual company behind one or more brands.

Examples:

- Pharmavite
- NOW Health Group
- Nestlé Health Science

---

## Supplement

Represents the ingredient.

Examples:

- Vitamin D3
- Magnesium Glycinate
- Fish Oil
- Creatine
- Vitamin C

---

## Product

Represents one specific bottle or formulation.

Example:

NOW Magnesium Glycinate

200 mg

180 capsules

This exists independently of any retailer.

---

## Retailer

Represents the seller.

Examples:

- Amazon
- Costco
- Walmart
- CVS
- Walgreens
- iHerb

---

## Retail Listing

Represents one retailer selling one product.

Example:

Amazon

NOW Magnesium Glycinate

$19.99

4.8 stars

12,483 reviews

---

# Data Relationships

Brand

↓

Product

↓

Product Ingredient

↓

Supplement

↓

Retail Listing

↓

Retailer

↓

Price History

↓

Review History

↓

AI Product Score

↓

Customer Recommendation

---

# Knowledge Refresh Strategy

The application should **not** perform broad Google searches every time it starts.

Instead:

1. PostgreSQL stores trusted information.
2. Background jobs search for updates.
3. Newly discovered information is reviewed.
4. High-confidence information updates the database.
5. Product scores are recalculated automatically.

---

# Future Architecture

The long-term system will eventually include:

- Product certifications
- Scientific evidence
- Review summaries
- AI quality scores
- Price history
- Discovery engine
- Recommendation engine
- Knowledge refresh engine
- Inventory management
- Pharmacy support
- Fulfillment

---

# Current Development Roadmap

## Phase 1

✔ PostgreSQL

✔ Prisma

✔ Brand

✔ Brand Alias

⬜ Manufacturer

⬜ Supplement

⬜ Supplement Alias

⬜ Product

⬜ Product Ingredient

⬜ Retailer

⬜ Retail Listing

---

## Phase 2

- Review history
- Price history
- Certifications
- Evidence

---

## Phase 3

- AI scoring
- Recommendation engine
- Knowledge refresh jobs

---

## Phase 4

- Inventory
- Ordering
- Fulfillment
- Subscription optimization

---

# Design Philosophy

The database is not simply a storage system.

It is VidaPouch's knowledge base.

Every recommendation made by the AI should become faster, smarter, more accurate, and more explainable because of the information stored here.

This architecture is designed so VidaPouch can continuously learn while maintaining a trusted, curated database instead of relying entirely on live web searches.
