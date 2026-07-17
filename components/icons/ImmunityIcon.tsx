export default function ImmunityIcon({
    className = "",
   }: {
    className?: string;
   }) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round">
   
        <path d="M12 2.5L19 5.5V11c0 5-3 8.8-7 10.5C8 19.8 5 16 5 11V5.5L12 2.5Z" />
        <path d="M12 7v8" />
        <path d="M8 11h8" />
      </svg>
    );
   }
   