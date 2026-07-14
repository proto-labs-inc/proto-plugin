"use client";

import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";

import {
  isAllowedComponentTargetId,
  type PrototypeComponentRegistry,
} from "@prototype/lib/prototypes/prototype-component-registry";
import { cn } from "@prototype/lib/utils";

export const PROTOTYPE_TARGET_ATTR = "data-prototype-target";

const PrototypeSlugContext = createContext<string | null>(null);
const PrototypeRegistryContext =
  createContext<PrototypeComponentRegistry | null>(null);

export function PrototypeTargetIdProvider({
  slug,
  registry,
  children,
}: {
  slug: string;
  registry?: PrototypeComponentRegistry;
  children: ReactNode;
}) {
  return (
    <PrototypeSlugContext.Provider value={slug}>
      <PrototypeRegistryContext.Provider value={registry ?? null}>
        {children}
      </PrototypeRegistryContext.Provider>
    </PrototypeSlugContext.Provider>
  );
}

export function usePrototypeSlug(): string | null {
  return useContext(PrototypeSlugContext);
}

export function buildPrototypeTargetId(slug: string, id: string): string {
  return `${slug}.${id}`;
}

export function getPrototypeTargetElement(
  element: HTMLElement | null,
): HTMLElement | null {
  if (!element) return null;
  const anchor = element.closest(`[${PROTOTYPE_TARGET_ATTR}]`);
  return anchor instanceof HTMLElement ? anchor : null;
}

export function getPrototypeTargetIdFromElement(
  element: HTMLElement | null,
): string | null {
  const anchor = getPrototypeTargetElement(element);
  if (!anchor) return null;
  return anchor.getAttribute(PROTOTYPE_TARGET_ATTR);
}

export type PrototypeTargetProps<T extends ElementType = "div"> = {
  /** Registry segment id — must be listed in the prototype's component-ids.ts */
  id: string;
  label?: string;
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "id" | "children" | "className">;

function defaultLabel(id: string): string {
  return id
    .split(".")
    .map((part) => part.replace(/-/g, " "))
    .join(" — ");
}

export function PrototypeTarget<T extends ElementType = "div">({
  id,
  label,
  as,
  className,
  children,
  ...rest
}: PrototypeTargetProps<T>) {
  const slug = usePrototypeSlug();
  const componentRegistry = useContext(PrototypeRegistryContext);
  const Component = (as ?? "div") as ElementType;
  const fullId = slug ? buildPrototypeTargetId(slug, id) : id;
  const displayLabel = label ?? defaultLabel(id);

  if (
    process.env.NODE_ENV !== "production" &&
    componentRegistry &&
    !isAllowedComponentTargetId(id, componentRegistry)
  ) {
    console.error(
      `[PrototypeTarget] Unregistered id "${id}". Add it to the prototype component-ids registry.`,
    );
  }

  return (
    <Component
      {...rest}
      className={cn(className)}
      {...{
        [PROTOTYPE_TARGET_ATTR]: fullId,
        "data-element": displayLabel,
      }}
    >
      {children}
    </Component>
  );
}

/** Required root wrapper for every prototype UI component (see AGENTS.md). */
export const PrototypeComponent = PrototypeTarget;
