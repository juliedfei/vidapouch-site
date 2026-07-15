"use client";

type Props = {
 customBrand: string;
 setCustomBrand: (value: string) => void;
};

export default function CustomBrandInput({
 customBrand,
 setCustomBrand,
}: Props) {
 return (
   <div className="mt-5">

     <label>

       <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475357]">
         Brand Name
       </span>

       <input
         value={customBrand}
         onChange={(e) => setCustomBrand(e.target.value)}
         placeholder="Enter the brand"
         autoComplete="organization"
         className="h-[60px] w-full rounded-[18px] border border-[#D8CEC2] bg-white px-5 text-[15px] outline-none transition focus:border-[#8C1D40] focus:ring-4 focus:ring-[#8C1D40]/10"
       />

     </label>

   </div>
 );
}
