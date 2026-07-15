"use client";

type Props = {
 onContinue: () => void;
};

export default function ShoppingFooter({
 onContinue,
}: Props) {
 return (
   <div className="mt-12 flex flex-col items-center">

     <p className="mb-6 max-w-[620px] text-center text-[15px] leading-7 text-[#5D686C]">
       You can change your shopping style at any time before placing your order.
     </p>

     <button
       type="button"
       onClick={onContinue}
       className="rounded-full bg-[#081620] px-10 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#17262C]">

       Continue
     </button>

   </div>
 );
}

