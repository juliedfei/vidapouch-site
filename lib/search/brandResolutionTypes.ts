import type {
    CandidateReviewStatus,
    DataConfidence,
   } from "@/lib/generated/prisma/client";
   
   export type BrandResolutionSource =
    | "requested-brand"
    | "database-canonical"
    | "database-alias"
    | "deterministic-parser"
    | "openai"
    | "unknown";
   
   export type BrandResolutionStatus =
    | "resolved"
    | "needs-review"
    | "unknown";
   
   export type BrandResolution = {
    canonicalBrandId:
      string | null;
   
    canonicalName:
      string;
   
    observedAlias:
      string | null;
   
    normalizedObservedAlias:
      string | null;
   
    source:
      BrandResolutionSource;
   
    status:
      BrandResolutionStatus;
   
    confidence:
      number | null;
   
    dataConfidence:
      DataConfidence;
   
    reviewStatus:
      CandidateReviewStatus | null;
   
    shouldPersistAlias:
      boolean;
   
    shouldCreateDiscoveryCandidate:
      boolean;
   };
   
   export type ResolveProductBrandInput = {
    productTitle:
      string;
   
    requestedBrand?:
      string;
   
    retailer?:
      string;
   
    shoppingProductId?:
      string;
   
    allowOpenAi?:
      boolean;
   };
   
   export type DatabaseBrandMatch = {
    brandId:
      string;
   
    canonicalName:
      string;
   
    matchedValue:
      string;
   
    normalizedMatchedValue:
      string;
   
    matchType:
      "canonical" | "alias";
   
    confidence:
      DataConfidence;
   };
   
   export type ParsedBrandCandidate = {
    candidate:
      string | null;
   
    normalizedCandidate:
      string | null;
   
    confidence:
      number;
   
    reason:
      string;
   };
   
   export type OpenAiBrandResolution = {
    canonicalBrand:
      string | null;
   
    observedAlias:
      string | null;
   
    existingBrandLikely:
      boolean;
   
    identifiable:
      boolean;
   
    confidence:
      number;
   
    reason:
      string | null;
   };
   
   export type BrandDiscoveryCandidatePayload = {
    productTitle:
      string;
   
    retailer:
      string | null;
   
    shoppingProductId:
      string | null;
   
    parsedCandidate:
      string | null;
   
    canonicalBrand:
      string | null;
   
    observedAlias:
      string | null;
   
    confidence:
      number | null;
   
    source:
      BrandResolutionSource;
   
    reason:
      string | null;
   };
   