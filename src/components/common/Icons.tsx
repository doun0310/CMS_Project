import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

/* Issue Type Icons - Designed with modern Atlassian & Linear styling */
export const IconStory: React.FC<IconProps> = ({ size = 16, color = '#10b981', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="3" width="16" height="18" rx="3" fill={color} fillOpacity="0.15" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

export const IconTask: React.FC<IconProps> = ({ size = 16, color = '#3b82f6', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="3" fill={color} fillOpacity="0.15" />
    <path d="m9 12 2.2 2.2 4.3-4.4" strokeWidth="2.5" />
  </svg>
);

export const IconBug: React.FC<IconProps> = ({ size = 16, color = '#ef4444', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="7" y="8" width="10" height="12" rx="5" fill={color} fillOpacity="0.15" />
    <path d="M12 3v5M8 6l2.5 2.5M16 6 13.5 8.5M5 12h2M17 12h2M6 17l2-.5M18 17l-2-.5M12 20v2" />
  </svg>
);

export const IconEpic: React.FC<IconProps> = ({ size = 16, color = '#8b5cf6', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m13 2-8.5 11h7L10.5 22l9.5-11h-7L13 2z" fill={color} fillOpacity="0.2" />
  </svg>
);

export const IconFeature = IconStory;
export const IconWorkItem = IconTask;
export const IconInitiative = IconEpic;

export const IconSubtask: React.FC<IconProps> = ({ size = 16, color = '#06b6d4', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 3v11a2 2 0 0 0 2 2h9" strokeWidth="2" />
    <path d="m14 13 3 3-3 3" strokeWidth="2" />
  </svg>
);

export const IconLink: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

/* Priority Icons - Clean Chevrons & Indicators */
export const PriorityHighest: React.FC<IconProps> = ({ size = 16, color = '#dc2626', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 11l5-5 5 5M7 18l5-5 5 5" />
  </svg>
);

export const PriorityHigh: React.FC<IconProps> = ({ size = 16, color = '#f97316', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 15l5-5 5 5" />
  </svg>
);

export const PriorityMedium: React.FC<IconProps> = ({ size = 16, color = '#eab308', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 9h14M5 15h14" />
  </svg>
);

export const PriorityLow: React.FC<IconProps> = ({ size = 16, color = '#10b981', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 9l5 5 5-5" />
  </svg>
);

export const PriorityLowest: React.FC<IconProps> = ({ size = 16, color = '#3b82f6', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 6l5 5 5-5M7 13l5 5 5-5" />
  </svg>
);

/* General Navigation & Action Icons */
export const IconSearch: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconPlus: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14M12 5v14" />
  </svg>
);

export const IconFilter: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill={color} fillOpacity="0.1" />
  </svg>
);

export const IconMoon: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill={color} fillOpacity="0.15" />
  </svg>
);

export const IconSun: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" fill={color} fillOpacity="0.15" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const IconChevronDown: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const IconChevronLeft: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({ size = 14, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const IconBoard: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="3" rx="3" fill={color} fillOpacity="0.08" />
    <path d="M9 3v18M15 3v18" />
  </svg>
);

/* Backlog Icon: Natural stacked list with items for Backlog navigation */
export const IconBacklog: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="4" rx="1.5" fill={color} fillOpacity="0.15" />
    <rect x="3" y="10" width="18" height="4" rx="1.5" fill={color} fillOpacity="0.15" />
    <rect x="3" y="16" width="18" height="4" rx="1.5" fill={color} fillOpacity="0.15" />
    <path d="M7 6h10M7 12h10M7 18h10" strokeWidth="2.5" />
  </svg>
);

export const IconTimeline: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="3" rx="3" fill={color} fillOpacity="0.08" />
    <path d="M7 8h10M7 12h6M10 16h7" strokeWidth="2.5" />
  </svg>
);

export const IconReports: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3v18h18" strokeWidth="2" />
    <path d="m19 9-5 5-4-4-3 3" strokeWidth="2.5" />
    <circle cx="19" cy="9" r="2" fill={color} />
  </svg>
);

export const IconAutomation: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="5" fill={color} fillOpacity="0.15" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    <polygon points="13 8 9 13 12 13 11 16 15 11 12 11 13 8" fill={color} />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" fill={color} fillOpacity="0.1" />
    <circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.2" />
  </svg>
);

export const IconX: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconMessage: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={color} fillOpacity="0.1" />
  </svg>
);

export const IconClock: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" fill={color} fillOpacity="0.1" /><polyline points="12 6 12 12 16 14" strokeWidth="2.5" />
  </svg>
);

export const IconCalendar: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="4" rx="3" fill={color} fillOpacity="0.1" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const IconTrash: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" fill={color} fillOpacity="0.1" />
  </svg>
);

