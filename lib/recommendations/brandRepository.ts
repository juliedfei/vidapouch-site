import { prisma } from "@/lib/db";

export async function getBrandById(
 brandId: string
) {
 return prisma.brand.findUnique({
   where: {
     id: brandId,
   },

   include: {
     manufacturer: true,
     certifications: {
       include: {
         certification: true,
       },
     },
     evidence: {
       include: {
         evidenceSource: true,
       },
     },
   },
 });
}

export async function getBrandByName(
 canonicalName: string
) {
 return prisma.brand.findUnique({
   where: {
     canonicalName,
   },

   include: {
     manufacturer: true,
     certifications: {
       include: {
         certification: true,
       },
     },
     evidence: {
       include: {
         evidenceSource: true,
       },
     },
   },
 });
}