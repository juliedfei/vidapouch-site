export default function TrustBar() {
    const items = [
      {
        icon: "🛡️",
        title: "Personalized for you",
        subtitle: "Goals, lifestyle, and preferences",
      },
      {
        icon: "⚡",
        title: "Science-backed",
        subtitle: "Evidence-based recommendations",
      },
      {
        icon: "🔒",
        title: "Secure & private",
        subtitle: "Your data is always protected",
      },
    ];
   
    return (
      <section className="relative z-20 w-full px-10 pb-10">
        <div className="mx-auto max-w-[980px]">
          <div
            className="
              rounded-full
              border
              border-white/45
              bg-white/30
              backdrop-blur-[28px]
              shadow-[0_10px_30px_rgba(0,0,0,.05)]
            ">
   
            <div className="grid grid-cols-3 items-center px-10 py-5">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-center gap-3">
   
                  <div className="text-[24px] opacity-75">
                    {item.icon}
                  </div>
   
                  <div>
                    <div className="text-[15px] font-medium text-[#3B3B3B]">
                      {item.title}
                    </div>
   
                    <div className="mt-0.5 text-[12px] text-[#8A8A8A]">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
   }