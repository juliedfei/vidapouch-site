import Image from "next/image";
import { ROUTINE_IMAGES } from "./assets";

export default function RoutineHero() {
 return (
   <section className="relative overflow-hidden rounded-[36px] border border-white/20 bg-[#0F1720] px-6 py-10 sm:px-10 sm:py-14">

     {/* Hero Background */}
     <Image
       src={ROUTINE_IMAGES.hero}
       alt=""
       fill
       priority
       className="object-cover opacity-30"
     />

     {/* Ambient Glow */}
     <Image
       src={ROUTINE_IMAGES.heroGlow}
       alt=""
       fill
       className="object-cover opacity-70"
     />

     {/* Floating Particles */}
     <Image
       src={ROUTINE_IMAGES.floatingParticles}
       alt=""
       fill
       className="object-cover opacity-55"
     />

     {/* Grain */}
     <Image
       src={ROUTINE_IMAGES.grain}
       alt=""
       fill
       className="object-cover opacity-[0.05] mix-blend-soft-light"
     />

     {/* Noise */}
     <Image
       src={ROUTINE_IMAGES.noise}
       alt=""
       fill
       className="object-cover opacity-[0.04]"
     />

     {/* Readability Overlay */}
     <div className="absolute inset-0 bg-gradient-to-br from-[#081620]/75 via-[#081620]/45 to-[#081620]/70" />

     <div className="relative z-10 max-w-3xl">

       <p className="text-[11px] uppercase tracking-[0.28em] text-[#F6D7C0]">
         VIDA POUCH
       </p>

       <h1
         className="mt-5 text-[46px] leading-[0.98] tracking-[-0.05em] text-white sm:text-[72px]"
         style={{
           fontFamily: 'Georgia, "Times New Roman", serif',
         }}>

         Your routine
         <br />
         on autopilot.
       </h1>

       <p className="mt-6 max-w-2xl text-[18px] leading-8 text-white/82">
         Organize your supplements into personalized morning and evening
         pouches. Build your routine with AI, import the supplements you
         already take, or work directly with a Supplement Concierge.
       </p>

     </div>
   </section>
 );
}