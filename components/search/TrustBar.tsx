type TrustItem = {
  title: string;
  image: string;
  imageClassName: string;
 };
 
 const trustItems: TrustItem[] = [
  {
    title: "Third-party tested",
    image: "/images/home-v2/trust/third-party-tested.PNG",
    imageClassName: "h-[96px] w-[96px]",
  },
  {
    title: "Quality you can trust",
    image: "/images/home-v2/trust/quality-you-can-trust.PNG",
    imageClassName: "h-[96px] w-[96px]",
  },
  {
    title: "Transparent pricing",
    image: "/images/home-v2/trust/transparent-pricing.PNG",
    imageClassName: "h-[82px] w-[82px]",
  },
  {
    title: "Personalized for you",
    image: "/images/home-v2/trust/personalized-for-you.PNG",
    imageClassName: "h-[96px] w-[96px]",
  },
 ];
 
 export default function TrustBar() {
  return (
    <section className="relative z-30 -mt-[72px]">
      <div
        className="
          w-full
          rounded-[10px]
          border
          border-[#E7DED4]
          bg-[#FCFAF7]
          shadow-[0_5px_18px_rgba(57,39,25,0.06)]
        ">
 
        <div
          className="
            grid
            grid-cols-2
            gap-x-3
            gap-y-2
            px-4
            py-3
            md:grid-cols-4
            md:px-8
          ">
 
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="
                flex
                min-h-[40px]
                items-center
                justify-center
                gap-2.5
              ">
 
              <div
                className="
                  flex
                  h-[34px]
                  w-[42px]
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                ">
 
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  className={`
                    max-w-none
                    object-contain
                    ${item.imageClassName}
                  `}
                />
              </div>
 
              <span
                className="
                  whitespace-nowrap
                  text-[13px]
                  font-medium
                  text-[#28211E]
                ">
 
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
 }
 