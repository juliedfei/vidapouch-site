"use client";

type Props = {
 onBack: () => void;
};

export default function CheckoutHeader({
 onBack,
}: Props) {
 return (
   <header className="mb-6">

     <button
       type="button"
       onClick={onBack}
       className="inline-flex items-center text-[13px] font-medium text-[#8C1D40] transition hover:text-[#65142E]">

       ← Back to Pouches
     </button>

   </header>
 );
}
