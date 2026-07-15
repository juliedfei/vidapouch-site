import { getAllProducts } from "./repository";

import type {
 CatalogProduct,
 CatalogProductFilters,
} from "./types";

function normalize(value: string) {
 return value
   .toLowerCase()
   .replace(/['’]/g, "")
   .replace(/[^a-z0-9]+/g, " ")
   .trim();
}

function productMatchesFilters(
 product: CatalogProduct,
 filters: CatalogProductFilters
) {
 if (
   filters.supplementName &&
   !product.ingredients.some(
     (ingredient) =>
       normalize(
         ingredient.canonicalName
       ).includes(
         normalize(
           filters.supplementName!
         )
       )
   )
 ) {
   return false;
 }

 if (
   filters.brandName &&
   !normalize(
     product.brand.canonicalName
   ).includes(
     normalize(filters.brandName)
   )
 ) {
   return false;
 }

 if (
   filters.form &&
   product.form !== filters.form
 ) {
   return false;
 }

 if (
   filters.practitionerGradeOnly &&
   product.brand.practitionerGrade !==
     true
 ) {
   return false;
 }

 if (
   filters.thirdPartyTestedOnly &&
   product.brand
     .thirdPartyTestingProgram !== true
 ) {
   return false;
 }

 if (
   filters.cgmpCertifiedOnly &&
   product.brand.cgmpCertified !== true
 ) {
   return false;
 }

 if (
   filters.veganOnly &&
   product.brand.veganOptions !== true
 ) {
   return false;
 }

 if (
   filters.hypoallergenicOnly &&
   product.brand.hypoallergenic !== true
 ) {
   return false;
 }

 if (
   filters.inStockOnly &&
   !product.listings.some(
     (listing) =>
       listing.inStock === true
   )
 ) {
   return false;
 }

 if (
   filters.maximumBottlePrice != null &&
   !product.listings.some(
     (listing) =>
       listing.bottlePrice != null &&
       listing.bottlePrice <=
         filters.maximumBottlePrice!
   )
 ) {
   return false;
 }

 if (
   filters.minimumAverageRating != null &&
   !product.listings.some(
     (listing) =>
       listing.averageRating != null &&
       listing.averageRating >=
         filters.minimumAverageRating!
   )
 ) {
   return false;
 }

 if (
   filters.minimumReviewCount != null &&
   !product.listings.some(
     (listing) =>
       listing.reviewCount != null &&
       listing.reviewCount >=
         filters.minimumReviewCount!
   )
 ) {
   return false;
 }

 return true;
}

export async function findCatalogProducts(
 filters: CatalogProductFilters = {}
): Promise<CatalogProduct[]> {
 const products =
   await getAllProducts();

 return products.filter((product) =>
   productMatchesFilters(
     product,
     filters
   )
 );
}

export async function findCatalogProductById(
 productId: string
): Promise<CatalogProduct | null> {
 const products =
   await getAllProducts();

 return (
   products.find(
     (product) =>
       product.id === productId
   ) ?? null
 );
}

export async function findProductsBySupplement(
 supplementName: string
): Promise<CatalogProduct[]> {
 return findCatalogProducts({
   supplementName,
 });
}