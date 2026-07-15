"use client";

type WorkflowHeaderProps = {
 title: string;
 description: string;
 onBack: () => void;
};

export default function WorkflowHeader({
 title,
 description,
 onBack,
}: WorkflowHeaderProps) {
 return (
   <header className="mb-8">

     <button
       type="button"
       onClick={onBack}
       className="inline-flex items-center text-[13px] font-medium text-[#8C1D40] transition hover:text-[#65142E]">

       ← Back

     </button>

     <h1
       className="mt-4 text-[34px] leading-tight tracking-[-0.045em] text-[#081620] sm:text-[40px]"
       style={{
         fontFamily: 'Georgia, "Times New Roman", serif',
       }}>

       {title}

     </h1>

     <p className="mt-2 text-[15px] leading-6 text-[#5D686C]">
       {description}
     </p>

   </header>
 );
}