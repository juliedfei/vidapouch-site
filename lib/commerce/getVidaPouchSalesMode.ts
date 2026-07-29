import "server-only";

import {
 VidaPouchSalesMode,
} from "@/lib/generated/prisma/client";

import {
 prisma,
} from "@/lib/db";

export async function getVidaPouchSalesMode() {
 const setting =
   await prisma
     .vidaPouchCommerceSetting
     .findFirst({
       orderBy: {
         createdAt:
           "asc",
       },

       select: {
         salesMode:
           true,
       },
     });

 return setting?.salesMode ??
   VidaPouchSalesMode.WAITLIST;
}
