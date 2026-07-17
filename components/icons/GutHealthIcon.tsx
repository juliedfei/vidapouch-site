export default function GutHealthIcon({
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
   
        <path d="M9 3.5c-2 0-3.5 1.6-3.5 3.6 0 .9.3 1.8.9 2.4-.9.8-1.4 2-1.4 3.3 0 2.4 1.9 4.2 4.2 4.2.2 2 1.9 3.5 4 3.5 2.3 0 4.2-1.9 4.2-4.2 0-.6-.1-1.1-.3-1.6 1.4-.7 2.4-2.1 2.4-3.8 0-1.8-1.1-3.3-2.7-3.9.1-.3.2-.7.2-1.1 0-2-1.6-3.6-3.6-3.6-1.2 0-2.3.6-3 1.5-.6-.9-1.7-1.5-2.9-1.5Z" />
        <path d="M12 5v14" />
        <path d="M9.5 8.5c1 .5 1.5 1.3 1.5 2.5" />
        <path d="M14.5 7.5c-1 .5-1.5 1.3-1.5 2.5" />
        <path d="M14.5 12.5c-1 .5-1.5 1.3-1.5 2.5" />
        <path d="M9.5 13.5c1 .5 1.5 1.3 1.5 2.5" />
      </svg>
    );
   }