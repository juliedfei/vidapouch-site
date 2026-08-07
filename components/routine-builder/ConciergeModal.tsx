"use client";

type ConciergeModalProps = {
 open: boolean;
 onClose: () => void;
};

export default function ConciergeModal({
 open,
 onClose,
}: ConciergeModalProps) {
 if (!open) return null;

 return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
     <div className="w-full max-w-[520px] rounded-[28px] border border-[#DDD7CF] bg-[#F8F2EA] p-6 shadow-[0_24px_70px_rgba(20,15,10,0.18)]">

       <p className="text-[11px] uppercase tracking-[0.20em] text-[#8C1D40]">
         Supplement Concierge
       </p>

       <h2
         className="mt-3 text-[34px] leading-tight tracking-[-0.04em] text-[#081620]"
         style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

         Prefer to order by phone?
       </h2>

       <p className="mt-4 text-[15px] leading-7 text-[#475357]">
         Speak with a VidaPouch specialist and we'll help organize your
         supplements, answer questions, and prepare your personalized pouch
         routine.
       </p>

       <div className="mt-6 rounded-[22px] border border-[#DDD7CF] bg-white/60 p-5">

         <p className="text-[11px] uppercase tracking-[0.16em] text-[#8C1D40]">
           Phone
         </p>

         <p className="mt-2 text-[28px] font-medium text-[#081620]">
           (508) 243-8404
         </p>

         <p className="mt-3 text-sm leading-6 text-[#5D686C]">
           Available by phone or text. We'll review your routine and help you
           build the perfect daily pouch.
         </p>

       </div>

       <div className="mt-6 flex flex-col gap-3 sm:flex-row">

         <a
           href="tel:+15082438404"
           className="flex-1 rounded-full bg-[#081620] px-6 py-4 text-center text-[13px] font-medium uppercase tracking-[0.08em] text-white transition hover:bg-[#13222C]">

           Call Now
         </a>

         <button
           type="button"
           onClick={onClose}
           className="flex-1 rounded-full border border-[#1B2529] bg-white/40 px-6 py-4 text-[13px] font-medium uppercase tracking-[0.08em] text-[#1B2529] transition hover:bg-white">

           Close
         </button>

       </div>

     </div>
   </div>
 );
}