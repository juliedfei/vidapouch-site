import Navbar from "@/components/home/Navbar";


export default function HowItWorksPage() {

return (
  <main className="min-h-screen bg-[#F3E9DD] text-[#0E171B]">
    <Navbar />

    {/* HERO */}
    <section className="bg-[linear-gradient(180deg,#F3E9DD_0%,#EFE2D4_100%)] px-6 py-16 text-center lg:py-22">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
          HOW IT WORKS
        </p>

        <h1
          className="mx-auto mt-4 max-w-[780px] text-[44px] leading-[1.02] tracking-[-0.04em] lg:text-[68px]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

          A supplement routine that finally runs itself.
        </h1>

        <p className="mx-auto mt-6 max-w-[650px] text-[18px] leading-[1.7] text-[#3E4A4E]">
          Vidapouch helps you organize your routine, explore what fits your
          goals, and receive ready-to-take pouches designed around your day.
        </p>
      </div>
    </section>

    {/* STEPS */}
    <section className="bg-[#EFE2D4] px-6 pb-24">
      <div className="mx-auto grid max-w-[1120px] gap-5 md:grid-cols-2">
        <StepCard
          number="01"
          title="Tell us your routine"
          text="Share what you take today, when you take it, and which brands you already trust."
        />

        <StepCard
          number="02"
          title="Refine it with your AI guide"
          text="Explore options, ask questions, and shape your routine around your goals."
        />

        <StepCard
          number="03"
          title="Organize your day"
          text="Your supplements are grouped into simple, time-based pouches that match your routine."
        />

        <StepCard
          number="04"
          title="Delivered, ready to take"
          text="Your pouches arrive organized, labeled, and ready — no bottles, no guesswork."
        />
      </div>
    </section>

    {/* AI GUIDE */}
    <section className="bg-[#F3E9DD] px-6 py-20">
      <div className="mx-auto grid max-w-[1120px] items-center gap-10 rounded-[36px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-8 py-14 shadow-[0_30px_90px_rgba(20,15,10,0.08)] lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
        <div>
          <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
            AI-GUIDED WELLNESS
          </p>

          <h2
            className="mt-4 text-[38px] leading-[1.05] tracking-[-0.035em] lg:text-[54px]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

            Shape your routine before it’s built.
          </h2>

          <p className="mt-5 max-w-[500px] text-[17px] leading-8 text-[#475357]">
            Talk through your goals, your current routine, the brands you trust,
            and what you want to improve — then organize everything into a
            system that fits your day.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#D8D0C6] bg-white/55 p-6 shadow-[0_18px_50px_rgba(20,15,10,0.05)]">
          <div className="mb-5 flex items-center gap-3 border-b border-[#DDD7CF] pb-4">
            <div className="h-9 w-9 rounded-full bg-[#081620]" />
            <div>
              <p className="text-sm font-medium text-[#081620]">
                Vidapouch AI Guide
              </p>
              <p className="text-xs text-[#687377]">
                Routine planning, simplified
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <ChatBubble
              side="user"
              text="I’m currently taking a multivitamin, but I’m looking for more energy in the morning while I’m working and something to help me wind down at night."
            />
            <ChatBubble
              side="assistant"
              text="That’s a great starting point. Multivitamins are designed for broad coverage, but they’re not structured around how your day actually works."
            />
            <ChatBubble
              side="assistant"
              text="If there are brands you already trust, you can tell us those too. Vidapouch is designed to learn your current routine before changing anything."
            />
            <ChatBubble
              side="assistant"
              text="Some people explore options like creatine, B vitamins, or omega-3s for morning support, and magnesium or calming blends for evening wind-down."
            />
            <ChatBubble
              side="user"
              text="That makes sense — I just don’t want to manage a bunch of different bottles."
            />
            <ChatBubble
              side="assistant"
              text="You wouldn’t have to. We can organize this into a simple morning pouch for focus and an evening pouch for wind-down."
            />
          </div>

          <p className="mt-6 text-center text-[13px] text-[#687377]">
            Scan your pouch anytime to revisit your routine, adjust your plan,
            or explore new options with your AI guide.
          </p>
        </div>
      </div>
    </section>

    {/* MULTIVITAMIN */}
    <section className="bg-[#F3E9DD] px-6 pb-20">
      <div className="mx-auto max-w-[1120px] rounded-[36px] bg-[#E5D8C8] px-8 py-14 shadow-[0_30px_90px_rgba(20,15,10,0.08)] lg:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
              WHY NOT JUST A MULTIVITAMIN?
            </p>

            <h2
              className="mt-4 text-[38px] leading-[1.05] tracking-[-0.035em] lg:text-[54px]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

              Because your routine is not one-size-fits-all.
            </h2>
          </div>

          <div className="rounded-[28px] border border-[#D2C5B6] bg-[#F8F2EA]/75 p-8 shadow-[0_18px_50px_rgba(20,15,10,0.05)]">
            <p className="text-[17px] leading-8 text-[#3E4A4E]">
              Multivitamins are designed for broad coverage. Vidapouch is
              built around precision, flexibility, and consistency — helping
              you stay aligned with your goals, your day, and the supplement
              brands you already trust.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="px-6 pb-20">
      <div className="mx-auto max-w-[900px] rounded-[32px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-8 py-12 text-center shadow-[0_30px_80px_rgba(20,15,10,0.08)]">
        <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
          EARLY ACCESS
        </p>

        <h2
          className="mx-auto mt-4 max-w-[650px] text-[38px] leading-[1.08] tracking-[-0.035em] lg:text-[54px]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

          Help shape the first Vidapouch experience.
        </h2>

        <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-8 text-[#475357]">
          Tell us what you take today — including the brands you already trust —
          so we can understand what matters most in your routine.
        </p>

        <a
          href="/waitlist"
          className="mt-8 inline-block rounded-full bg-[#081620] px-8 py-4 text-[14px] tracking-[0.08em] text-white">

          GET EARLY ACCESS
        </a>
      </div>
    </section>
  </main>
);
}

function StepCard({
number,
title,
text,
}: {
number: string;
title: string;
text: string;
}) {
return (
  <div className="rounded-[28px] border border-[#DDD7CF] bg-[#F8F2EA]/82 p-7 shadow-[0_18px_50px_rgba(20,15,10,0.06)]">
    <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
      {number}
    </p>
    <h3
      className="mt-4 text-[28px]"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

      {title}
    </h3>
    <p className="mt-4 text-[16px] leading-7 text-[#475357]">{text}</p>
  </div>
);
}

function ChatBubble({
side,
text,
}: {
side: "user" | "assistant";
text: string;
}) {
const isUser = side === "user";

return (
  <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[82%] rounded-[18px] px-4 py-3 text-sm ${
        isUser ? "bg-[#081620] text-white" : "border bg-[#F8F2EA]"
      }`}>

      {text}
    </div>
  </div>
);
}
