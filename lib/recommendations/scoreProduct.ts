import type { RetailProduct } from "../pricing/types";

import type { ProductScore } from "./recommendationTypes";

import { DEFAULT_RECOMMENDATION_WEIGHTS } from "./recommendationCriteria";

import { getBrandProfile } from "./brandProfiles";

export function scoreProduct(
 product: RetailProduct
): ProductScore {
 const brand =
   getBrandProfile(product.brand);

 /*
  * Quality
  */

 let quality = 5;

 if (
   brand.profile?.thirdPartyTesting
     .value
 ) {
   quality += 2;
 }

 if (
   brand.profile?.cGmpCompliant
     .value
 ) {
   quality += 2;
 }

 if (
   brand.profile?.practitionerGrade
     .value
 ) {
   quality += 1;
 }

 quality = Math.min(
   quality,
   10
 );

 /*
  * Reviews
  *
  * Placeholder until
  * retailer APIs are connected.
  */

 const reviews = 8;

 /*
  * Value
  */

 let value = 6;

 switch (
   brand.profile?.priceTier
 ) {
   case "budget":
     value = 10;
     break;

   case "value":
     value = 9;
     break;

   case "premium":
     value = 7;
     break;

   case "professional":
     value = 5;
     break;
 }

 /*
  * Evidence
  */

 let evidence = 6;

 if (
   brand.profile?.thirdPartyTesting
     .value
 ) {
   evidence += 2;
 }

 if (
   brand.profile
     ?.certifications.length
 ) {
   evidence += 2;
 }

 evidence = Math.min(
   evidence,
   10
 );

 /*
  * Availability
  */

 let availability = 5;

 switch (
   brand.profile?.availability
 ) {
   case "national":
     availability = 10;
     break;

   case "moderate":
     availability = 7;
     break;

   case "limited":
     availability = 5;
     break;
 }

 const weights =
   DEFAULT_RECOMMENDATION_WEIGHTS;

 const overall =
   (
     quality *
       weights.quality +
     reviews *
       weights.reviews +
     value *
       weights.value +
     evidence *
       weights.evidence +
     availability *
       weights.availability
   ) / 100;

 return {
   quality,

   reviews,

   value,

   evidence,

   availability,

   overall:
     Math.round(
       overall * 10
     ) / 10,
 };
}
