"use client";

type Props = {
 selected: boolean;

 title: string;

 badge?: string;

 description: string;

 onClick: () => void;
};

export default function ShoppingModeCard({
 selected,
 title,
 badge,
 description,
 onClick,
}: Props) {
 return (
   <button
     type="button"
     onClick={onClick}
     className={`group relative flex h-full flex-col rounded-[28px] border p-7 text-left transition-all duration-200 ${
       selected
         ? "border-[#8C1D40] bg-[#FCF6F2] shadow-[0_18px_45px_rgba(20,15,10,0.08)]"
         : "border-[#DDD7CF] bg-white hover:-translate-y-0.5 hover:border-[#C8BBAE] hover:shadow-[0_18px_45px_rgba(20,15,10,0.05)]"
     }`}>

     {/* Selection Circle */}

     <div className="flex items-start justify-between">

       <div
         className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
           selected
             ? "border-[#8C1D40]"
             : "border-[#C8BBAE]"
         }`}>

         {selected && (
           <div className="h-3 w-3 rounded-full bg-[#8C1D40]" />
         )}
       </div>

       {badge && (
         <span className="rounded-full bg-[#8C1D40] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
           {badge}
         </span>
       )}

     </div>

     {/* Title */}

     <h3
       className="mt-8 text-[28px] leading-tight tracking-[-0.03em] text-[#081620]"
       style={{
         fontFamily:
           'Georgia, "Times New Roman", serif',
       }}>

       {title}
     </h3>

     {/* Description */}

     <p className="mt-4 flex-1 text-[15px] leading-7 text-[#5D686C]">
       {description}
     </p>

     {/* Bottom Label */}

     <div className="mt-8 flex items-center justify-between">

       <span
         className={`text-[13px] font-medium ${
           selected
             ? "text-[#8C1D40]"
             : "text-[#6B625A]"
         }`}>

         {selected
           ? "Selected"
           : "Click to select"}
       </span>

       <div
         className={`h-2 w-2 rounded-full transition ${
           selected
             ? "bg-[#8C1D40]"
             : "bg-[#DDD7CF] group-hover:bg-[#C8BBAE]"
         }`}
       />

     </div>

   </button>
 );
}
