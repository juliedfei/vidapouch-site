"use client";

import WorkflowHeader from "@/components/routine-builder/WorkflowHeader";
import ShoppingModeCard from "./ShoppingModeCard";
import ShoppingFooter from "./ShoppingFooter";

import type { ShoppingMode } from "@/lib/shopping/shoppingModes";

type Props = {
 shoppingMode: ShoppingMode;
 setShoppingMode: (mode: ShoppingMode) => void;

 onBack: () => void;
 onContinue: () => void;
};

export default function ShoppingPreferencesStep({
 shoppingMode,
 setShoppingMode,
 onBack,
 onContinue,
}: Props) {
 return (
   <main className="mx-auto max-w-[1180px]">

     <WorkflowHeader
       title="How would you like VidaPouch to shop for you?"
       description="Choose how involved you'd like to be when selecting supplement brands."
       onBack={onBack}
     />

     <div className="mt-10 grid gap-6 lg:grid-cols-3">

       <ShoppingModeCard
         selected={shoppingMode === "recommended"}
         title="Recommend for Me"
         badge="Recommended"
         description="VidaPouch will automatically recommend the strongest products based on quality, value, reviews, scientific evidence, and availability."
         onClick={() =>
           setShoppingMode("recommended")
         }
       />

       <ShoppingModeCard
         selected={shoppingMode === "review"}
         title="Review Recommendations"
         badge=""
         description="VidaPouch will recommend products, and you'll have a chance to review each recommendation before ordering."
         onClick={() =>
           setShoppingMode("review")
         }
       />

       <ShoppingModeCard
         selected={shoppingMode === "compare"}
         title="Compare Everything"
         badge=""
         description="Compare brands, retailers, monthly costs, customer reviews, and quality scores before making your selections."
         onClick={() =>
           setShoppingMode("compare")
         }
       />

     </div>

     <ShoppingFooter
       onContinue={onContinue}
     />

   </main>
 );
}