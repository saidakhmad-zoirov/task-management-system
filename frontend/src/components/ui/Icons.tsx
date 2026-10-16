import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const c = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const SearchIcon = (p: P) => (<svg {...c} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const PlusIcon = (p: P) => (<svg {...c} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const ArrowIcon = (p: P) => (<svg {...c} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const GridIcon = (p: P) => (<svg {...c} {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></svg>);
export const ListIcon = (p: P) => (<svg {...c} {...p}><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17" /></svg>);
export const UserIcon = (p: P) => (<svg {...c} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
export const LogoutIcon = (p: P) => (<svg {...c} {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" /></svg>);
export const MenuIcon = (p: P) => (<svg {...c} {...p}><path d="M4 7h16M4 12h16M4 17h10" /></svg>);
export const CloseIcon = (p: P) => (<svg {...c} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const TrashIcon = (p: P) => (<svg {...c} {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>);
export const EditIcon = (p: P) => (<svg {...c} {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" /></svg>);
export const CheckIcon = (p: P) => (<svg {...c} {...p}><path d="m5 12 4.5 4.5L19 7" /></svg>);
export const CalendarIcon = (p: P) => (<svg {...c} {...p}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>);
export const ClockIcon = (p: P) => (<svg {...c} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const BoltIcon = (p: P) => (<svg {...c} {...p}><path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3z" /></svg>);
