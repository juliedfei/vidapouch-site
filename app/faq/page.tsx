export default function FAQPage() {
    return (
      <main className="min-h-screen bg-[#F3E9DD] text-[#0E171B]">
        <header className="sticky top-0 z-50 border-b border-[#D6CCBF] bg-[#EDE1D3]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 lg:px-10">
            <a href="/" className="shrink-0">
              <img
                src="/vidapouch_logo3.png"
                alt="Vidapouch logo"
                className="h-[42px] w-auto sm:h-[52px] lg:h-[60px]"
              />
            </a>
   
            <nav className="hidden items-center gap-5 min-[1024px]:flex min-[1150px]:gap-7">
              <a href="/product" className="nav-item">PRODUCT</a>
              <a href="/how-it-works" className="nav-item">HOW IT WORKS</a>
              <a href="/about" className="nav-item">ABOUT</a>
              <a href="/faq" className="nav-item">FAQ</a>
              <a
                href="/waitlist"
                className="whitespace-nowrap rounded-full bg-[#081620] px-6 py-3 text-[13px] tracking-[0.08em] text-white">
   
                GET EARLY ACCESS
              </a>
            </nav>
   
            <a
              href="/waitlist"
              className="rounded-full bg-[#081620] px-5 py-3 text-[11px] tracking-[0.08em] text-white min-[1024px]:hidden">
   
              EARLY ACCESS
            </a>
          </div>
        </header>
   
        <section className="bg-[linear-gradient(180deg,#F3E9DD_0%,#EFE2D4_100%)] px-6 py-16 text-center lg:py-22">
          <div className="mx-auto max-w-[1120px]">
            <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
              FAQ
            </p>
   
            <h1
              className="mx-auto mt-4 max-w-[820px] text-[44px] leading-[1.02] tracking-[-0.04em] lg:text-[68px]"
              style={{ fontFamily: "Georgia, serif" }}>
   
              Everything you need to feel confident.
            </h1>
   
            <p className="mx-auto mt-6 max-w-[660px] text-[18px] leading-[1.7] text-[#3E4A4E]">
              Vidapouch is designed to make daily wellness simpler, clearer, and
              easier to follow — without the bottle clutter or guesswork.
            </p>
          </div>
        </section>
   
        <section className="bg-[#EFE2D4] px-6 pb-20">
          <div className="mx-auto grid max-w-[1120px] gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="rounded-[32px] border border-[#D6CCBF] bg-[#F8F2EA]/85 p-7 shadow-[0_18px_50px_rgba(20,15,10,0.05)] lg:sticky lg:top-28 lg:h-fit">
              <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
                Quick answer
              </p>
              <h2
                className="mt-4 text-[32px] leading-[1.05] tracking-[-0.03em]"
                style={{ fontFamily: "Georgia, serif" }}>
   
                The pouch replaces the daily sorting.
              </h2>
              <p className="mt-5 text-[16px] leading-7 text-[#475357]">
                Each pouch is organized for one moment in your day. You open it,
                take what’s inside, and move on.
              </p>
              <a
                href="/waitlist"
                className="mt-7 inline-block rounded-full bg-[#081620] px-7 py-4 text-[13px] tracking-[0.08em] text-white">
   
                GET EARLY ACCESS
              </a>
            </aside>
   
            <div className="space-y-10">
              <FAQGroup title="The basics">
                <FAQItem
                  question="What is Vidapouch?"
                  answer="Vidapouch is a personalized supplement pouch system. Instead of managing multiple bottles, your supplements are organized into time-based pouches designed around your routine."
                />
                <FAQItem
                  question="What comes in a pouch?"
                  answer="Each pouch contains the supplements meant to be taken together at a specific moment in your day — for example, a morning pouch, midday pouch, post-workout pouch, or evening pouch."
                />
                <FAQItem
                  question="How is this different from a multivitamin?"
                  answer="A multivitamin is broad and one-size-fits-most. Vidapouch is organized around your schedule, goals, and routine — so your supplement plan can be more specific and easier to follow."
                />
              </FAQGroup>
   
              <FAQGroup title="Personalization + AI">
                <FAQItem
                  question="How does the AI guide work?"
                  answer="Your Vidapouch AI Guide helps you think through your goals, timing, and current routine. It can help you explore options, understand what’s inside your pouch, and adjust your plan as your needs change."
                />
                <FAQItem
                  question="Do I need to know exactly what to take?"
                  answer="No. You can start with what you already take, what you’re trying to improve, or even where your routine feels confusing. Vidapouch is designed to help organize the process."
                />
                <FAQItem
                  question="Can I change my routine later?"
                  answer="Yes. Your routine should evolve with you. You can scan your pouch to revisit your goals, ask questions, and explore adjustments with your AI guide."
                />
              </FAQGroup>
   
              <FAQGroup title="The pouch">
                <FAQItem
                  question="Do I still need to manage different bottles?"
                  answer="No. That’s exactly what Vidapouch is designed to simplify. Each pouch is grouped for one moment in your day, so everything inside that pouch is meant to be taken together."
                />
                <FAQItem
                  question="What is on the back of the pouch?"
                  answer="The back of the pouch can show what’s inside and the quantity included. You can also scan it to learn more about the ingredients, why they may be included, and similar options you may want to explore."
                />
                <FAQItem
                  question="Can the pouch remind me when to take it?"
                  answer="Yes. The pouch can include a scan code to help set reminders, so your routine stays connected to your actual schedule."
                />
              </FAQGroup>
   
              <FAQGroup title="Safety + trust">
                <FAQItem
                  question="Is Vidapouch medical advice?"
                  answer="No. Vidapouch helps organize supplement routines and provide educational support. It does not diagnose, treat, cure, or prevent disease, and it is not a replacement for medical advice."
                />
                <FAQItem
                  question="Can I use Vidapouch with a doctor-recommended routine?"
                  answer="Yes. Vidapouch can help organize complex supplement schedules recommended by a clinician or wellness professional. You should always follow your healthcare provider’s guidance."
                />
                <FAQItem
                  question="Are supplements FDA approved?"
                  answer="Dietary supplements are regulated differently than prescription medications. Supplement labels and claims must follow applicable rules, but supplements are not approved by the FDA in the same way drugs are."
                />
              </FAQGroup>
   
              <FAQGroup title="Logistics">
                <FAQItem
                  question="Is Vidapouch available now?"
                  answer="Vidapouch is currently gathering early access interest. Joining the waitlist helps shape the first version of the product around real routines."
                />
                <FAQItem
                  question="Will this be a subscription?"
                  answer="The goal is to make Vidapouch work as an ongoing routine system, likely through a subscription model that can be adjusted as your needs change."
                />
                <FAQItem
                  question="Can I cancel or adjust later?"
                  answer="The intended experience is flexible. Your routine should be able to change with your goals, schedule, and preferences."
                />
              </FAQGroup>
            </div>
          </div>
        </section>
   
        <section className="bg-[#F3E9DD] px-6 pb-20 pt-2">
          <div className="mx-auto max-w-[900px] rounded-[32px] border border-[#DDD7CF] bg-[#F8F2EA]/90 px-8 py-12 text-center shadow-[0_30px_80px_rgba(20,15,10,0.08)]">
            <p className="text-[12px] uppercase tracking-[0.24em] text-[#8C1D40]">
              READY WHEN YOU ARE
            </p>
   
            <h2
              className="mx-auto mt-4 max-w-[650px] text-[38px] leading-[1.08] tracking-[-0.035em] lg:text-[54px]"
              style={{ fontFamily: "Georgia, serif" }}>
   
              Start building your routine.
            </h2>
   
            <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-8 text-[#475357]">
              Join the waitlist and tell us what you take today. Your answers help
              us design the first Vidapouch experience around real routines.
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
   
   function FAQGroup({
    title,
    children,
   }: {
    title: string;
    children: React.ReactNode;
   }) {
    return (
      <section>
        <h2
          className="mb-5 text-[34px] leading-[1.05] tracking-[-0.035em] lg:text-[44px]"
          style={{ fontFamily: "Georgia, serif" }}>
   
          {title}
        </h2>
   
        <div className="space-y-4">{children}</div>
      </section>
    );
   }
   
   function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
      <details className="group rounded-[24px] border border-[#D6CCBF] bg-[#F8F2EA]/90 px-6 py-5 shadow-[0_14px_40px_rgba(20,15,10,0.04)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
          <h3 className="text-left text-[19px] font-medium tracking-[-0.01em] text-[#0E171B]">
            {question}
          </h3>
          <span className="shrink-0 text-[28px] leading-none text-[#8C1D40] transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
   
        <p className="mt-4 max-w-[720px] text-[16px] leading-7 text-[#475357]">
          {answer}
        </p>
      </details>
    );
   }