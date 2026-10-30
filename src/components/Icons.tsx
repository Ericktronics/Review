const PATHS = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M20 20l-4.2-4.2M17.5 10.75a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0z',
  shuffle: 'M3 7h3.5c2 0 3.2 1 4.3 2.6l2.4 4.8C14.3 16 15.5 17 17.5 17H21M3 17h3.5c1.4 0 2.4-.5 3.2-1.4M21 7h-3.5c-1.4 0-2.4.5-3.2 1.4M18 4l3 3-3 3M18 14l3 3-3 3',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  flame: 'M12 3c.5 3.5 5.5 5.5 5.5 11a5.5 5.5 0 0 1-11 0c0-2 .9-3.4 2-4.5.2 1.5 1 2.3 1.8 2.5C10 9 10.5 6 12 3z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      className={`flex-shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
