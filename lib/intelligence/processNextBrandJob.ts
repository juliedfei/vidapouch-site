import { prisma } from "@/lib/db";

import { enrichBrand } from "./brandResearch/brandResearchService";

type ProcessNextBrandJobResult =
 | {
     processed: false;
     reason: "no_pending_jobs";
   }
 | {
     processed: true;
     jobId: string;
     brandId: string;
     brandName: string;
   };

export async function processNextBrandJob():
Promise<ProcessNextBrandJobResult> {
 /*
  * Find the oldest high-priority brand
  * verification job that is ready to run.
  */
 const pendingJob =
   await prisma.knowledgeRefreshJob.findFirst({
     where: {
       jobType: "VERIFY_BRAND",

       status: "PENDING",

       OR: [
         {
           scheduledFor: null,
         },
         {
           scheduledFor: {
             lte: new Date(),
           },
         },
       ],
     },

     orderBy: [
       {
         priority: "asc",
       },
       {
         createdAt: "asc",
       },
     ],
   });

 if (!pendingJob) {
   return {
     processed: false,
     reason: "no_pending_jobs",
   };
 }

 /*
  * Claim the job before doing any work.
  */
 const claimedJob =
   await prisma.knowledgeRefreshJob.updateMany({
     where: {
       id: pendingJob.id,
       status: "PENDING",
     },

     data: {
       status: "RUNNING",
       startedAt: new Date(),
       lastError: null,
     },
   });

 /*
  * Another worker may have claimed it.
  */
 if (claimedJob.count === 0) {
   return {
     processed: false,
     reason: "no_pending_jobs",
   };
 }

 if (!pendingJob.entityId) {
   await prisma.knowledgeRefreshJob.update({
     where: {
       id: pendingJob.id,
     },

     data: {
       status: "FAILED",
       completedAt: new Date(),
       lastError:
         "VERIFY_BRAND job is missing entityId.",
     },
   });

   return {
     processed: false,
     reason: "no_pending_jobs",
   };
 }

 const brand =
   await prisma.brand.findUnique({
     where: {
       id: pendingJob.entityId,
     },
   });

 if (!brand) {
   await prisma.knowledgeRefreshJob.update({
     where: {
       id: pendingJob.id,
     },

     data: {
       status: "FAILED",
       completedAt: new Date(),
       lastError:
         "Brand record could not be found.",
     },
   });

   return {
     processed: false,
     reason: "no_pending_jobs",
   };
 }

 console.log(
   "Brand intelligence job claimed:",
   {
     jobId: pendingJob.id,
     brandId: brand.id,
     brandName:
       brand.canonicalName,
   }
 );

 const success =
 await enrichBrand({
   brandId: brand.id,
   brandName: brand.canonicalName,
 });

await prisma.knowledgeRefreshJob.update({
 where: {
   id: pendingJob.id,
 },

 data: {
   status: success
     ? "COMPLETED"
     : "FAILED",

   completedAt: new Date(),

   lastError: success
     ? null
     : "No research data returned.",
 },
});

return {
 processed: true,
 jobId: pendingJob.id,
 brandId: brand.id,
 brandName: brand.canonicalName,
};





}