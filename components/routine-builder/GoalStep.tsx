import type { Path } from "./types";

type GoalStepProps = {
 setPath: (path: Path) => void;
 selectedGoals: string[];
 setSelectedGoals: (goals: string[]) => void;
 selectedLifestyle: string[];
 setSelectedLifestyle: (lifestyle: string[]) => void;
 selectedConsiderations: string[];
 setSelectedConsiderations: (considerations: string[]) => void;
 handleBuildGoalPlan: () => void;
};

const goals = [
 "Energy",
 "Sleep",
 "Stress / mood",
 "Focus / brain health",
 "General wellness",
 "Immune support",
 "Gut health",
 "Heart / circulation",
 "Hair / skin / nails",
 "Muscle / strength",
 "Endurance",
 "Bone / joint support",
];

const lifestyleOptions = [
 "Vegetarian",
 "Vegan",
 "Pregnant",
 "Breastfeeding",
 "Trying to conceive",
 "Athletic / active",
 "Caffeine sensitive",
 "Minimal capsules preferred",
 "Low sun exposure",
];

const healthConsiderations = [
 "Migraines",
 "Ataxia / neurological support",
 "Iron deficiency",
 "Thyroid support",
 "Menopause",
 "Autoimmune support",
 "Chronic fatigue",
 "Joint pain / inflammation",
 "Digestive sensitivity",
 "High stress",
];

export default function GoalStep({
 setPath,
 selectedGoals,
 setSelectedGoals,
 selectedLifestyle,
 setSelectedLifestyle,
 selectedConsiderations,
 setSelectedConsiderations,
 handleBuildGoalPlan,
}: GoalStepProps) {
 function toggleItem(
   value: string,
   current: string[],
   setter: (items: string[]) => void
 ) {
   if (current.includes(value)) {
     setter(current.filter((item) => item !== value));
   } else {
     setter([...current, value]);
   }
 }

 return (
   <div className="mt-8 rounded-[26px] border border-[#DDD7CF] bg-[#F3E9DD]/70 p-5 sm:p-6">
     <button
       onClick={() => setPath("start")}
       className="mb-5 cursor-pointer text-[13px] uppercase tracking-[0.14em] text-[#8C1D40]">

       ← Back
     </button>

     <h2
       className="text-[28px] tracking-[-0.03em]"
       style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

       Build your personalized routine.
     </h2>

     <p className="mt-3 text-[15px] leading-7 text-[#475357]">
       Select your goals, lifestyle, and health considerations so VidaPouch can
       create a more personalized morning and evening pouch.
     </p>

     <SelectionSection
       title="1. Goals"
       subtitle="What are you hoping to improve?"
       options={goals}
       selectedItems={selectedGoals}
       onToggle={(item) => toggleItem(item, selectedGoals, setSelectedGoals)}
     />

     <SelectionSection
       title="2. Lifestyle"
       subtitle="What should we consider when building your routine?"
       options={lifestyleOptions}
       selectedItems={selectedLifestyle}
       onToggle={(item) =>
         toggleItem(item, selectedLifestyle, setSelectedLifestyle)
       }
     />

     <SelectionSection
       title="3. Health considerations"
       subtitle="These help us personalize carefully. VidaPouch does not diagnose, treat, cure, or prevent medical conditions."
       options={healthConsiderations}
       selectedItems={selectedConsiderations}
       onToggle={(item) =>
         toggleItem(item, selectedConsiderations, setSelectedConsiderations)
       }
     />

     <div className="mt-6 rounded-[20px] border border-[#8C1D40]/20 bg-white/45 p-4">
       <p className="text-[12px] leading-6 text-[#5D686C]">
         Health considerations are used for wellness personalization and safety
         awareness only. Please review supplement routines with a clinician,
         especially if pregnant, managing a condition, or taking medication.
       </p>
     </div>

     {selectedGoals.length > 0 && (
       <button
         onClick={handleBuildGoalPlan}
         className="mt-6 w-full cursor-pointer rounded-full bg-[#081620] px-6 py-4 text-[13px] uppercase tracking-[0.08em] text-white">

         Build My Personalized Plan
       </button>
     )}
   </div>
 );
}

function SelectionSection({
 title,
 subtitle,
 options,
 selectedItems,
 onToggle,
}: {
 title: string;
 subtitle: string;
 options: string[];
 selectedItems: string[];
 onToggle: (item: string) => void;
}) {
 return (
   <div className="mt-7">
     <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C1D40]">
       {title}
     </p>

     <p className="mt-2 text-[15px] leading-7 text-[#475357]">{subtitle}</p>

     <div className="mt-4 grid gap-3 sm:grid-cols-2">
       {options.map((option) => {
         const isSelected = selectedItems.includes(option);

         return (
           <button
             key={option}
             onClick={() => onToggle(option)}
             className={`cursor-pointer rounded-full border px-6 py-4 text-[13px] uppercase tracking-[0.08em] transition ${
               isSelected
                 ? "border-[#081620] bg-[#081620] text-white"
                 : "border-[#1B2529] bg-white/40 text-[#1B2529]"
             }`}>

             {option}
           </button>
         );
       })}
     </div>
   </div>
 );
}