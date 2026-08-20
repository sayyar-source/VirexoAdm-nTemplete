import type { ReactNode, SVGProps } from 'react'
import { cn } from '@/lib/cn'

/**
 * One 24×24 stroke-based icon set, inlined. Two reasons it is hand-rolled
 * rather than pulled from a library:
 *   1. `mirrored: true` is part of the icon's own definition. Which glyphs may
 *      flip in RTL is a *semantic* property (a chevron flips, a clock does not)
 *      and belongs next to the path, not at every call site.
 *   2. No icon-font/ligature dependency, so nothing to purge or tree-shake.
 */
const P = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </>
  ),
  analytics: (
    <>
      <path d="M3.5 3.5v17h17" />
      <path d="M7.5 15.5l3.5-4.5 3 3 4.5-6.5" />
    </>
  ),
  crm: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9.5" cy="10.5" r="2.2" />
      <path d="M6 16.8a3.6 3.6 0 0 1 7 0" />
      <path d="M15.5 9.5h3M15.5 13h3" />
    </>
  ),
  customers: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  leads: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M18 11h4.5M20.25 8.75v4.5" />
    </>
  ),
  deals: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3 12h18" />
    </>
  ),
  products: (
    <>
      <path d="M21 8.6v6.8a2 2 0 0 1-1.03 1.75l-7 3.83a2 2 0 0 1-1.94 0l-7-3.83A2 2 0 0 1 3 15.4V8.6a2 2 0 0 1 1.03-1.75l7-3.83a2 2 0 0 1 1.94 0l7 3.83A2 2 0 0 1 21 8.6Z" />
      <path d="M3.4 7.3 12 12l8.6-4.7M12 12v9.4" />
    </>
  ),
  orders: (
    <>
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17.5" cy="19.5" r="1.4" />
      <path d="M2.5 3.5h2.3l2.4 10.8a1.6 1.6 0 0 0 1.56 1.25h8.9a1.6 1.6 0 0 0 1.57-1.29L20.5 7H6" />
    </>
  ),
  reports: (
    <>
      <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M9 13.5h6M9 17h4" />
    </>
  ),
  users: (
    <>
      <circle cx="10" cy="8" r="3.3" />
      <path d="M3.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16.4 5.2a3 3 0 0 1 0 5.6" />
      <path d="M18.2 20a5.4 5.4 0 0 0-1.6-3.9" />
    </>
  ),
  roles: (
    <>
      <path d="M12 3.2l7.5 2.9v5.6c0 4.2-3.05 7.9-7.5 9.1-4.45-1.2-7.5-4.9-7.5-9.1V6.1Z" />
      <path d="M9 12.2l2.2 2.2 4-4.4" />
    </>
  ),
  // A ring-with-spokes gear is indistinguishable from the `sun` glyph at 18px,
  // and both appear in the same UI (nav + theme toggle). Sliders instead.
  settings: (
    <>
      <path d="M4 7h8M16.5 7h3.5M4 12h3.5M12 12h8M4 17h8M16.5 17h3.5" />
      <circle cx="14.25" cy="7" r="2.25" />
      <circle cx="9.75" cy="12" r="2.25" />
      <circle cx="14.25" cy="17" r="2.25" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.6 2.3c-.8.45-1.2 1.05-1.2 1.9" />
      <circle cx="12" cy="16.9" r=".95" fill="currentColor" stroke="none" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 16l-4-4 4-4" />
      <path d="M6 12h10" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9.5a6 6 0 1 0-12 0c0 4.8-2 5.9-2 5.9h16s-2-1.1-2-5.9" />
      <path d="M10.3 19.4a2 2 0 0 0 3.4 0" />
    </>
  ),
  addSquare: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.2" />
      <path d="M12 8.6v6.8M8.6 12h6.8" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chevronDown: <path d="M6.5 9.75l5.5 5.5 5.5-5.5" />,
  chevronEnd: <path d="M9.75 6l6 6-6 6" />,
  chevronStart: <path d="M14.25 6l-6 6 6 6" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  check: <path d="M5.5 12.8l4.3 4.2L18.5 7.5" />,
  minus: <path d="M6.5 12h11" />,
  filter: <path d="M3.5 5.5h17l-6.8 7.8v5.6l-3.4-1.8v-3.8Z" />,
  download: (
    <>
      <path d="M12 3.5v11" />
      <path d="M7.8 10.3 12 14.5l4.2-4.2" />
      <path d="M4.5 20h15" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  trendUp: (
    <>
      <path d="M3.5 16.5 9 11l4 4 7.5-7.5" />
      <path d="M15 7.5h5.5V13" />
    </>
  ),
  trendDown: (
    <>
      <path d="M3.5 7.5 9 13l4-4 7.5 7.5" />
      <path d="M15 16.5h5.5V11" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.9" />
      <path d="M12 2.2v2.4M12 19.4v2.4M2.2 12h2.4M19.4 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M5 19l1.7-1.7M17.3 6.7 19 5" />
    </>
  ),
  moon: <path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z" />,
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12.5" rx="2.2" />
      <path d="M9 20.2h6M12 16.5v3.7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M3.2 12h17.6" />
      <path d="M12 3.2c2.6 2.6 2.6 15.2 0 17.6-2.6-2.4-2.6-15 0-17.6Z" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.2a8.8 8.8 0 0 0 0 17.6c1.25 0 1.9-.9 1.9-1.85 0-1.6 1.2-2.25 2.4-2.25h1.6a2.9 2.9 0 0 0 2.9-2.9A8.8 8.8 0 0 0 12 3.2Z" />
      <circle cx="8.4" cy="10.2" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.6" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.4" width="15" height="10.1" rx="2.6" />
      <path d="M8 10.4V8a4 4 0 0 1 8 0v2.4" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.6" />
      <path d="M2.5 10h19" />
      <path d="M6 14.8h4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4.2 7.2 6.9 5.15a1.5 1.5 0 0 0 1.8 0L19.8 7.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8.5 3v4M15.5 3v4" />
    </>
  ),
  revenue: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2.6" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 10v4M18 10v4" />
    </>
  ),
  percent: (
    <>
      <path d="M19 5 5 19" />
      <circle cx="7.6" cy="7.6" r="2.6" />
      <circle cx="16.4" cy="16.4" r="2.6" />
    </>
  ),
  activity: <path d="M3 12h3.8l2.4-6.8 4 13.6 2.4-6.8H21" />,
  eye: (
    <>
      <path d="M2.6 12S6.2 5.6 12 5.6 21.4 12 21.4 12 17.8 18.4 12 18.4 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L20 8l-4-4L4 16Z" />
      <path d="m14.5 5.5 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="m6.6 7 .8 12.1A2 2 0 0 0 9.4 21h5.2a2 2 0 0 0 2-1.9L17.4 7" />
    </>
  ),
  grip: (
    <>
      <circle cx="9.5" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="17.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="17.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7.8v5" />
      <circle cx="12" cy="16.2" r=".95" fill="currentColor" stroke="none" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m8.3 12.4 2.8 2.8 4.9-5.4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 11.2v5.4" />
      <circle cx="12" cy="7.9" r=".95" fill="currentColor" stroke="none" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 4.4 2.8 17.2a2 2 0 0 0 1.73 3h14.94a2 2 0 0 0 1.73-3L13.7 4.4a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.6v4" />
      <circle cx="12" cy="16.7" r=".95" fill="currentColor" stroke="none" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 13.5h4l1.3 2.4h6.4l1.3-2.4h4" />
      <path d="M3.5 13.5 6 5.2A2 2 0 0 1 7.9 3.8h8.2A2 2 0 0 1 18 5.2l2.5 8.3v4.7a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2Z" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof P

/** Glyphs whose meaning is tied to reading direction. Everything else stays put. */
const MIRRORED = new Set<IconName>([
  'chevronEnd',
  'chevronStart',
  'logout',
  'trendUp',
  'trendDown',
  'activity',
  'analytics',
  'search',
])

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  /** Force-disable mirroring for a glyph that would normally flip. */
  noFlip?: boolean
}

export function Icon({ name, size = 20, className, noFlip, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(
        'shrink-0',
        MIRRORED.has(name) && !noFlip && 'flip-rtl',
        className,
      )}
      {...rest}
    >
      {P[name]}
    </svg>
  )
}
