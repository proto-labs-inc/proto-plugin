const AWAITING_LIBRARY_SYNC_STORAGE_KEY =
  "prototype-bootstrap:awaiting-library-sync";

export function markAwaitingLibrarySync(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AWAITING_LIBRARY_SYNC_STORAGE_KEY, "true");
}

export function clearAwaitingLibrarySync(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AWAITING_LIBRARY_SYNC_STORAGE_KEY);
}

export function readAwaitingLibrarySync(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(AWAITING_LIBRARY_SYNC_STORAGE_KEY) === "true"
  );
}
