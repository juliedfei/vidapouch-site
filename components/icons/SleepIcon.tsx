export default function SleepIcon({
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
   
        <path d="M18.5 14.5A7.5 7.5 0 0 1 9.5 5.5a8 8 0 1 0 9 9Z" />
      </svg>
    );
   }