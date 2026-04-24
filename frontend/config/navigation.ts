import type { LucideIcon } from "lucide-react";
import { AlertTriangle, BarChart3, Globe, LayoutDashboard, ScrollText } from "lucide-react";

export interface NavigationItem {
  label: string;
  href: (projectId: string) => string;
  icon: LucideIcon;
}

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: (projectId) => `/projects/${projectId}/dashboard`,
    icon: LayoutDashboard,
  },
  {
    label: "APIs",
    href: (projectId) => `/projects/${projectId}/apis`,
    icon: Globe,
  },
  {
    label: "Incidents",
    href: (projectId) => `/projects/${projectId}/incidents`,
    icon: AlertTriangle,
  },
  {
    label: "Logs",
    href: (projectId) => `/projects/${projectId}/logs`,
    icon: ScrollText,
  },
  {
    label: "Alerts",
    href: (projectId) => `/projects/${projectId}/alerts`,
    icon: BarChart3,
  },
];
