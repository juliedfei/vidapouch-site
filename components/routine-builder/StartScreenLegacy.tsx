import RoutineHero from "./RoutineHero";
import FeatureCard from "./FeatureCard";
import { ROUTINE_IMAGES } from "./assets";
import type { Path } from "./types";

type Props = {
 setPath: (path: Path) => void;
 openConcierge: () => void;
};

export default function StartScreen({
 setPath,
 openConcierge,
}: Props) {
 return (
   <div className="space-y-10">

     <RoutineHero />

     <section className="grid gap-6 lg:grid-cols-3">

       <FeatureCard
         icon={ROUTINE_IMAGES.conciergeIcon}
         eyebrow="SUPPLEMENT CONCIERGE"
         title="Talk to a person"
         description="Call us and we'll build your entire supplement routine together. Perfect for busy professionals, caregivers, and anyone who prefers a white-glove experience."
         onClick={openConcierge}
       />

       <FeatureCard
         icon={ROUTINE_IMAGES.capsuleIcon}
         eyebrow="CURRENT ROUTINE"
         title="I already take supplements"
         description="Tell us the brands and supplements you currently use. We'll organize everything into convenient morning and evening VidaPouch packets."
         onClick={() => setPath("current")}
       />

       <FeatureCard
         icon={ROUTINE_IMAGES.sparkleIcon}
         eyebrow="AI ROUTINE BUILDER"
         title="Build my routine with AI"
         description="Answer a few questions about your goals and lifestyle. VidaPouch AI will recommend a personalized supplement routine built around you."
         onClick={() => setPath("goal")}
       />

     </section>

   </div>
 );
}
