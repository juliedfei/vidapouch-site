import type { Path } from "./types";

type GoalStepProps = {
 setPath: (path: Path) => void;
 selectedGoals: string[];
 setSelectedGoals: (goals: string[]) => void;
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

export default function GoalStep({
 setPath,
 selectedGoals,
 setSelectedGoals,
 handleBuildGoalPlan,
}: GoalStepProps) {
 function toggleGoal(goal: string) {
   if (selectedGoals.includes(goal)) {
     setSelectedGoals(selectedGoals.filter((item) => item !== goal));
   } else {
     setSelectedGoals([...selectedGoals, goal]);
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

       What are you hoping to improve?
     </h2>

     <p className="mt-3 text-[15px] leading-7 text-[#475357]">
       Select one or more goals and we’ll build a simple starter routine.
     </p>

     <div className="mt-6 grid gap-3 sm:grid-cols-2">
       {goals.map((goal) => {
         const isSelected = selectedGoals.includes(goal);

         return (
           <button
             key={goal}
             onClick={() => toggleGoal(goal)}
             className={`cursor-pointer rounded-full border px-6 py-4 text-[13px] uppercase tracking-[0.08em] transition ${
               isSelected
                 ? "border-[#081620] bg-[#081620] text-white"
                 : "border-[#1B2529] bg-white/40 text-[#1B2529]"
             }`}>

             {goal}
           </button>
         );
       })}
     </div>

     {selectedGoals.length > 0 && (
       <button
         onClick={handleBuildGoalPlan}
         className="mt-6 w-full cursor-pointer rounded-full bg-[#081620] px-6 py-4 text-[13px] uppercase tracking-[0.08em] text-white">

         Build My Starter Plan
       </button>
     )}
   </div>
 );
}