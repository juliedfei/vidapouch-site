"use client";

export const VIDAPOUCH_CHOOSES_BRAND =
 "VidaPouch chooses (Recommended)";

export const OTHER_BRAND = "Other";

export const BRAND_OPTIONS = [
 VIDAPOUCH_CHOOSES_BRAND,
 "Carlson",
 "Designs for Health",
 "Doctor's Best",
 "Garden of Life",
 "Jarrow Formulas",
 "Kirkland Signature",
 "Life Extension",
 "Nature Made",
 "Nordic Naturals",
 "NOW Foods",
 "Nutricost",
 "Pure Encapsulations",
 "Solgar",
 "Sports Research",
 "Thorne",
 OTHER_BRAND,
];

type BrandSelectProps = {
 value: string;
 onChange: (value: string) => void;
 label?: string;
 disabled?: boolean;
};

export default function BrandSelect({
 value,
 onChange,
 label = "Brand",
 disabled = false,
}: BrandSelectProps) {
 return (
   <label className="block">
     <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5D686C]">
       {label}
     </span>

     <div className="relative">
       <select
         value={value}
         onChange={(event) =>
           onChange(event.target.value)
         }
         disabled={disabled}
         className="h-12 w-full appearance-none rounded-xl border border-[#D8CEC2] bg-white px-4 pr-10 text-[15px] outline-none transition focus:border-[#8C1D40] focus:ring-4 focus:ring-[#8C1D40]/10 disabled:cursor-not-allowed disabled:opacity-50">

         <option value="" disabled>
           Select a Brand
         </option>

         {BRAND_OPTIONS.map((option) => (
           <option
             key={option}
             value={option}>

             {option}
           </option>
         ))}
       </select>

       <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#7B746C]">
         ▼
       </div>
     </div>
   </label>
 );
}
