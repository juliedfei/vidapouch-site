export type ShoppingMode =
 | "recommended"
 | "review"
 | "compare";

export type ShoppingModeDefinition = {
 id: ShoppingMode;
 title: string;
 description: string;
 automaticallySelectsProducts: boolean;
 showsAlternativesByDefault: boolean;
 requiresCustomerApproval: boolean;
};

export const SHOPPING_MODES: Record<
 ShoppingMode,
 ShoppingModeDefinition
> = {
 recommended: {
   id: "recommended",
   title: "Recommend for me",
   description:
     "VidaPouch will select the strongest options based on quality, reviews, value, and availability.",
   automaticallySelectsProducts: true,
   showsAlternativesByDefault: false,
   requiresCustomerApproval: false,
 },

 review: {
   id: "review",
   title: "Review recommendations",
   description:
     "VidaPouch will recommend products, and you can review or change each selection before checkout.",
   automaticallySelectsProducts: true,
   showsAlternativesByDefault: false,
   requiresCustomerApproval: true,
 },

 compare: {
   id: "compare",
   title: "Compare all options",
   description:
     "Compare brands, retailers, reviews, quality, and estimated monthly costs before selecting each product.",
   automaticallySelectsProducts: false,
   showsAlternativesByDefault: true,
   requiresCustomerApproval: true,
 },
};

export const DEFAULT_SHOPPING_MODE: ShoppingMode =
 "recommended";

export function getShoppingModeDefinition(
 mode: ShoppingMode
): ShoppingModeDefinition {
 return SHOPPING_MODES[mode];
}

export function isValidShoppingMode(
 value: unknown
): value is ShoppingMode {
 return (
   value === "recommended" ||
   value === "review" ||
   value === "compare"
 );
}
