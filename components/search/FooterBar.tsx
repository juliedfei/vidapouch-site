import {
    Star,
    ShieldCheck,
    Lock,
   } from "lucide-react";
   
   export default function FooterBar() {
    return (
      <section className="w-full border-t border-[#E8DED2] bg-[#F7F2EB]">
        <div
          className="
            mx-auto
            flex
            max-w-[1440px]
            flex-wrap
            items-center
            justify-center
            gap-6
            px-5
            py-4
            text-[13px]
            text-[#2B2B2B]
            lg:px-10
          ">
   
          <div className="flex items-center gap-2">
            <div className="flex text-[#FFC83D]">
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
            </div>
   
            <span>
              4.9/5 from 2,000+ reviews
            </span>
          </div>
   
          <div className="h-5 w-px bg-[#DED2C5]" />
   
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-[#B67A33]"
            />
   
            <span>
              100% Satisfaction Guarantee
            </span>
          </div>
   
          <div className="h-5 w-px bg-[#DED2C5]" />
   
          <div className="flex items-center gap-2">
            <Lock
              size={15}
              className="text-[#B67A33]"
            />
   
            <span>
              Secure &amp; Private
            </span>
          </div>
   
          <div className="h-5 w-px bg-[#DED2C5]" />
   
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🇺🇸</span>
   
            <span>
              Made in the USA
            </span>
          </div>
        </div>
      </section>
    );
   }
   