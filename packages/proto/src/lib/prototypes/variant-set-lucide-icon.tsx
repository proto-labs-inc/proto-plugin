import type { LucideIcon, LucideProps } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownUp,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Clock,
  Columns3,
  FileSpreadsheet,
  FilterX,
  Hexagon,
  Inbox,
  LayoutGrid,
  LayoutList,
  LayoutTemplate,
  PanelsTopLeft,
  MessageSquareText,
  Palette,
  PanelBottom,
  PanelBottomOpen,
  Send,
  Shapes,
  Smartphone,
  Sparkles,
  Table,
} from "lucide-react";

type VariantSetIconRule = {
  test: RegExp;
  icon: LucideIcon;
};

/** First match wins — order rules from most specific to broadest. */
const VARIANT_SET_ICON_RULES: VariantSetIconRule[] = [
  { test: /event-types-page-layout|event types page layout/i, icon: PanelsTopLeft },
  { test: /automat-analytics|analytics layout/i, icon: BarChart3 },
  { test: /grid-error-state-layout|error state layout/i, icon: AlertTriangle },
  { test: /grid-empty-state-layout|empty state layout/i, icon: FileSpreadsheet },
  { test: /insert-column-layout|add column layout/i, icon: Columns3 },
  // proto-partner-page explorations
  { test: /creator-attribution|creator attribution/i, icon: BadgeCheck },
  { test: /submit-modal|submit modal/i, icon: Send },
  { test: /mobile-panel-motion|mobile panel motion/i, icon: PanelBottomOpen },
  { test: /mobile-picker-layout|mobile picker layout/i, icon: LayoutList },
  {
    test: /invite-follow-up-shape-layout|follow-up shape layout/i,
    icon: LayoutTemplate,
  },
  { test: /invite-animations|invite animations/i, icon: Sparkles },
  { test: /shape-color-picker|shape & color picker/i, icon: Palette },
  { test: /proto-shapes|proto shapes/i, icon: Hexagon },
  { test: /invite-copy|invite copy/i, icon: MessageSquareText },
  { test: /retention|expir|before/i, icon: Clock },
  { test: /calendar|date.?picker|date-range/i, icon: CalendarDays },
  { test: /mobile/i, icon: Smartphone },
  { test: /order|sort/i, icon: ArrowDownUp },
  { test: /filter/i, icon: FilterX },
  { test: /no.?data|empty/i, icon: Inbox },
  { test: /table|row/i, icon: Table },
  { test: /footer|dock/i, icon: PanelBottom },
  { test: /icon/i, icon: Shapes },
];

export function resolveVariantSetLucideIcon(id: string, label: string): LucideIcon {
  const haystack = `${id} ${label}`.toLowerCase();

  for (const rule of VARIANT_SET_ICON_RULES) {
    if (rule.test.test(haystack)) return rule.icon;
  }

  return LayoutGrid;
}

type VariantSetLucideIconProps = LucideProps & {
  variantSetId: string;
  variantSetLabel: string;
};

export function VariantSetLucideIcon({
  variantSetId,
  variantSetLabel,
  ...props
}: VariantSetLucideIconProps) {
  const Icon = resolveVariantSetLucideIcon(variantSetId, variantSetLabel);
  return <Icon {...props} />;
}
