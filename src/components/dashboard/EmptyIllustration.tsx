export function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="10" y="10" width="76" height="52" rx="4" fill="#EEF0F5" stroke="#C9CEDB" strokeWidth="1.5" />
      <rect x="10" y="10" width="76" height="10" rx="4" fill="#D9DEEA" />
      <circle cx="18" cy="15" r="1.4" fill="#8892A6" />
      <circle cx="23" cy="15" r="1.4" fill="#8892A6" />
      <circle cx="28" cy="15" r="1.4" fill="#8892A6" />
      <g stroke="#E4127C" strokeWidth="2" strokeLinecap="round">
        <line x1="38" y1="34" x2="58" y2="54" />
        <line x1="58" y1="34" x2="38" y2="54" />
      </g>
      <circle cx="68" cy="48" r="8" fill="#fff" stroke="#E4127C" strokeWidth="2" />
      <line x1="73" y1="53" x2="80" y2="60" stroke="#E4127C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
