export type MonthlyCostInput = {
    bottlePrice: number;
   
    capsulesPerBottle: number;
   
    capsulesPerDay: number;
   };
   
   export type MonthlyCostResult = {
    monthlyCost: number;
   
    bottleDurationDays: number;
   
    bottlesPerMonth: number;
   };
   
   export function calculateMonthlyCost({
    bottlePrice,
    capsulesPerBottle,
    capsulesPerDay,
   }: MonthlyCostInput): MonthlyCostResult {
    if (
      bottlePrice <= 0 ||
      capsulesPerBottle <= 0 ||
      capsulesPerDay <= 0
    ) {
      return {
        monthlyCost: 0,
        bottleDurationDays: 0,
        bottlesPerMonth: 0,
      };
    }
   
    const bottleDurationDays =
      capsulesPerBottle / capsulesPerDay;
   
    const bottlesPerMonth =
      30 / bottleDurationDays;
   
    const monthlyCost =
      bottlePrice * bottlesPerMonth;
   
    return {
      monthlyCost:
        Math.round(monthlyCost * 100) / 100,
   
      bottleDurationDays:
        Math.round(bottleDurationDays),
   
      bottlesPerMonth:
        Math.round(bottlesPerMonth * 100) / 100,
    };
   }