import type { Redis } from "@upstash/redis";

import { getDedicatedRedis, getDedicatedRedisStatus } from "./client";

/** Global append-only list of user-action events. */
export const PROTOTYPE_TELEMETRY_KEY = "prototype-telemetry:events";

/** Snapshot of known prototype slugs, used to diff for creation/deletion. */
export const PROTOTYPE_TELEMETRY_KNOWN_PROTOTYPES_KEY =
  "prototype-telemetry:known-prototypes";

/** Cap the stored list so it cannot grow without bound. */
const MAX_STORED_EVENTS = 50_000;

export function getTelemetryRedis(): Redis {
  return getDedicatedRedis();
}

export function getTelemetryRedisStatus(): { ok: boolean; missing: string[] } {
  return getDedicatedRedisStatus();
}

type StoredTelemetryEvent = Record<string, unknown> & { name: string };

function isRecordEvent(value: unknown): value is StoredTelemetryEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

/**
 * Append events to the telemetry list (newest first) and trim to the cap.
 * Uses LPUSH + LTRIM instead of the read-modify-write pattern comments use,
 * so concurrent writers do not clobber each other.
 */
export async function appendPrototypeTelemetryEvents(
  events: unknown[],
): Promise<number> {
  const valid = events.filter(isRecordEvent);
  if (valid.length === 0) return 0;

  const redis = getTelemetryRedis();
  // LPUSH accepts multiple elements; the Upstash client serializes objects.
  await redis.lpush(PROTOTYPE_TELEMETRY_KEY, ...valid);
  await redis.ltrim(PROTOTYPE_TELEMETRY_KEY, 0, MAX_STORED_EVENTS - 1);
  return valid.length;
}

function buildServerEvent(
  name: string,
  ts: string,
  props: Record<string, unknown>,
): StoredTelemetryEvent {
  const rand = Math.random().toString(36).slice(2, 10);
  return {
    id: `srv_${Date.now().toString(36)}_${rand}`,
    name,
    props,
    slug: typeof props.slug === "string" ? props.slug : undefined,
    route: "/",
    ts,
    clientId: "server",
    sessionId: "server",
    origin: "server",
  };
}

export type PrototypeRegistrySnapshotEntry = {
  slug: string;
  title?: string;
};

/**
 * Compare the current prototype registry against the stored snapshot and
 * emit `prototype.created` / `prototype.deleted` telemetry for the diff.
 * The first run seeds the snapshot and emits nothing so the existing gallery
 * is not counted as a burst of creations.
 */
export async function reconcilePrototypeRegistry(
  current: PrototypeRegistrySnapshotEntry[],
): Promise<void> {
  const redis = getTelemetryRedis();
  const currentSlugs = current.map((entry) => entry.slug);

  const stored = await redis.get<string[]>(
    PROTOTYPE_TELEMETRY_KNOWN_PROTOTYPES_KEY,
  );

  if (!Array.isArray(stored)) {
    await redis.set(PROTOTYPE_TELEMETRY_KNOWN_PROTOTYPES_KEY, currentSlugs);
    return;
  }

  const storedSet = new Set(stored);
  const currentSet = new Set(currentSlugs);
  const nowIso = new Date().toISOString();

  const created = current.filter((entry) => !storedSet.has(entry.slug));
  const deleted = stored.filter((slug) => !currentSet.has(slug));

  if (created.length === 0 && deleted.length === 0) return;

  const events: StoredTelemetryEvent[] = [
    ...created.map((entry) =>
      buildServerEvent("prototype.created", nowIso, {
        slug: entry.slug,
        title: entry.title,
      }),
    ),
    ...deleted.map((slug) =>
      buildServerEvent("prototype.deleted", nowIso, { slug }),
    ),
  ];

  await appendPrototypeTelemetryEvents(events);
  await redis.set(PROTOTYPE_TELEMETRY_KNOWN_PROTOTYPES_KEY, currentSlugs);
}
