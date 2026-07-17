export type SearchIntent =
 | "product"
 | "ingredient"
 | "goal"
 | "brand"
 | "doctor"
 | "article";

export type SearchTab =
 | "products"
 | "brands"
 | "doctors"
 | "articles";

export type SearchQuery = {
 text: string;
 intent: SearchIntent;
};

export type ProductBadge =
 | "Third-party Tested"
 | "NSF Certified"
 | "USP Verified"
 | "Non-GMO"
 | "Vegan"
 | "Gluten Free"
 | "Hypoallergenic";

export type ProductListing = {
 retailer: string;
 price: number;
 url?: string;
};

export type SearchGoal = {
 id: string;

 title: string;

 description: string;

 recommendedIngredients: string[];
};

export type DoctorResult = {
 id: string;

 name: string;

 specialty: string;

 city: string;

 state: string;

 rating: number;
};

export type SearchState = {
 query: SearchQuery;

 activeTab: SearchTab;

 /**
  * ProductOption IDs that have been
  * added to the user's VidaPouch.
  */
 selectedProductIds: string[];
};