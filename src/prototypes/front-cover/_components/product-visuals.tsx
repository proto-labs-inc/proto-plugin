import { PrototypeComponent } from "proto-plugin";
import { cn } from "ui";

function VisualFrame({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PrototypeComponent
      id={id}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 hidden h-[55%] sm:block",
        className,
      )}
    >
      {children}
    </PrototypeComponent>
  );
}

export function DatabaseVisual() {
  return (
    <VisualFrame id="product-visuals.database-visual" className="right-0 left-auto w-[62%]">
      <svg viewBox="0 0 220 160" className="absolute inset-x-4 bottom-0 h-[90%] w-auto text-foreground-muted" aria-hidden="true">
        <ellipse cx="110" cy="118" rx="62" ry="18" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path
          d="M48 118c0-28 28-86 62-86s62 58 62 86"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <circle cx="88" cy="78" r="4" fill="currentColor" />
        <circle cx="128" cy="74" r="4" fill="currentColor" />
        <path d="M92 98c8 8 28 8 36 0" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M52 70c-18-8-28-4-32 10" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M168 70c18-8 28-4 32 10" fill="none" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    </VisualFrame>
  );
}

export function AuthVisual() {
  const rows = ["alex@studio.dev", "3198@gmail.com", "ada@supabase.com", "sam@workers.io"];
  return (
    <VisualFrame id="product-visuals.auth-visual">
      <div className="mx-auto w-[78%] overflow-hidden rounded-lg border border-border bg-background">
        {rows.map((email, index) => (
          <div
            key={email}
            className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
          >
            <span className="h-5 w-5 rounded-full bg-surface-200" />
            <span className="text-[11px] text-foreground-light">{email}</span>
            <span className="ml-auto text-[10px] text-foreground-muted">
              {index === 0 ? "owner" : "member"}
            </span>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

export function FunctionsVisual() {
  return (
    <VisualFrame id="product-visuals.functions-visual">
      <div className="relative mx-auto h-full w-[82%]">
        <svg viewBox="0 0 120 80" className="absolute inset-0 text-foreground-muted" aria-hidden="true">
          <circle cx="60" cy="42" r="26" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <ellipse cx="60" cy="42" rx="12" ry="26" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M34 42h52M38 30h44M38 54h44" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] text-foreground shadow-sm">
          $ supabase functions deploy
        </div>
      </div>
    </VisualFrame>
  );
}

export function StorageVisual() {
  return (
    <VisualFrame id="product-visuals.storage-visual">
      <div className="mx-auto grid w-[80%] grid-cols-3 gap-2">
        {["img", "mp4", "pdf", "csv", "wav", "zip"].map((ext) => (
          <div
            key={ext}
            className="flex aspect-square items-end rounded-md border border-border bg-surface-200 p-2 text-[10px] text-foreground-lighter"
          >
            .{ext}
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

export function RealtimeVisual() {
  return (
    <VisualFrame id="product-visuals.realtime-visual">
      <div className="mx-auto flex w-[78%] flex-col gap-2">
        {["presence", "broadcast", "postgres"].map((channel, index) => (
          <div
            key={channel}
            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-[11px]"
          >
            <span className="text-foreground">{channel}</span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                index === 0 ? "bg-brand" : "bg-foreground-muted",
              )}
            />
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

export function VectorVisual() {
  return (
    <VisualFrame id="product-visuals.vector-visual">
      <div className="mx-auto grid w-[70%] grid-cols-6 gap-1">
        {Array.from({ length: 18 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-sm bg-brand/30"
            style={{ opacity: 0.25 + ((index * 17) % 60) / 100 }}
          />
        ))}
      </div>
    </VisualFrame>
  );
}

export function DataApiVisual() {
  return (
    <VisualFrame id="product-visuals.data-api-visual">
      <div className="mx-auto w-[78%] rounded-lg border border-border bg-background p-3 font-mono text-[10px] text-foreground-lighter">
        <div className="text-brand">GET /rest/v1/todos</div>
        <div>{`{ "id": 1, "done": false }`}</div>
      </div>
    </VisualFrame>
  );
}

export function ProductVisual({
  visual,
}: {
  visual: "database" | "auth" | "functions" | "storage" | "realtime" | "vector" | "data-api";
}) {
  return (
    <PrototypeComponent id="product-visuals.product-visual">
      {visual === "database" ? (
        <DatabaseVisual />
      ) : visual === "auth" ? (
        <AuthVisual />
      ) : visual === "functions" ? (
        <FunctionsVisual />
      ) : visual === "storage" ? (
        <StorageVisual />
      ) : visual === "realtime" ? (
        <RealtimeVisual />
      ) : visual === "vector" ? (
        <VectorVisual />
      ) : (
        <DataApiVisual />
      )}
    </PrototypeComponent>
  );
}
