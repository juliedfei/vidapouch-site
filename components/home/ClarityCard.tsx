type ClarityCardProps = {
    title: string;
    text: string;
   };
   
   export default function ClarityCard({
    title,
    text,
   }: ClarityCardProps) {
    return (
      <div
        className="
          rounded-[24px]
          border
          border-[#DDD7CF]
          bg-[#F3E9DD]/70
          p-6
          text-center
          shadow-[0_14px_40px_rgba(20,15,10,0.04)]
        ">
   
        <h3
          className="
            text-[22px]
            leading-tight
            tracking-[-0.025em]
            text-[#081620]
          "
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
   
          {title}
        </h3>
   
        <p className="mt-3 text-[15px] leading-7 text-[#475357]">
          {text}
        </p>
      </div>
    );
   }