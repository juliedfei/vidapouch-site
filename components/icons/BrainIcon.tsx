export default function BrainIcon({
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
   
        <path d="M10.5 5.5C10.5 3.8 9.2 2.5 7.5 2.5S4.5 3.8 4.5 5.5c-1.7.3-3 1.8-3 3.6 0 1.6 1 3 2.4 3.5-.2.5-.4 1-.4 1.6 0 2 1.6 3.6 3.6 3.6.6 1.4 2 2.4 3.6 2.4 1.8 0 3.3-1.2 3.7-2.9.4.2.9.3 1.4.3 2 0 3.7-1.7 3.7-3.7 0-.7-.2-1.3-.5-1.9 1.3-.6 2.2-1.9 2.2-3.4 0-1.8-1.3-3.3-3-3.6 0-1.7-1.3-3-3-3s-3 1.3-3 3" />
        <path d="M10.5 8.5v7" />
        <path d="M7.5 10.5h3" />
        <path d="M10.5 14.5h3" />
        <path d="M13.5 8.5v7" />
      </svg>
    );
   }
   