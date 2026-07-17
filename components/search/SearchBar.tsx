"use client";

type SearchBarProps = {
 value: string;
 onChange: (value: string) => void;
 placeholder?: string;
 variant?: "hero" | "compact";
};

export default function SearchBar({
 value,
 onChange,
 placeholder = "Search supplements, health goals, brands, or doctors...",
 variant = "hero",
}: SearchBarProps) {
 const isHero = variant === "hero";

 const inputHeight = isHero ? "h-16" : "h-12";
 const textSize = isHero ? "text-[17px]" : "text-[15px]";
 const iconLeft = isHero ? "left-5" : "left-4";
 const paddingLeft = isHero ? "pl-14" : "pl-11";

 return (
   <div className="relative w-full">
     <svg
       className={`pointer-events-none absolute ${iconLeft} top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A8488]`}
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2">

       <circle cx="11" cy="11" r="7" />
       <path d="M20 20L16.65 16.65" />
     </svg>

     <input
       type="text"
       value={value}
       onChange={(e) => onChange(e.target.value)}
       placeholder={placeholder}
       className={`
         ${inputHeight}
         w-full
         rounded-[14px]
         border
         border-[#DDD5CB]
         bg-white
         ${paddingLeft}
         pr-6
         ${textSize}
         text-[#081620]
         shadow-sm
         outline-none
         transition
         placeholder:text-[#8A9498]
         focus:border-[#8C1D40]
         focus:ring-2
         focus:ring-[#8C1D40]/10
       `}
     />
   </div>
 );
}
