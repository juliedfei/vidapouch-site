export default function BenefitsSection() {
    const benefits = [
      {
        icon: "/images/home-v2/trust/personalized-for-you.PNG",
        title: "Personalized for You",
        description:
          "AI-powered recommendations tailored to your goals, routine, lifestyle, and the supplements you actually need.",
      },
      {
        icon: "/images/home-v2/icons/personalized.PNG",
        title: "One Daily Routine",
        description:
          "No more opening bottle after bottle. Grab your personalized pouch, take it, and move on with your day.",
      },
      {
        icon: "/images/home-v2/trust/quality-you-can-trust.PNG",
        title: "Clean, Trusted Ingredients",
        description:
          "High-quality supplements from trusted brands selected to fit your personalized wellness plan.",
      },
      {
        icon: "/images/home-v2/icons/delivery.PNG",
        title: "Everything Together",
        description:
          "One shipment. One refill date. No more discovering one supplement ran out while the others are still full.",
      },
    ];
   
    return (
      <section className="bg-[#F3E9DD] px-6 pb-16">
        <div className="mx-auto max-w-[1320px] rounded-[32px] border border-[#E6DBCF] bg-[#F8F2EA]/90 shadow-[0_24px_70px_rgba(20,15,10,0.05)]">
          <div className="grid divide-y divide-[#E7DDD1] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col items-center px-8 py-12 text-center">
   
                {/* Icon */}
                <div className="mb-3 flex items-center justify-center">
                  <img
                    src={benefit.icon}
                    alt=""
                    className="h-24 w-auto object-contain"
                  />
                </div>
   
                {/* Title */}
                <h3
                  className="text-[34px] leading-[1.05] tracking-[-0.03em] text-[#102225]"
                  style={{ fontFamily: "Georgia, serif" }}>
   
                  {benefit.title}
                </h3>
   
                {/* Description */}
                <p className="mt-5 text-[17px] leading-8 text-[#4C5658]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
   }
   