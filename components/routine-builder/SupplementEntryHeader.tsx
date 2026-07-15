"use client";

export default function SupplementEntryHeader() {
 return (
   <div className="mb-5">
     <h3
       className="text-[30px] tracking-[-0.04em] text-[#081620]"
       style={{
         fontFamily: 'Georgia, "Times New Roman", serif',
       }}>

       Add Supplements
     </h3>

     <p className="mt-2 text-[15px] text-[#5D686C]">
       Enter each supplement exactly as shown on the bottle.
     </p>
   </div>
 );
}