export const IconPlay: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="5 3 19 12 5 21 5 3" fill={color} />
  </svg>
);

export const IconDownload: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" fill={color} fillOpacity="0.15" />
    <circle cx="12" cy="7" r="4" fill={color} fillOpacity="0.15" />
  </svg>
);

export const IconZap: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} fillOpacity="0.25" />
  </svg>
);

export const IconReset: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);

export const IconRetro: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
    <polyline points="21 3 21 8 16 8" strokeWidth="2.5" />
  </svg>
);

export const IconBell: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill={color} fillOpacity="0.15" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const IconTarget: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" fill={color} fillOpacity="0.05" />
    <circle cx="12" cy="12" r="6" fill={color} fillOpacity="0.15" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

export const IconCheckCircle: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" fill={color} fillOpacity="0.1" />
    <path d="m9 12 2 2 4-4" strokeWidth="2.5" />
  </svg>
);

export const IconAlertTriangle: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m10.3 3.3-8 14A2 2 0 0 0 4 20.3h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z" fill={color} fillOpacity="0.15" />
    <path d="M12 9v4M12 17h.01" strokeWidth="2.5" />
  </svg>
);

export const IconXCircle: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" fill={color} fillOpacity="0.1" />
    <path d="m15 9-6 6M9 9l6 6" strokeWidth="2.5" />
  </svg>
);

/* Product-navigation icons */
export const IconMyWork: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="3" width="16" height="18" rx="3" fill={color} fillOpacity="0.1" />
    <path d="m8 9 2 2 4-4M8 15h8" strokeWidth="2" />
  </svg>
);

export const IconArchitecture: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 2 9 5-9 5-9-5 9-5Z" fill={color} fillOpacity="0.2" />
    <path d="m3 12 9 5 9-5M3 17 9 22l9-5" strokeWidth="2" />
  </svg>
);

export const IconPortfolio: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="6" width="18" height="15" rx="3" fill={color} fillOpacity="0.12" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 11h18" strokeWidth="2" />
  </svg>
);

export const IconRetroBoard: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="16" rx="3" fill={color} fillOpacity="0.08" />
    <path d="M9 4v16M15 4v16" strokeWidth="2" />
    <rect x="5" y="7" width="2.5" height="3" rx="0.5" fill={color} />
    <rect x="11" y="7" width="2.5" height="5" rx="0.5" fill={color} />
    <rect x="17" y="7" width="2.5" height="4" rx="0.5" fill={color} />
  </svg>
);

export const IconRoadmap: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 20V5m0 3h10l2-3h4v10h-7l-2 3H4" fill={color} fillOpacity="0.1" />
    <circle cx="4" cy="20" r="1.5" fill={color} />
  </svg>
);

export const IconAnalytics: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const IconAiSpark: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 2 2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2Z" fill={color} fillOpacity="0.25" />
    <path d="m19 15 1.1 2.9L23 19l-2.9 1.1L19 23l-1.1-2.9L15 19l2.9-1.1L19 15Z" fill={color} fillOpacity="0.25" />
  </svg>
);

export const IconUsers: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="9" cy="8" r="3" fill={color} fillOpacity="0.15" />
    <path d="M3 20v-1a6 6 0 0 1 12 0v1" fill={color} fillOpacity="0.15" />
    <path d="M17 4a3 3 0 0 1 0 5.8M21 20v-1a6 6 0 0 0-3.5-5.5" />
  </svg>
);

export const IconThumbUp: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m0 11V11m0 11h9.5a3 3 0 0 0 2.9-2.2l1.1-4A3 3 0 0 0 17.6 12H14l.6-4.2A3 3 0 0 0 11.6 4L7 11" fill={color} fillOpacity="0.1" />
  </svg>
);

export const IconCopy: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" fill={color} fillOpacity="0.1" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const IconFolder: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill={color} fillOpacity="0.15" />
  </svg>
);

export const IconGlobe: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" fill={color} fillOpacity="0.1" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const IconPalette: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.75 1.7-1.67 0-.42-.16-.84-.46-1.16-.3-.32-.46-.74-.46-1.17 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z" fill={color} fillOpacity="0.1" />
  </svg>
);

export const IconDatabase: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" fill={color} fillOpacity="0.15" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const IconUpload: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill={color} fillOpacity="0.1" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2.5" />
  </svg>
);

export const IconStandup: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill={color} fillOpacity="0.15" />
    <circle cx="9" cy="7" r="4" fill={color} fillOpacity="0.15" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconRelease: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill={color} fillOpacity="0.15" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" fill={color} fillOpacity="0.15" />
    <path d="M9 12H4.5M15 9V4.5" />
  </svg>
);

