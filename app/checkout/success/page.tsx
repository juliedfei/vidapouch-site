import Link from "next/link";

import {
 stripe,
} from "@/lib/stripe";

type SuccessPageProps = {
 searchParams:
   Promise<{
     session_id?:
       string | string[];
   }>;
};

function formatPrice(
 amountInCents:
   number
) {
 return new Intl.NumberFormat(
   "en-US",
   {
     style:
       "currency",

     currency:
       "USD",
   }
 ).format(
   amountInCents / 100
 );
}

export default async function SuccessPage({
 searchParams,
}: SuccessPageProps) {
 const resolvedSearchParams =
   await searchParams;

 const sessionIdValue =
   resolvedSearchParams
     .session_id;

 const sessionId =
   Array.isArray(
     sessionIdValue
   )
     ? sessionIdValue[0]
     : sessionIdValue;

 if (!sessionId) {
   return (
     <main className="min-h-screen bg-[#F3E9DD] px-4 py-12">
       <div className="mx-auto max-w-[680px] rounded-[24px] border border-[#DDD7CF] bg-white p-8 text-center">
         <h1 className="font-serif text-3xl text-[#4F1118]">
           We could not confirm your checkout
         </h1>

         <p className="mt-4 text-sm leading-6 text-[#5D686C]">
           Please return to VidaSearch and try again.
         </p>

         <Link
           href="/v2"
           className="mt-6 inline-flex rounded-[10px] bg-[#7D0E1C] px-5 py-3 text-sm font-semibold text-white">

           Return to VidaSearch
         </Link>
       </div>
     </main>
   );
 }

 try {
   const session =
     await stripe.checkout.sessions.retrieve(
       sessionId
     );

   const total =
     session.amount_total ??
     0;

   const planName =
     session.metadata
       ?.vidapouchPlan ??
     "VidaPouch";

   return (
     <main className="min-h-screen bg-[#F3E9DD] px-4 py-12">
       <div className="mx-auto max-w-[680px] rounded-[24px] border border-[#DDD7CF] bg-white p-8 text-center shadow-sm">
         <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C1D40]">
           Order confirmed
         </p>

         <h1 className="mt-3 font-serif text-4xl text-[#4F1118]">
           Welcome to VidaPouch
         </h1>

         <p className="mt-4 text-sm leading-6 text-[#5D686C]">
           Your {planName} subscription has been
           successfully created.
         </p>

         <div className="mt-7 rounded-[16px] bg-[#FAF6F1] px-5 py-4 text-left">
           <div className="flex justify-between gap-4 text-sm">
             <span className="text-[#5D686C]">
               Monthly total
             </span>

             <span className="font-semibold text-[#081620]">
               {formatPrice(total)}
             </span>
           </div>

           {session.customer_details
             ?.email && (
             <div className="mt-3 flex justify-between gap-4 text-sm">
               <span className="text-[#5D686C]">
                 Receipt email
               </span>

               <span className="text-right font-medium text-[#081620]">
                 {
                   session
                     .customer_details
                     .email
                 }
               </span>
             </div>
           )}
         </div>

         <p className="mt-6 text-sm leading-6 text-[#5D686C]">
           You will receive a confirmation email from
           Stripe. VidaPouch will use your order
           details to prepare your personalized
           monthly pouches.
         </p>

         <Link
           href="/v2"
           className="mt-7 inline-flex rounded-[10px] bg-[#7D0E1C] px-5 py-3 text-sm font-semibold text-white">

           Return to VidaSearch
         </Link>
       </div>
     </main>
   );
 } catch (
   error
 ) {
   console.error(
     "Unable to retrieve Stripe Checkout Session:",
     error
   );

   return (
     <main className="min-h-screen bg-[#F3E9DD] px-4 py-12">
       <div className="mx-auto max-w-[680px] rounded-[24px] border border-[#DDD7CF] bg-white p-8 text-center">
         <h1 className="font-serif text-3xl text-[#4F1118]">
           Payment received
         </h1>

         <p className="mt-4 text-sm leading-6 text-[#5D686C]">
           We could not display the complete order
           details, but your payment may still have
           succeeded. Please check your email for the
           Stripe confirmation.
         </p>

         <Link
           href="/v2"
           className="mt-6 inline-flex rounded-[10px] bg-[#7D0E1C] px-5 py-3 text-sm font-semibold text-white">

           Return to VidaSearch
         </Link>
       </div>
     </main>
   );
 }
}
