import SearchBar from "./SearchBar";

type SearchHeaderProps = {
 query?: string;
};

export default function SearchHeader({
 query = "Magnesium",
}: SearchHeaderProps) {
 return (
   <section className="rounded-2xl border border-[#DDD5CB] bg-white p-6 shadow-[0_10px_30px_rgba(8,22,32,0.05)]">
     {/* Top Row */}

     <div className="flex flex-wrap items-start justify-between gap-6">
       <div>
         <p className="text-[11px] uppercase tracking-[0.12em] text-[#8C1D40]">
           VidaSearch™
         </p>

         <h2
           className="mt-1 text-[34px] leading-tight text-[#081620]"
           style={{
             fontFamily: 'Georgia, "Times New Roman", serif',
           }}>

           {query}
         </h2>

         <p className="mt-2 text-[14px] text-[#667074]">
           Compare trusted supplement brands ranked by quality, scientific
           evidence, certifications, and value.
         </p>
       </div>

       <div className="flex flex-wrap gap-2">
         <button className="rounded-full bg-[#8C1D40] px-4 py-2 text-[12px] font-semibold text-white">
           Products
         </button>

         <button className="rounded-full border border-[#D8CEC3] bg-white px-4 py-2 text-[12px]">
           Brands
         </button>

         <button className="rounded-full border border-[#D8CEC3] bg-white px-4 py-2 text-[12px]">
           Doctors
         </button>

         <button className="rounded-full border border-[#D8CEC3] bg-white px-4 py-2 text-[12px]">
           Articles
         </button>
       </div>
     </div>

     {/* Search */}

     <div className="mt-6">
       <SearchBar
         value={query}
         onChange={() => {}}
       />
     </div>
   </section>
 );
}