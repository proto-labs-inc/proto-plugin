import type { LucideIcon, LucideProps } from "lucide-react";
import {
  ArrowDownUp,
  CalendarDays,
  Clock,
  FilterX,
  Inbox,
  LayoutGrid,
  PanelBottom,
  Shapes,
  Smartphone,
  Table,
} from "lucide-react";

type VariantSetIconRule = {
  test: RegExp;
  icon: LucideIcon;
};

/** First match wins — order rules from most specific to broadest. */
const VARIANT_SET_ICON_RULES: VariantSetIconRule[] = [
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
