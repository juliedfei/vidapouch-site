import FeatureCard from "../FeatureCard";
import { ROUTINE_IMAGES } from "../assets";
import type { Path } from "../types";

type Props = {
 setPath: (path: Path) => void;
 openConcierge: () => void;
};

export default function FeatureCards({
 setPath,
 openConcierge,
}: Props) {
 return (
   <section className="relative z-20 w-full px-12 pb-10">

     <div className="mx-auto max-w-[1100px]">

       <div
         className="
           grid
           items-stretch
           gap-6
           lg:grid-cols-3
         ">


         <FeatureCard
           icon={ROUTINE_IMAGES.conciergeIcon}
           accent="burgundy"
           eyebrow="SUPPLEMENT CONCIERGE"
           title="Talk to a person"
           description="Prefer to order by phone? We'll help build your VidaPouch together."
           onClick={openConcierge}
         />

         <FeatureCard
           icon={ROUTINE_IMAGES.capsuleIcon}
           accent="silver"
           eyebrow="CURRENT ROUTINE"
           title="I already take supplements"
           description="Enter your brands, supplements, and dosages so we can organize them into convenient morning and evening pouches."
           onClick={() => setPath("current")}
         />

         <FeatureCard
           icon={ROUTINE_IMAGES.sparkleIcon}
           accent="violet"
           eyebrow="AI BUILDER"
           title="Build my routine with AI"
           description="Choose your goals and let VidaPouch recommend a personalized routine."
           onClick={() => setPath("goal")}
         />

       </div>

     </div>

   </section>
 );
}
