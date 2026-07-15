"use client";

import BackgroundEffects from "./BackgroundEffects";
import HeroContent from "./HeroContent";
import FeatureCards from "./FeatureCards";
import TrustBar from "./TrustBar";
import type { Path } from "../types";

type LandingProps = {
 setPath: (path: Path) => void;
 openConcierge: () => void;
};

export default function Landing({
 setPath,
 openConcierge,
}: LandingProps) {
 return (
   <main className="relative min-h-screen overflow-hidden bg-[#F6F1EA]">

     <BackgroundEffects />

     <div
       className="
         relative
         z-10
         mx-auto
         flex
         min-h-screen
         w-full
         max-w-[1600px]
         flex-col
         items-center
         px-8
         pt-6
         pb-8
       ">


       {/* HERO */}

       <HeroContent />

       {/* CARDS */}

       <div className="-mt-4 w-full">
         <FeatureCards
           setPath={setPath}
           openConcierge={openConcierge}
         />
       </div>

       {/* TRUST BAR */}

       <div className="mt-6 w-full">
         <TrustBar />
       </div>

     </div>

   </main>
 );
}