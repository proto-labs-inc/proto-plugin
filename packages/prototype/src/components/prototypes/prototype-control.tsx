"use client";

import type { ReactNode } from "react";

import { cn } from "@prototype/lib/utils";

import {
  PrototypeComponent,
  type PrototypeTargetProps,
} from "./prototype-target";

/** On-page prototype control for state pickers, variant tabs, and preview toggles. */
export function PrototypeControl({
  className,
  ...props
}: PrototypeTargetProps) {
  return <PrototypeComponent {...props} className={className} />;
}

type PrototypeControlGroupProps = {
  className?: string;
  children: ReactNode;
};

/** Multiple on-page controls grouped for layout. */
export function PrototypeControlGroup({
  className,
  children,
}: PrototypeControlGroupProps) {
  return <div className={cn(className)}>{children}</div>;
}
