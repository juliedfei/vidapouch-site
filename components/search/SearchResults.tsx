import ProductCard from "./ProductCard";
import { mockProducts } from "./data/mockProducts";

type SearchResultsProps = {
 query: string;
};

export default function SearchResults({
 query,
}: SearchResultsProps) {
 const normalized = query.trim().toLowerCase();

 const filteredProducts =
   normalized.length === 0
     ? mockProducts
     : mockProducts.filter((product) => {
         return (
           product.productName
             .toLowerCase()
             .includes(normalized) ||
           product.brand
             .toLowerCase()
             .includes(normalized) ||
           product.representativeProduct.supplement
             .toLowerCase()
             .includes(normalized)
         );
       });

 const resultLabel =
   query.trim().length > 0
     ? query.trim()
     : "All Products";

 return (
   <div className="w-full bg-white">
     {/* Results heading and sort control */}

     <div className="flex flex-wrap items-start justify-between gap-5 pb-4">
       <div>
         <h2
           className="
             text-[26px]
             leading-tight
             text-[#081620]
             lg:text-[29px]
           "
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>

           Results for:{" "}
           <span className="text-[#71162F]">
             {resultLabel}
           </span>
         </h2>

         <p className="mt-2 text-[13px] text-[#667074]">
           Showing {filteredProducts.length} result
           {filteredProducts.length !== 1
             ? "s"
             : ""}
         </p>
       </div>

       <label
         className="
           flex
           h-[44px]
           items-center
           gap-2
           rounded-[8px]
           border
           border-[#E7DFD6]
           bg-white
           px-4
           text-[13px]
           text-[#667074]
           shadow-[0_1px_4px_rgba(36,49,53,0.03)]
         ">

         <span>Sort by:</span>

         <select
           defaultValue="best-match"
           aria-label="Sort products"
           className="
             cursor-pointer
             appearance-none
             bg-transparent
             pr-6
             font-semibold
             text-[#081620]
             outline-none
           "
           style={{
             backgroundImage:
               "linear-gradient(45deg, transparent 50%, #667074 50%), linear-gradient(135deg, #667074 50%, transparent 50%)",
             backgroundPosition:
               "calc(100% - 8px) 50%, calc(100% - 3px) 50%",
             backgroundSize:
               "5px 5px, 5px 5px",
             backgroundRepeat: "no-repeat",
           }}>

           <option value="best-match">
             Best Match
           </option>

           <option value="quality">
             Highest Quality
           </option>

           <option value="price-low">
             Lowest Price
           </option>

           <option value="value">
             Best Value
           </option>
         </select>
       </label>
     </div>

     {filteredProducts.length > 0 ? (
       <div
         className="
           overflow-hidden
           rounded-[10px]
           border
           border-[#EEE7DF]
           bg-white
         ">

         {/* Desktop column headings */}

         <div
           className="
             hidden
             min-h-[48px]
             grid-cols-[minmax(0,1.55fr)_minmax(150px,0.9fr)_minmax(150px,0.9fr)]
             items-center
             border-b
             border-[#EEE7DF]
             bg-white
             lg:grid
           ">

           <div className="px-5 text-[13px] font-semibold text-[#081620]">
             Product &amp; Quality
           </div>

           <div
             className="
               border-l
               border-[#F0E9E1]
               px-5
               text-[13px]
               font-semibold
               text-[#081620]
             ">

             Buy Bottle{" "}
             <span className="ml-1 font-medium text-[#596366]">
               <br/>(Other Retailers)
             </span>
           </div>

           <div
             className="
               border-l
               border-[#F0E9E1]
               px-5
               text-[13px]
               font-semibold
               text-[#8C1D40]
               underline
               decoration-[#CDA7B2]
               underline-offset-4
             ">

             Add to VidaPouch
           </div>
         </div>

         {/* How-to-buy callout */}

         <div
           className="
             flex
             items-center
             gap-4
             border-b
             border-[#EEE7DF]
             bg-[#FCF8F3]
             px-5
             py-5
             lg:px-6
             lg:py-6
           ">

           <div
             className="
               flex
               h-[58px]
               w-[58px]
               flex-none
               items-center
               justify-center
             ">

             <img
               src="/images/home-v2/icons/scale.PNG"
               alt=""
               aria-hidden="true"
               className="
                 h-[54px]
                 w-[54px]
                 object-contain
               "
             />
           </div>

           <div>
             <h3 className="text-[17px] font-semibold text-[#081620]">
               Choose how you want to buy
             </h3>

             <p
               className="
                 mt-1
                 max-w-[620px]
                 text-[13px]
                 leading-[1.55]
                 text-[#354044]
               ">

               Buy a full bottle from trusted
               retailers, or add to your
               personalized pouch and only pay
               for what you need.
             </p>
           </div>
         </div>

         {/* Product comparison rows */}

         <div>
           {filteredProducts.map((product) => (
             <ProductCard
               key={`${product.brand}-${product.productName}`}
               product={product}
             />
           ))}
         </div>

         {/* Results footer */}

         <div
           className="
             border-t
             border-[#EEE7DF]
             bg-white
             px-5
             py-4
             text-center
           ">

           <button
             type="button"
             className="
               inline-flex
               items-center
               gap-2
               text-[13px]
               font-semibold
               text-[#081620]
               transition
               hover:text-[#8C1D40]
             ">

             See all {filteredProducts.length} results
             <span
               aria-hidden="true"
               className="text-[17px]">

               ↓
             </span>
           </button>
         </div>
       </div>
     ) : (
       <div
         className="
           rounded-[10px]
           border
           border-[#EEE7DF]
           bg-white
           px-8
           py-16
           text-center
         ">

         <h3
           className="text-[26px] text-[#081620]"
           style={{
             fontFamily:
               'Georgia, "Times New Roman", serif',
           }}>

           No products found
         </h3>

         <p className="mt-3 text-[#667074]">
           Try searching for another ingredient,
           brand, or health goal.
         </p>
       </div>
     )}
   </div>
 );
}
