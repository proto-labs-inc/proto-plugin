import {
  PROTOTYPE_TELEMETRY_ENDPOINT,
  type PrototypeTelemetryEvent,
} from "./prototype-telemetry-types";

const CLIENT_ID_KEY = "prototype-telemetry-client-id";
const SESSION_ID_KEY = "prototype-telemetry-session-id";
const FLUSH_INTERVAL_MS = 5_000;
const MAX_QUEUE_BEFORE_FLUSH = 100;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function createTelemetryId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/** Anonymous, persistent per-browser identifier. */
export function getTelemetryClientId(): string {
  if (!isBrowser()) return "server";
  try {
    let id = window.localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = createTelemetryId("c");
      window.localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

/** Per-tab identifier, reset when the tab/session ends. */
export function getTelemetrySessionId(): string {
  if (!isBrowser()) return "server";
  try {
    let id = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = createTelemetryId("s");
      window.sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return createTelemetryId("s");
  }
}

class PrototypeTelemetryQueue {
  private queue: PrototypeTelemetryEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listenersAttached = false;

  enqueue(event: PrototypeTelemetryEvent): void {
    if (!isBrowser()) return;
    this.queue.push(event);
    this.attachUnloadListeners();
    if (this.queue.length >= MAX_QUEUE_BEFORE_FLUSH) {
      void this.flush();
      return;
    }
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.timer !== null) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private attachUnloadListeners(): void {
    if (this.listenersAttached || !isBrowser()) return;
    this.listenersAttached = true;
    const flushWithBeacon = () => void this.flush(true);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushWithBeacon();
    });
    window.addEventListener("pagehide", flushWithBeacon);
  }

  async flush(useBeacon = false): Promise<void> {
    if (!isBrowser() || this.queue.length === 0) return;
    this.clearTimer();
    const batch = this.queue.splice(0, this.queue.length);
    const body = JSON.stringify(batch);

    try {
      if (
        useBeacon &&
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        const blob = new Blob([body], { type: "application/json" });
        const delivered = navigator.sendBeacon(
          PROTOTYPE_TELEMETRY_ENDPOINT,
          blob,
        );
        if (delivered) return;
      }

      await fetch(PROTOTYPE_TELEMETRY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    } catch {
      // Telemetry must never surface errors to the user. Drop on failure.
    }
  }
}

let queueSingleton: PrototypeTelemetryQueue | null = null;

function getQueue(): PrototypeTelemetryQueue {
  if (!queueSingleton) {
    queueSingleton = new PrototypeTelemetryQueue();
  }
  return queueSingleton;
}

export function enqueuePrototypeTelemetryEvent(
  event: PrototypeTelemetryEvent,
): void {
  getQueue().enqueue(event);
}

export function flushPrototypeTelemetry(useBeacon = false): void {
  void getQueue().flush(useBeacon);
}
