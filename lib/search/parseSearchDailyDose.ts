export type ParsedSearchDailyDose =
 | {
     type:
       "physical-units";

     amount: number;

     unit:
       | "capsule"
       | "tablet"
       | "caplet"
       | "softgel"
       | "gummy"
       | "serving"
       | "unit";
   }
 | {
     type:
       "dosage";

     amount: number;

     unit:
       | "mg"
       | "mcg"
       | "g"
       | "iu";
   }
 | {
     type:
       "invalid";

     reason: string;
   };

function normalizeInput(
 value: string
) {
 return value
   .toLowerCase()
   .replace(/,/g, "")
   .replace(/\s+/g, " ")
   .trim();
}

function normalizePhysicalUnit(
 value: string
):
 | "capsule"
 | "tablet"
 | "caplet"
 | "softgel"
 | "gummy"
 | "serving"
 | "unit"
 | null {
 switch (value) {
   case "capsule":
   case "capsules":
   case "cap":
   case "caps":
     return "capsule";

   case "tablet":
   case "tablets":
   case "tab":
   case "tabs":
     return "tablet";

   case "caplet":
   case "caplets":
     return "caplet";

   case "softgel":
   case "softgels":
     return "softgel";

   case "gummy":
   case "gummies":
     return "gummy";

   case "serving":
   case "servings":
     return "serving";

   case "unit":
   case "units":
     return "unit";

   default:
     return null;
 }
}

function normalizeDosageUnit(
 value: string
):
 | "mg"
 | "mcg"
 | "g"
 | "iu"
 | null {
 switch (value) {
   case "mg":
   case "milligram":
   case "milligrams":
     return "mg";

   case "mcg":
   case "µg":
   case "ug":
   case "microgram":
   case "micrograms":
     return "mcg";

   case "g":
   case "gram":
   case "grams":
     return "g";

   case "iu":
   case "international unit":
   case "international units":
     return "iu";

   default:
     return null;
 }
}

export function parseSearchDailyDose(
 value: string
): ParsedSearchDailyDose {
 const normalized =
   normalizeInput(
     value
   );

 if (!normalized) {
   return {
     type:
       "invalid",

     reason:
       "Enter a daily dose.",
   };
 }

 const match =
   normalized.match(
     /^(\d+(?:\.\d+)?)\s*(.+)$/
   );

 if (!match) {
   return {
     type:
       "invalid",

     reason:
       "Use a number followed by a unit, such as 2 capsules or 250 mg.",
   };
 }

 const amount =
   Number(match[1]);

 if (
   !Number.isFinite(
     amount
   ) ||
   amount <= 0
 ) {
   return {
     type:
       "invalid",

     reason:
       "Daily dose must be greater than zero.",
   };
 }

 const rawUnit =
   match[2].trim();

 const physicalUnit =
   normalizePhysicalUnit(
     rawUnit
   );

 if (physicalUnit) {
   if (
     !Number.isInteger(
       amount
     )
   ) {
     return {
       type:
         "invalid",

       reason:
         "Capsules, tablets, gummies, and other physical units must be whole numbers.",
     };
   }

   return {
     type:
       "physical-units",

     amount,

     unit:
       physicalUnit,
   };
 }

 const dosageUnit =
   normalizeDosageUnit(
     rawUnit
   );

 if (dosageUnit) {
   return {
     type:
       "dosage",

     amount,

     unit:
       dosageUnit,
   };
 }

 return {
   type:
     "invalid",

   reason:
     "Supported examples include 2 capsules, 250 mg, 500 mcg, 5,000 IU, or 1 tablet.",
 };
}
