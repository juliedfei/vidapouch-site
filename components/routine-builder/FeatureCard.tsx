import Image from "next/image";

type FeatureCardProps = {
 icon: string;
 eyebrow: string;
 title: string;
 description: string;
 accent?: "burgundy" | "silver" | "violet";
 onClick: () => void;
};

export default function FeatureCard({
 icon,
 eyebrow,
 title,
 description,
 accent = "silver",
 onClick,
}: FeatureCardProps) {
 const accentColor =
   accent === "burgundy"
     ? "#8C1D40"
     : accent === "violet"
     ? "#6F4FFF"
     : "#666666";

 return (
   <button
     type="button"
     onClick={onClick}
     className="
       group
       relative
       flex
       min-h-[385px]
       flex-col
       overflow-visible
       rounded-[30px]
       border
       border-white/70
       bg-white/55
       px-8
       pt-8
       pb-6
       text-left
       backdrop-blur-[24px]
       shadow-[0_16px_45px_rgba(70,50,40,.10)]
       transition-all
       duration-300
       hover:-translate-y-1
       hover:shadow-[0_28px_60px_rgba(70,50,40,.14)]
     ">

     {/* Glass */}
     <div
       className="absolute inset-0 rounded-[30px]"
       style={{
         background:
           "linear-gradient(180deg, rgba(255,255,255,.58), rgba(255,255,255,.24))",
       }}
     />

     {/* ====================================================== */}
     {/* Premium light platform */}
     {/* ====================================================== */}

     {/* Sharp luminous bar */}
     <div
       className="
         pointer-events-none
         absolute
         left-1/2
         bottom-[-2px]
         h-[7px]
         w-[82%]
         -translate-x-1/2
         rounded-full
       "
       style={{
         background:
           accent === "burgundy"
             ? "linear-gradient(90deg, transparent 0%, rgba(140,29,64,.08) 12%, rgba(140,29,64,.92) 50%, rgba(140,29,64,.08) 88%, transparent 100%)"
             : accent === "violet"
             ? "linear-gradient(90deg, transparent 0%, rgba(111,79,255,.08) 12%, rgba(111,79,255,.88) 50%, rgba(111,79,255,.08) 88%, transparent 100%)"
             : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.22) 12%, rgba(255,255,255,1) 50%, rgba(255,255,255,.22) 88%, transparent 100%)",
       }}
     />

     {/* Reflection */}
     <div
       className="
         pointer-events-none
         absolute
         left-1/2
         bottom-[-10px]
         h-[12px]
         w-[70%]
         -translate-x-1/2
         rounded-full
         blur-[8px]
         opacity-70
       "
       style={{
         background:
           accent === "burgundy"
             ? "rgba(140,29,64,.40)"
             : accent === "violet"
             ? "rgba(111,79,255,.36)"
             : "rgba(255,255,255,.82)",
       }}
     />

     {/* Ambient glow */}
     <div
       className="
         pointer-events-none
         absolute
         left-1/2
         bottom-[-24px]
         h-[44px]
         w-[112%]
         -translate-x-1/2
         rounded-full
         blur-[28px]
         opacity-45
       "
       style={{
         background:
           accent === "burgundy"
             ? "radial-gradient(circle, rgba(140,29,64,.30), transparent 72%)"
             : accent === "violet"
             ? "radial-gradient(circle, rgba(111,79,255,.26), transparent 72%)"
             : "radial-gradient(circle, rgba(255,255,255,.55), transparent 72%)",
       }}
     />

     <div className="relative z-10 flex h-full flex-col">
       {/* Icon */}
       <div className="flex justify-center">
         <Image
           src={icon}
           alt=""
           width={72}
           height={72}
           className="object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,.08)]"
         />
       </div>

       {/* Eyebrow */}
       <p
         className="
           mt-6
           text-center
           text-[11px]
           font-medium
           uppercase
           tracking-[0.28em]
         "
         style={{ color: accentColor }}>

         {eyebrow}
       </p>

       {/* Fixed title height */}
       <div className="mt-4 flex min-h-[66px] items-start justify-center">
         <h3
           className="
             text-center
             text-[30px]
             leading-[1.08]
             tracking-[-0.05em]
             text-[#151515]
           "
           style={{
             fontFamily: '"Satoshi","General Sans","Inter",sans-serif',
             fontWeight: 300,
           }}>

           {title}
         </h3>
       </div>

       {/* Description */}
       <p
         className="
           mt-4
           flex-1
           text-center
           text-[15px]
           leading-7
           text-[#666666]
         ">

         {description}
       </p>

       {/* CTA */}
       <div
         className="
           mt-6
           rounded-full
           border
           py-3
           text-center
           text-[12px]
           font-semibold
           uppercase
           tracking-[0.18em]
           transition-all
           duration-300
           group-hover:bg-white/10
         "
         style={{
           borderColor: accentColor,
           color: accentColor,
         }}>

         Get Started →
       </div>
     </div>
   </button>
 );
}