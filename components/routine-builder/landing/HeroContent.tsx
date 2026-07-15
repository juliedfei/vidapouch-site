export default function HeroContent() {
    return (
      <section
        className="
          relative
          z-20
          mx-auto
          flex
          w-full
          max-w-[1000px]
          flex-col
          items-center
          px-8
          pt-4
          pb-8
          text-center
        ">
   
   
        {/* Top Label */}
   
        <div className="uppercase tracking-[0.34em]">
   
          <span className="text-[12px] font-bold text-[#7A1E2D]">
            VIDAPOUCH
          </span>
   
          <span className="mx-3 text-[#C5C5C5]">|</span>
   
          <span className="text-[12px] font-medium text-[#808080]">
            ROUTINE BUILDER
          </span>
   
        </div>
   
        {/* Heading */}
   
        <h1
          className="
            mt-4
            max-w-[680px]
            text-[46px]
            leading-[0.92]
            tracking-[-0.07em]
            text-[#171717]
            lg:text-[50px]
          "
          style={{
            fontFamily:
              '"Satoshi","General Sans","Space Grotesk","Inter",sans-serif',
            fontWeight: 300,
          }}>
   
          Build your daily
          <br />
          supplement routine
        </h1>
   
        {/* Divider */}
   
        <div className="mt-5 h-px w-32 bg-gradient-to-r from-transparent via-[#E7D1C0] to-transparent" />
   
        {/* Subtitle */}
   
        <p
          className="
            mt-5
            max-w-[900px]
            text-[14px]
            leading-[1.65]
            text-[#5D5D5D]
          ">
   
          Tell us what you already take — or what you're hoping to improve —
          and we'll help turn it into a simple morning and evening plan.
        </p>
   
      </section>
    );
   }
   