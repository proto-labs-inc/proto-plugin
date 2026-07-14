export function isValidAnnotation(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === "string" &&
    typeof a.comment === "string" &&
    typeof a.timestamp === "number" &&
    a.interactionState != null &&
    typeof (a.interactionState as Record<string, unknown>).capturedAt ===
      "string" &&
    (a.deleted === undefined || typeof a.deleted === "boolean") &&
    (a.parentId === undefined || typeof a.parentId === "string") &&
    (a.channel === undefined ||
      a.channel === "comment" ||
      a.channel === "changelog")
  );
}
