import "dotenv/config";
import { prisma } from "../../lib/db";

async function main() {
 await prisma.brand.delete({
   where: {
     canonicalName: "Test Brand",
   },
 });

 console.log("Deleted Test Brand");
}

main()
 .catch(console.error)
 .finally(async () => {
   await prisma.$disconnect();
 });
