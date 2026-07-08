"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "../../lib/utils";

export type OptionSelectItem<T extends string = string> = {
  value: T;
  label: string;
};

type OptionSelectProps<T extends string = string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly OptionSelectItem<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  children?: ReactNode;
};

function OptionSelect<T extends string>({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  disabled,
  className,
  triggerClassName,
  contentClassName,
  align = "start",
  children,
}: OptionSelectProps<T>) {
  const activeLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-auto justify-between gap-2 font-normal",
            triggerClassName,
            className,
          )}
        >
          {children ?? (
            <>
              <span className="truncate">{activeLabel}</span>
              <ChevronDown className="size-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={contentClassName}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onValueChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { OptionSelect };
