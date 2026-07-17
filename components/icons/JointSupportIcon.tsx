export default function JointSupportIcon({
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
   
        <path d="M8.5 9.5l-2-2a2.1 2.1 0 0 1 0-3 2.1 2.1 0 0 1 3 0l2 2" />
        <path d="M15.5 14.5l2 2a2.1 2.1 0 0 1 0 3 2.1 2.1 0 0 1-3 0l-2-2" />
        <path d="M9.5 14.5l5-5" />
        <path d="M8.5 15.5l-1 1" />
        <path d="M15.5 8.5l1-1" />
      </svg>
    );
   }
   