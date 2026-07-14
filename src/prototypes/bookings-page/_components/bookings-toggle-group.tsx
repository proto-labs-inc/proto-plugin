"use client";

import { PrototypeComponent } from "proto-plugin";
import classNames from "@calcom/ui/classNames";
import type { ReactNode } from "react";

type ToggleOption = {
  value: string;
  label: string | ReactNode;
  iconLeft?: ReactNode;
};

type BookingsToggleGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: ToggleOption[];
  className?: string;
};

export function BookingsToggleGroup({
  value,
  onValueChange,
  options,
  className,
}: BookingsToggleGroupProps) {
  return (
    <PrototypeComponent id="bookings-toggle-group" className={className}>
      <div
        className="bg-muted inline-flex gap-0.5 rounded-[10px] p-0.5 rtl:flex-row-reverse"
        role="group"
      >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(option.value)}
            className={classNames(
              "cursor-pointer rounded-lg border border-transparent p-1.5 text-sm leading-none transition",
              active
                ? "bg-default border-subtle text-default shadow-[0px_2px_3px_0px_rgba(0,0,0,0.03),0px_2px_2px_-1px_rgba(0,0,0,0.03)]"
                : "text-default hover:bg-subtle hover:text-emphasis",
            )}
          >
            <div className="flex items-center justify-center gap-1">
              {option.iconLeft ? (
                <span className="flex h-4 w-4 items-center">{option.iconLeft}</span>
              ) : null}
              {option.label}
            </div>
          </button>
        );
      })}
      </div>
    </PrototypeComponent>
  );
}
