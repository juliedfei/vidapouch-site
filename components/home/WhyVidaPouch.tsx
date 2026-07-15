type Benefit = {
    title: string;
    description: string;
    icon: React.ReactNode;
   };
   
   export default function WhyVidaPouch() {
    const benefits: Benefit[] = [
      {
        title: "AI-powered personalization",
        description:
          "Build a supplement routine around your goals, lifestyle, and preferences.",
        icon: <SparkleIcon />,
      },
      {
        title: "Real human support",
        description:
          "Work one-on-one with a Supplement Concierge whenever you want additional guidance.",
        icon: <PersonIcon />,
      },
      {
        title: "Your brands or ours",
        description:
          "Keep the supplements you already trust or choose from available VidaPouch options.",
        icon: <BottleIcon />,
      },
      {
        title: "Daily pouches, organized for you",
        description:
          "Leave the bottles behind. Your routine arrives organized into convenient daily pouches.",
        icon: <PouchIcon />,
      },
      {
        title: "Delivered every month",
        description:
          "Your personalized routine arrives at your door ready to open and use.",
        icon: <DeliveryIcon />,
      },
      {
        title: "Simple routine updates",
        description:
          "Adjust your routine as your goals, preferences, or supplement needs change.",
        icon: <RefreshIcon />,
      },
    ];
   
    return (
      <section className="bg-[#F3E9DD] px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8C1D40]">
              MORE THAN A PILL ORGANIZER
            </p>
   
            <h2
              className="mx-auto mt-4 max-w-[720px] text-[36px] leading-[1.06] tracking-[-0.035em] text-[#081620] sm:text-[46px]"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
   
              Why choose VidaPouch?
            </h2>
   
            <p className="mx-auto mt-4 max-w-[680px] text-[16px] leading-7 text-[#475357] sm:text-[17px]">
              VidaPouch combines personalized guidance, daily organization, and
              monthly delivery to make your supplement routine easier to build,
              follow, and maintain.
            </p>
          </div>
   
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="
                  rounded-[26px]
                  border
                  border-[#DDD7CF]
                  bg-[#F8F2EA]/85
                  px-7
                  py-8
                  shadow-[0_18px_50px_rgba(20,15,10,0.06)]
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_26px_60px_rgba(20,15,10,0.09)]
                ">
   
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D8CBBE] bg-white/55 text-[#8C1D40]">
                  {benefit.icon}
                </div>
   
                <h3
                  className="mt-6 text-[25px] leading-[1.12] tracking-[-0.03em] text-[#081620]"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                  }}>
   
                  {benefit.title}
                </h3>
   
                <p className="mt-3 text-[15px] leading-7 text-[#566166]">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
   
          <div className="mt-10 flex justify-center">
            <a
              href="/routine-builder"
              className="
                rounded-full
                bg-[#081620]
                px-9
                py-4
                text-center
                text-[13px]
                font-medium
                tracking-[0.08em]
                text-white
                transition
                hover:bg-[#1B2529]
              ">
   
              START MY ROUTINE
            </a>
          </div>
        </div>
      </section>
    );
   }
   
   function IconFrame({ children }: { children: React.ReactNode }) {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true">
   
        {children}
      </svg>
    );
   }
   
   function SparkleIcon() {
    return (
      <IconFrame>
        <path
          d="M24 7C24.9 16.1 31.9 23.1 41 24C31.9 24.9 24.9 31.9 24 41C23.1 31.9 16.1 24.9 7 24C16.1 23.1 23.1 16.1 24 7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M36 6V14M32 10H40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </IconFrame>
    );
   }
   
   function PersonIcon() {
    return (
      <IconFrame>
        <circle
          cx="24"
          cy="15"
          r="6"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 40C12 33.4 17.4 28 24 28C30.6 28 36 33.4 36 40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </IconFrame>
    );
   }
   
   function BottleIcon() {
    return (
      <IconFrame>
        <path
          d="M19 7H29V13H19V7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M17 13H31L34 18V39H14V18L17 13Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M18 26H30"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </IconFrame>
    );
   }
   
   function PouchIcon() {
    return (
      <IconFrame>
        <path
          d="M13 8H35L38 13V40H10V13L13 8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M13 15H35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 27C18 23.7 20.7 21 24 21C27.3 21 30 23.7 30 27C30 30.3 27.3 33 24 33C20.7 33 18 30.3 18 27Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </IconFrame>
    );
   }
   
   function DeliveryIcon() {
    return (
      <IconFrame>
        <path
          d="M7 14H29V34H7V14Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M29 20H36L41 26V34H29V20Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle
          cx="16"
          cy="36"
          r="4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="34"
          cy="36"
          r="4"
          stroke="currentColor"
          strokeWidth="2"
        />
      </IconFrame>
    );
   }
   
   function RefreshIcon() {
    return (
      <IconFrame>
        <path
          d="M36 17V8L31.5 12.5C29.4 10.9 26.8 10 24 10C16.3 10 10 16.3 10 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 31V40L16.5 35.5C18.6 37.1 21.2 38 24 38C31.7 38 38 31.7 38 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </IconFrame>
    );
   }