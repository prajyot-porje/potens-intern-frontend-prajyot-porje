import { Road, Trash2, Droplet, Lightbulb, ShieldAlert, HelpCircle } from "lucide-react";
import React from "react";

/**
 * Shared map of category keys to Lucide icons.
 * Prevents duplicate declarations across pages and components.
 */
export const iconMap: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }>
> = {
  Road,
  Trash2,
  Droplet,
  Lightbulb,
  ShieldAlert,
  HelpCircle,
};

export default iconMap;
