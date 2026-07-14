type ScheduleCancel = () => void;

type RunAfterQuietPeriodOptions = {
  /** Do not start the quiet timer until this long after mount. */
  minDelayMs?: number;
  /** Run after this long without pointer/keyboard/scroll activity. */
  quietMs?: number;
  /** Force-run after this long even if the user keeps interacting. */
  maxWaitMs?: number;
};

const QUIET_ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "scroll",
  "touchstart",
] as const;

/**
 * Defer work until the user has stopped interacting (or maxWaitMs elapses).
 * Keeps main-thread-heavy jobs like DOM-to-image off the first-load path.
 */
export function runAfterQuietPeriod(
  callback: () => void,
  {
    minDelayMs = 2000,
    quietMs = 3000,
    maxWaitMs = 45000,
  }: RunAfterQuietPeriodOptions = {},
): ScheduleCancel {
  if (typeof window === "undefined") return () => {};

  let cancelled = false;
  let started = false;
  let minDelayTimer: ReturnType<typeof setTimeout> | null = null;
  let quietTimer: ReturnType<typeof setTimeout> | null = null;
  let maxWaitTimer: ReturnType<typeof setTimeout> | null = null;

  const clearQuietTimer = () => {
    if (quietTimer) {
      clearTimeout(quietTimer);
      quietTimer = null;
    }
  };

  const run = () => {
    if (cancelled || started) return;
    started = true;
    removeActivityListeners();
    clearQuietTimer();
    if (maxWaitTimer) {
      clearTimeout(maxWaitTimer);
      maxWaitTimer = null;
    }
    callback();
  };

  const scheduleQuiet = () => {
    clearQuietTimer();
    quietTimer = setTimeout(run, quietMs);
  };

  const onActivity = () => {
    if (cancelled || started) return;
    scheduleQuiet();
  };

  const addActivityListeners = () => {
    for (const event of QUIET_ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }
  };

  const removeActivityListeners = () => {
    for (const event of QUIET_ACTIVITY_EVENTS) {
      window.removeEventListener(event, onActivity);
    }
  };

  minDelayTimer = setTimeout(() => {
    if (cancelled || started) return;
    minDelayTimer = null;
    addActivityListeners();
    scheduleQuiet();
    maxWaitTimer = setTimeout(run, maxWaitMs);
  }, minDelayMs);

  return () => {
    cancelled = true;
    if (minDelayTimer) clearTimeout(minDelayTimer);
    if (maxWaitTimer) clearTimeout(maxWaitTimer);
    clearQuietTimer();
    removeActivityListeners();
  };
}

/** @deprecated Prefer runAfterQuietPeriod for screenshot capture. */
export function runWhenIdle(callback: () => void, timeout = 2000): ScheduleCancel {
  if (typeof window === "undefined") return () => {};

  const requestIdle = window.requestIdleCallback;
  if (typeof requestIdle === "function") {
    const handle = requestIdle(() => callback(), { timeout });
    return () => window.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, 0);
  return () => window.clearTimeout(handle);
}
