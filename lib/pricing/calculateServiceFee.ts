export const SINGLE_POUCH_SERVICE_FEE = 69.99;
export const DUAL_POUCH_SERVICE_FEE = 89.99;

export type PouchServicePlan =
 | "single-morning"
 | "single-evening"
 | "dual"
 | "empty";

export type ServiceFeeResult = {
 plan: PouchServicePlan;
 serviceFee: number;
};

export function calculateServiceFee({
 morningItemCount,
 eveningItemCount,
}: {
 morningItemCount: number;
 eveningItemCount: number;
}): ServiceFeeResult {
 const hasMorningPouch = morningItemCount > 0;
 const hasEveningPouch = eveningItemCount > 0;

 if (hasMorningPouch && hasEveningPouch) {
   return {
     plan: "dual",
     serviceFee: DUAL_POUCH_SERVICE_FEE,
   };
 }

 if (hasMorningPouch) {
   return {
     plan: "single-morning",
     serviceFee: SINGLE_POUCH_SERVICE_FEE,
   };
 }

 if (hasEveningPouch) {
   return {
     plan: "single-evening",
     serviceFee: SINGLE_POUCH_SERVICE_FEE,
   };
 }

 return {
   plan: "empty",
   serviceFee: 0,
 };
}