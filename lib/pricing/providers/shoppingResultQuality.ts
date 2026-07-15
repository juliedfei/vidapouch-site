export type ShoppingResultQuality = {
    hasSupportedForm: boolean;
   
    hasCapsuleCount: boolean;
   
    hasDosage: boolean;
   
    isComplete: boolean;
   
    issues: string[];
   };
   
   export function evaluateShoppingResultQuality({
    hasSupportedForm,
    capsulesPerBottle,
    dosage,
   }: {
    hasSupportedForm: boolean;
   
    capsulesPerBottle: number | null;
   
    dosage: string;
   }): ShoppingResultQuality {
   
    const issues: string[] = [];
   
    if (!hasSupportedForm) {
      issues.push("Missing dosage form");
    }
   
    if (!capsulesPerBottle) {
      issues.push("Missing capsule count");
    }
   
    if (!dosage.trim()) {
      issues.push("Missing dosage");
    }
   
    return {
   
      hasSupportedForm,
   
      hasCapsuleCount:
        capsulesPerBottle != null,
   
      hasDosage:
        dosage.trim().length > 0,
   
      isComplete:
        issues.length === 0,
   
      issues,
   
    };
   }