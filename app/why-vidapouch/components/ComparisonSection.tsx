export default function ComparisonSection() {
    return (
      <section className="bg-[linear-gradient(180deg,#F3E9DD_0%,#EFE2D4_100%)] pt-0 pb-10 px-4 lg:px-8">
        <div className="mx-auto max-w-[1380px]">
   
          {/* Decorative Leaf */}
   
          <img
            src="/images/why-vidapouch/section-leaf.PNG"
            alt=""
            className="mx-auto -mb-2 h-12 w-auto"
          />
   
          {/* Heading */}
   
          <div className="text-center">
   
            <h1
              className="mx-auto max-w-[720px] text-[32px] font-normal leading-[0.88] tracking-[-0.045em] text-[#102225] sm:text-[42px] lg:text-[50px]"
              style={{ fontFamily: "Georgia, serif" }}>
   
              Wellness should feel
              <br />
              less overwhelming.
            </h1>
   
            <p className="mt-3 text-[17px] text-[#374346]">
              Simpler. Smarter.
              <span className="font-semibold text-[#8C1D40]">
                {" "}Personalized.
              </span>
            </p>
   
          </div>
   
          {/* Comparison Image */}
   
          <div className="mt-6">
            <img
              src="/images/why-vidapouch/comparison.PNG"
              alt="The old way of managing supplements compared to the organized VidaPouch system."
              className="block w-full rounded-[22px]"
            />
          </div>
   
          {/* Caption */}
   
          <div className="mx-auto mt-8 max-w-[760px] text-center">
   
            <p className="text-[18px] leading-8 text-[#263336]">
              VidaPouch takes the guesswork out of supplementation and
              puts your wellness back on track—
              <span className="font-medium">
                {" "}one personalized pouch at a time.
              </span>
            </p>
   
          </div>
   
        </div>
      </section>
    );
   }
   