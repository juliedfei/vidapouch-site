export default function EnergyIcon({
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
   
        <path d="M13.5 2L6.5 13H11L9.5 22L17.5 10.5H13L13.5 2Z" />
      </svg>
    );
   }