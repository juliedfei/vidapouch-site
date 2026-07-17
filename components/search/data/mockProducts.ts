import type { ProductOption } from
 "@/lib/recommendations/productOption";

export const mockProducts: ProductOption[] = [
 {
   productName: "Magnesium Glycinate",
   brand: "Thorne",

   representativeProduct: {
     retailer: "Amazon",
     brand: "Thorne",
     supplement: "Magnesium Glycinate",
     dosage: "200 mg",
     bottlePrice: 22.49,
     capsulesPerBottle: 90,
     servingSize: 2,
     url: "",
   },

   listings: [
     {
       retailer: "Amazon",
       brand: "Thorne",
       supplement: "Magnesium Glycinate",
       dosage: "200 mg",
       bottlePrice: 22.49,
       capsulesPerBottle: 90,
       servingSize: 2,
       url: "",
     },
     {
       retailer: "Walmart",
       brand: "Thorne",
       supplement: "Magnesium Glycinate",
       dosage: "200 mg",
       bottlePrice: 21.98,
       capsulesPerBottle: 90,
       servingSize: 2,
       url: "",
     },
   ],

   listingsCompared: 2,
   vendorsCompared: 2,

   lowestMonthlyCost: 14.65,
   highestMonthlyCost: 14.99,
   averageMonthlyCost: 14.82,
   medianMonthlyCost: 14.82,
   displayedMonthlyCost: 14.65,

   score: {
     overall: 96,
     value: 91,
     productQuality: 98,
     dosageFit: 97,
     retailerConfidence: 94,
     dataCompleteness: 95,
   },

   confidenceScore: 95,
   confidence: "high",

   selected: false,
   recommended: true,

   reasons: [
     {
       title: "Highest overall recommendation",
       description:
         "Strong product quality, dosage fit, retailer confidence, and overall value.",
     },
     {
       title: "High-confidence comparison",
       description:
         "Multiple vendor listings were available for price and availability comparison.",
     },
   ],
 },

 {
   productName: "Magnesium Glycinate",
   brand: "Pure Encapsulations",

   representativeProduct: {
     retailer: "Amazon",
     brand: "Pure Encapsulations",
     supplement: "Magnesium Glycinate",
     dosage: "120 mg",
     bottlePrice: 24.95,
     capsulesPerBottle: 90,
     servingSize: 1,
     url: "",
   },

   listings: [
     {
       retailer: "Amazon",
       brand: "Pure Encapsulations",
       supplement: "Magnesium Glycinate",
       dosage: "120 mg",
       bottlePrice: 24.95,
       capsulesPerBottle: 90,
       servingSize: 1,
       url: "",
     },
     {
       retailer: "Walmart",
       brand: "Pure Encapsulations",
       supplement: "Magnesium Glycinate",
       dosage: "120 mg",
       bottlePrice: 25.49,
       capsulesPerBottle: 90,
       servingSize: 1,
       url: "",
     },
   ],

   listingsCompared: 2,
   vendorsCompared: 2,

   lowestMonthlyCost: 8.32,
   highestMonthlyCost: 8.5,
   averageMonthlyCost: 8.41,
   medianMonthlyCost: 8.41,
   displayedMonthlyCost: 8.32,

   score: {
     overall: 94,
     value: 87,
     productQuality: 98,
     dosageFit: 94,
     retailerConfidence: 93,
     dataCompleteness: 94,
   },

   confidenceScore: 94,
   confidence: "high",

   selected: false,
   recommended: false,

   reasons: [
     {
       title: "Premium-quality option",
       description:
         "A strong option based on product quality, dosage fit, and comparison confidence.",
     },
   ],
 },

 {
   productName: "Magnesium Glycinate",
   brand: "NOW Foods",

   representativeProduct: {
     retailer: "Amazon",
     brand: "NOW Foods",
     supplement: "Magnesium Glycinate",
     dosage: "200 mg",
     bottlePrice: 16.89,
     capsulesPerBottle: 120,
     servingSize: 2,
     url: "",
   },

   listings: [
     {
       retailer: "Amazon",
       brand: "NOW Foods",
       supplement: "Magnesium Glycinate",
       dosage: "200 mg",
       bottlePrice: 16.89,
       capsulesPerBottle: 120,
       servingSize: 2,
       url: "",
     },
     {
       retailer: "Target",
       brand: "NOW Foods",
       supplement: "Magnesium Glycinate",
       dosage: "200 mg",
       bottlePrice: 17.49,
       capsulesPerBottle: 120,
       servingSize: 2,
       url: "",
     },
     {
       retailer: "Walmart",
       brand: "NOW Foods",
       supplement: "Magnesium Glycinate",
       dosage: "200 mg",
       bottlePrice: 16.98,
       capsulesPerBottle: 120,
       servingSize: 2,
       url: "",
     },
   ],

   listingsCompared: 3,
   vendorsCompared: 3,

   lowestMonthlyCost: 8.45,
   highestMonthlyCost: 8.75,
   averageMonthlyCost: 8.56,
   medianMonthlyCost: 8.49,
   displayedMonthlyCost: 8.45,

   score: {
     overall: 89,
     value: 96,
     productQuality: 86,
     dosageFit: 94,
     retailerConfidence: 96,
     dataCompleteness: 96,
   },

   confidenceScore: 96,
   confidence: "high",

   selected: false,
   recommended: false,

   reasons: [
     {
       title: "Best value option",
       description:
         "Competitive monthly pricing with strong retailer availability and dosage fit.",
     },
   ],
 },
];