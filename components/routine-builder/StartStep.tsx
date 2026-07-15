import type { Path } from "./types";

type StartStepProps = {
 setPath: (path: Path) => void;
};

export default function StartStep({ setPath }: StartStepProps) {
 return (
   <div className="mt-8 rounded-[26px] border border-[#DDD7CF] bg-[#F3E9DD]/70 p-5 sm:p-6">
     <h2
       className="text-[28px] tracking-[-0.03em]"
       style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

       How would you like to build your routine?
     </h2>

     <div className="mt-6 grid gap-3 sm:grid-cols-2">
       <button
         onClick={() => setPath("goal")}
         className="rounded-full bg-[#081620] px-6 py-4 text-[13px] uppercase tracking-[0.08em] text-white">

         Build from my goals
       </button>

       <button
         onClick={() => setPath("current")}
         className="rounded-full border border-[#1B2529] bg-white/40 px-6 py-4 text-[13px] uppercase tracking-[0.08em] text-[#1B2529]">

         I already take supplements
       </button>
     </div>
   </div>
 );
}
