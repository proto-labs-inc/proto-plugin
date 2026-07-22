"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";

import {
  createTelemetryId,
  enqueuePrototypeTelemetryEvent,
  getTelemetryClientId,
  getTelemetrySessionId,
} from "./prototype-telemetry-client";
import type {
  PrototypeTelemetryEventName,
  PrototypeTelemetryEvent,
} from "./prototype-telemetry-types";

export type TrackEventOptions = {
  /** Override the slug derived from the current route. */
  slug?: string;
};

export type TrackEventFn = (
  name: PrototypeTelemetryEventName,
  props?: Record<string, unknown>,
  options?: TrackEventOptions,
) => void;

const noop: TrackEventFn = () => {};

const TelemetryContext = createContext<TrackEventFn | null>(null);

function extractSlugFromRoute(route: string): string | undefined {
  const match = /^\/prototypes\/([^/]+)/.exec(route);
  return match?.[1];
}

export function PrototypeTelemetryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const profile = useWorkspaceProfile();

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const track = useCallback<TrackEventFn>((name, props, options) => {
    if (typeof window === "undefined") return;
    const route =
      pathnameRef.current ?? window.location.pathname ?? "/";
    const slug = options?.slug ?? extractSlugFromRoute(route);
    const currentProfile = profileRef.current;

    const event: PrototypeTelemetryEvent = {
      id: createTelemetryId("e"),
      name,
      props,
      slug,
      route,
      ts: new Date().toISOString(),
      clientId: getTelemetryClientId(),
      sessionId: getTelemetrySessionId(),
      userName: currentProfile.userName || undefined,
      companyName: currentProfile.companyName || undefined,
    };

    enqueuePrototypeTelemetryEvent(event);
  }, []);

  useEffect(() => {
    if (!pathname) return;
    track("page.viewed", { route: pathname });
  }, [pathname, track]);

  return (
    <TelemetryContext.Provider value={track}>
      {children}
    </TelemetryContext.Provider>
  );
}

/**
 * Returns a stable `track(name, props?)` function. Safe to call outside a
 * provider (returns a no-op), so instrumented components never crash when
 * rendered in isolation (e.g. the design system).
 */
export function useTrackEvent(): TrackEventFn {
  return useContext(TelemetryContext) ?? noop;
}
