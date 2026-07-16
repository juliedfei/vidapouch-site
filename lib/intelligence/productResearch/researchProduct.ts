import type {
  ProductResearch,
 } from "./productResearchTypes";
 
 import {
  researchOfficialWebsite,
 } from "./researchers/researchOfficialWebsite";
 
 import {
  researchVendorListings,
 } from "./researchers/researchVendorListings";
 
 import {
  researchReviews,
 } from "./researchers/researchReviews";
 
 import {
  researchCertifications,
 } from "./researchers/researchCertifications";
 
 import {
  researchScientificEvidence,
 } from "./researchers/researchScientificEvidence";
 
 import {
  mergeResearch,
 } from "./researchers/mergeResearch";

 import { extractProductResearch } from "./extractProductResearch";

 
 /*
 * Research one product.
 *
 * Product =
 * Brand + Supplement
 *
 * Example:
 * NOW Vitamin C 1000 mg Capsules
 *
 * This orchestrates every research provider.
 * Individual researchers are intentionally
 * kept small and focused.
 */
 export async function researchProduct(
  productName: string
 ): Promise<ProductResearch> {
 
  console.log(
    "Researching product:",
    productName
  );
 
  /*
   * Run every researcher in parallel.
   *
   * Over time these may use:
   *
   * • Official manufacturer websites
   * • Google / SerpAPI
   * • Amazon
   * • iHerb
   * • Walmart
   * • Target
   * • NIH
   * • USP
   * • NSF
   * • ConsumerLab
   * • additional APIs
   */
  const [
 
    officialWebsite,
 
    vendorListings,
 
    reviews,
 
    certifications,
 
    scientificEvidence,
 
  ] = await Promise.all([
 
    researchOfficialWebsite(
      productName
    ),
 
    researchVendorListings(
      productName
    ),
 
    researchReviews(
      productName
    ),
 
    researchCertifications(
      productName
    ),
 
    researchScientificEvidence(
      productName
    ),
 
  ]);
 


/*
* Temporary:
* Continue using mergeResearch until
* the new AI extraction pipeline is
* implemented.
*/
return mergeResearch({

  productName,
 
  officialWebsite,
 
  vendorListings,
 
  reviews,
 
  certifications,
 
  scientificEvidence,
 
 });
 
 /*
 * Future:
 *
 * return extractProductResearch({
 *   productName,
 *   sources,
 * });
 */




 
 }