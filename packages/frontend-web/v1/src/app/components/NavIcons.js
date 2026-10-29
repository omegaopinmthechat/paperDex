'use client';

export function HamburgerIcon({ size = 18, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="3" y1="5" x2="15" y2="5" />
      <line x1="3" y1="9" x2="15" y2="9" />
      <line x1="3" y1="13" x2="15" y2="13" />
    </svg>
  );
}

export function SearchIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

export function CloseIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function DashboardIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="3" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="7" width="5" height="7" rx="1" />
    </svg>
  );
}

export function MarketsIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 13h12" />
      <path d="M3 10l3-4 2.5 2 4-5" />
      <circle cx="12.5" cy="3" r="1" fill={color} stroke="none" />
    </svg>
  );
}

export function TradeIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="5.5" y1="2" x2="5.5" y2="4" />
      <rect x="4" y="4" width="3" height="6" rx="0.5" />
      <line x1="5.5" y1="10" x2="5.5" y2="14" />
      <line x1="10.5" y1="3" x2="10.5" y2="5.5" />
      <rect x="9" y="5.5" width="3" height="5" rx="0.5" />
      <line x1="10.5" y1="10.5" x2="10.5" y2="14" />
    </svg>
  );
}

export function PortfolioIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="12" height="9" rx="1.5" />
      <path d="M2 7h12" />
      <circle cx="11.5" cy="10" r="0.9" fill={color} stroke="none" />
      <path d="M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1" />
    </svg>
  );
}

export function ApiKeysIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="6" cy="7" r="3" />
      <path d="M8.5 9.5l5 5" />
      <path d="M11.5 12l1.5-1.5" />
      <path d="M13 13.5l1.5-1.5" />
    </svg>
  );
}

export function DocsIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3h7l3 3v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M10 3v3h3" />
      <line x1="5.5" y1="9" x2="10.5" y2="9" />
      <line x1="5.5" y1="11.5" x2="9" y2="11.5" />
    </svg>
  );
}

export function TerminalIcon({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="M5 6.5l2.5 2-2.5 2" />
      <line x1="9" y1="10.5" x2="11.5" y2="10.5" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 13, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 8h9M8.5 4l4 4-4 4" />
    </svg>
  );
}

