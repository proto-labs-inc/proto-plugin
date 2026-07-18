import { NextRequest, NextResponse } from "next/server";

import {
  appendPrototypeTelemetryEvents,
  getTelemetryRedisStatus,
} from "./redis/prototype-telemetry";

function telemetryUnavailableResponse() {
  const status = getTelemetryRedisStatus();
  return NextResponse.json(
    {
      error: "Telemetry storage is not configured.",
      missing: status.missing,
    },
    { status: 503 },
  );
}

export async function POST(request: NextRequest) {
  const status = getTelemetryRedisStatus();
  if (!status.ok) {
    return telemetryUnavailableResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const events = Array.isArray(body)
    ? body
    : Array.isArray((body as { events?: unknown })?.events)
      ? (body as { events: unknown[] }).events
      : null;

  if (!events) {
    return NextResponse.json(
      { error: "Body must be an array of events" },
      { status: 400 },
    );
  }

  const receivedAt = new Date().toISOString();
  const stamped = events.map((event) =>
    event && typeof event === "object" ? { ...event, receivedAt } : event,
  );

  try {
    const count = await appendPrototypeTelemetryEvents(stamped);
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    console.error("Prototype telemetry POST error:", error);
    return NextResponse.json(
      { error: "Failed to record telemetry" },
      { status: 500 },
    );
  }
}
