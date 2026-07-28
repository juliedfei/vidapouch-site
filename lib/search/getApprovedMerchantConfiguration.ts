import "server-only";

import {
 prisma,
} from "@/lib/db";

export type ApprovedMerchantConfiguration = {
 canonicalName:
   string;

 normalizedNames:
   string[];

 domains:
   string[];
};

function normalizeMerchantName(
 value:
   string
) {
 return value
   .trim()
   .toLowerCase()
   .replace(
     /['’"]/g,
     ""
   )
   .replace(
     /[^a-z0-9]+/g,
     " "
   )
   .replace(
     /\s+/g,
     " "
   )
   .trim();
}

function getDomainFromWebsite(
 website:
   string
) {
 try {
   return new URL(
     website
   )
     .hostname
     .toLowerCase()
     .replace(
       /^www\./,
       ""
     );
 } catch {
   return null;
 }
}

export async function
getApprovedMerchantConfiguration(
 retailer:
   string
): Promise<
 ApprovedMerchantConfiguration | null
>{
 const normalizedRetailer =
   normalizeMerchantName(
     retailer
   );

 if (
   !normalizedRetailer
 ) {
   return null;
 }

 /*
  * Every approved retailer is seeded with its
  * canonical name as one of its aliases, so the
  * alias table provides one normalized lookup path
  * for canonical names and alternate names.
  */
 const matchedAlias =
   await prisma
     .retailerAlias
     .findUnique({
       where: {
         normalizedAlias:
           normalizedRetailer,
       },

       include: {
         retailer: {
           include: {
             aliases:
               true,
           },
         },
       },
     });

 const approvedRetailer =
   matchedAlias
     ?.retailer;

 if (
   !approvedRetailer ||
   !approvedRetailer.active ||
   !approvedRetailer.website
 ) {
   return null;
 }

 const approvedDomain =
   getDomainFromWebsite(
     approvedRetailer.website
   );

 if (
   !approvedDomain
 ) {
   console.error(
     "Approved retailer has an invalid website:",
     {
       retailerId:
         approvedRetailer.id,

       canonicalName:
         approvedRetailer
           .canonicalName,

       website:
         approvedRetailer.website,
     }
   );

   return null;
 }

 const normalizedNames =
   Array.from(
     new Set([
       normalizeMerchantName(
         approvedRetailer
           .canonicalName
       ),

       ...approvedRetailer
         .aliases
         .map(
           (alias) =>
             alias
               .normalizedAlias
         ),
     ])
   ).filter(
     Boolean
   );

 return {
   canonicalName:
     approvedRetailer
       .canonicalName,

   normalizedNames,

   domains: [
     approvedDomain,
   ],
 };
}