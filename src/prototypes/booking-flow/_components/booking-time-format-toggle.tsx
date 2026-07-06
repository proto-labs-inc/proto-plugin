"use client";

import { SegmentedControl } from "@calcom/ui/components/segmented-control";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";

type BookingTimeFormatToggleProps = {
  use24h: boolean;
  onChange: (use24h: boolean) => void;
  compact?: boolean;
};

export function BookingTimeFormatToggle({
  use24h,
  onChange,
  compact = false,
}: BookingTimeFormatToggleProps) {
  return (
    <PrototypeComponent id="booking-time-format-toggle">
      <SegmentedControl
        data-testid="time-format-toggle"
        className={compact ? "w-[88px]" : "w-[96px]"}
        value={use24h ? "24h" : "12h"}
        onChange={(value) => onChange(value === "24h")}
        data={[
          { value: "12h", label: "12h" },
          { value: "24h", label: "24h" },
        ]}
      />
    </PrototypeComponent>
  );
}