export const IconShield: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} fillOpacity="0.15" />
  </svg>
);

export const IconHeartPulse: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" fill={color} fillOpacity="0.1" />
    <path d="M4 12h3l2 -4l3 8l2 -4h4" strokeWidth="2" />
  </svg>
);

export const IconBrain: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.5 2a4.5 4.5 0 0 1 4.5 4.5V7a2.5 2.5 0 0 1 0 5v1a2.5 2.5 0 0 1 0 5v.5A4.5 4.5 0 0 1 9.5 22H9a4.5 4.5 0 0 1-4.5-4.5V17a2.5 2.5 0 0 1 0-5v-1a2.5 2.5 0 0 1 0-5V6.5A4.5 4.5 0 0 1 9 2h.5Z" fill={color} fillOpacity="0.1" />
    <path d="M14.5 2a4.5 4.5 0 0 1 4.5 4.5V7a2.5 2.5 0 0 1 0 5v1a2.5 2.5 0 0 1 0 5v.5A4.5 4.5 0 0 1 14.5 22H15a4.5 4.5 0 0 0 4.5-4.5V17a2.5 2.5 0 0 0 0-5v-1a2.5 2.5 0 0 0 0-5V6.5A4.5 4.5 0 0 0 15 2h-.5Z" fill={color} fillOpacity="0.1" />
    <path d="M12 4v16" strokeWidth="2" />
  </svg>
);

export const IconScale: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" fill={color} fillOpacity="0.15" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" fill={color} fillOpacity="0.15" />
    <path d="M7 21h10M12 3v18M3 7h18" strokeWidth="2" />
  </svg>
);

export const IconUserPlus: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill={color} fillOpacity="0.15" />
    <circle cx="8.5" cy="7" r="4" fill={color} fillOpacity="0.15" />
    <line x1="20" y1="8" x2="20" y2="14" strokeWidth="2.5" />
    <line x1="17" y1="11" x2="23" y2="11" strokeWidth="2.5" />
  </svg>
);

export const IconLogout: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const IconPalmtree: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h11z" fill={color} fillOpacity="0.15" />
    <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-9" fill={color} fillOpacity="0.15" />
    <path d="M12 22V8" strokeWidth="2.5" />
  </svg>
);

export const IconBriefcase: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="14" x="2" y="7" rx="3" fill={color} fillOpacity="0.15" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const IconStethoscope: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" fill={color} fillOpacity="0.2" />
  </svg>
);

export const IconCreditCard: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="5" width="20" height="14" rx="3" fill={color} fillOpacity="0.15" />
    <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
    <line x1="6" y1="15" x2="10" y2="15" strokeWidth="2" />
  </svg>
);

export const IconPricing = IconCreditCard;

export const IconBudget: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="6" width="20" height="13" rx="3" fill={color} fillOpacity="0.12" />
    <path d="M16 12a2 2 0 1 0 0 .01" strokeWidth="2.5" />
    <path d="M6 12h5M2 10h20" strokeWidth="1.5" />
  </svg>
);

export const IconPieChart: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" fill={color} fillOpacity="0.12" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" fill={color} fillOpacity="0.25" />
  </svg>
);

export const IconActivity: React.FC<IconProps> = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 12 18 12 14 21 10 3 6 12 2 12" strokeWidth="2.2" />
  </svg>
);

export const IconServer: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="8" rx="2" fill={color} fillOpacity="0.15" />
    <rect x="2" y="14" width="20" height="8" rx="2" fill={color} fillOpacity="0.15" />
    <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
    <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
  </svg>
);

export const IconCode: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="16 18 22 12 16 6" strokeWidth="2.5" />
    <polyline points="8 6 2 12 8 18" strokeWidth="2.5" />
  </svg>
);

export const IconHandshake: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a2 2 0 0 0 0-2.8l-3.1-3.1a2 2 0 0 0-2.8 0l-1.8 1.8" fill={color} fillOpacity="0.15" />
    <path d="M18 11V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
  </svg>
);

export const IconPackage: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16.5 9.4 7.55 4.24a2 2 0 0 0-2 0l-3 1.73a2 2 0 0 0-1 1.73v10.6a2 2 0 0 0 1 1.73l3 1.73a2 2 0 0 0 2 0l8.95-5.16a2 2 0 0 0 1-1.73V11.13a2 2 0 0 0-1-1.73Z" fill={color} fillOpacity="0.12" />
    <path d="m3.27 6.96 8.73 5.05M12 22.08V12" strokeWidth="2" />
  </svg>
);

export const IconRefresh: React.FC<IconProps> = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);






