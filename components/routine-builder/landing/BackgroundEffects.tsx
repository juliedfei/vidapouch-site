import Image from "next/image";
import { ROUTINE_IMAGES } from "../assets";

export default function BackgroundEffects() {
 return (
   <div className="pointer-events-none absolute inset-0 overflow-hidden">

     {/* Main background */}
     <Image
       src={ROUTINE_IMAGES.hero}
       alt=""
       fill
       priority
       className="object-cover"
     />

     {/* Warm glow */}
     <Image
       src={ROUTINE_IMAGES.heroGlow}
       alt=""
       fill
       className="object-cover opacity-95"
     />

     {/* Floating light particles */}
     <Image
       src={ROUTINE_IMAGES.floatingParticles}
       alt=""
       fill
       className="object-cover opacity-60"
     />

     {/* Film grain */}
     <Image
       src={ROUTINE_IMAGES.grain}
       alt=""
       fill
       className="object-cover opacity-[0.03]"
     />

     {/* Noise */}
     <Image
       src={ROUTINE_IMAGES.noise}
       alt=""
       fill
       className="object-cover opacity-[0.02]"
     />

     {/* Soft warm ivory tint */}
     <div
       className="absolute inset-0"
       style={{
         background:
           "linear-gradient(180deg, rgba(255,252,247,.12) 0%, rgba(255,249,241,.20) 100%)",
       }}
     />
   </div>
 );
}
