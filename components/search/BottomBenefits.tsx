type Benefit = {
  title: string;
  description: string;
  image: string;
  imageSize: string;
 };
 
 const benefits: Benefit[] = [
  {
    title: "Higher Quality",
    description:
      "We only recommend trusted, third-party tested brands.",
    image: "/images/home-v2/icons/quality.PNG",
    imageSize: "h-[112px] w-[112px]",
  },
  {
    title: "Better Value",
    description:
      "Get more quality for your money with transparent pricing.",
    image: "/images/home-v2/icons/value.PNG",
    imageSize: "h-[112px] w-[112px]",
  },
  {
    title: "Personalized Pouches",
    description:
      "We organize your supplements into morning & evening pouches.",
    image: "/images/home-v2/icons/personalized.PNG",
    imageSize: "h-[112px] w-[112px]",
  },
  {
    title: "Delivered Monthly",
    description:
      "Convenient, on-time delivery right to your door.",
    image: "/images/home-v2/icons/delivery.PNG",
    imageSize: "h-[112px] w-[112px]",
  },
 ];
 
 export default function BottomBenefits() {
  return (
    <section
      className="
        mt-10
        w-full
        border-y
        border-[#EDE3D8]
        bg-[#F7F2EB]
      ">
 
      <div
        className="
          mx-auto
          max-w-[1440px]
          px-5
          py-4
          lg:px-10
        ">
 
        <div
          className="
            grid
            grid-cols-1
            gap-y-4
            md:grid-cols-2
            xl:grid-cols-4
            xl:gap-x-8
          ">
 
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="
                flex
                min-w-0
                items-center
                gap-3
                px-2
                py-2
              ">
 
              <div
                className="
                  flex
                  h-[58px]
                  w-[64px]
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                ">
 
                <img
                  src={benefit.image}
                  alt=""
                  aria-hidden="true"
                  className={`
                    max-w-none
                    object-contain
                    ${benefit.imageSize}
                  `}
                />
              </div>
 
              <div className="min-w-0">
                <h3
                  className="
                    text-[13px]
                    font-semibold
                    leading-[1.35]
                    text-[#211B18]
                  ">
 
                  {benefit.title}
                </h3>
 
                <p
                  className="
                    mt-0.5
                    max-w-[185px]
                    text-[10px]
                    leading-[1.45]
                    text-[#514A46]
                  ">
 
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
 }