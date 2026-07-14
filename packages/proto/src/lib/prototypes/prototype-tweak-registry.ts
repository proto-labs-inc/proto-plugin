import type { PrototypeTweaksRegistration } from "@prototype/lib/prototypes/prototype-tweak-types";
import { useEffect, useState } from "react";

type PrototypeTweakStore = {
  registration: PrototypeTweaksRegistration | null;
  listeners: Set<() => void>;
};

declare global {
  interface Window {
    __prototypeTweakStore?: PrototypeTweakStore;
  }
}

function getStore(): PrototypeTweakStore {
  if (typeof window === "undefined") {
    return { registration: null, listeners: new Set() };
  }

  if (!window.__prototypeTweakStore) {
    window.__prototypeTweakStore = {
      registration: null,
      listeners: new Set(),
    };
  }

  return window.__prototypeTweakStore;
}

function emitChange() {
  for (const listener of getStore().listeners) {
    listener();
  }
}

export function registerPrototypeTweaks(
  nextRegistration: PrototypeTweaksRegistration | null,
) {
  const store = getStore();
  store.registration = nextRegistration;
  emitChange();
}

export function getPrototypeTweaksRegistration() {
  return getStore().registration;
}

function subscribe(listener: () => void) {
  const store = getStore();
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

export function subscribePrototypeTweaks(listener: () => void) {
  return subscribe(listener);
}

export function usePrototypeTweaksRegistration() {
  const [registration, setRegistration] =
    useState<PrototypeTweaksRegistration | null>(() =>
      typeof window === "undefined" ? null : getPrototypeTweaksRegistration(),
    );

  useEffect(() => {
    setRegistration(getPrototypeTweaksRegistration());
    return subscribe(() => {
      setRegistration(getPrototypeTweaksRegistration());
    });
  }, []);

  return registration;
}

export function focusPrototypeTweak(tweakId: string) {
  const activeRegistration = getPrototypeTweaksRegistration();
  const tweak = activeRegistration?.items.find((item) => item.id === tweakId);
  if (!tweak) return null;

  activeRegistration?.navigateTo(tweakId);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const screenshotRoot = document.querySelector(
        "[data-prototype-screenshot]",
      );
      const target = screenshotRoot?.querySelector<HTMLElement>(
        `[data-prototype-target$=".${tweak.targetId}"]`,
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  return tweak.targetId;
}
