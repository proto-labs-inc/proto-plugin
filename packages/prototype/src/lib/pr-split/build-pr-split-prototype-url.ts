import type { PrSplitEntry, PrSplitUrlConfig } from "./pr-split-types";

export function buildPrSplitPrototypeUrl<TLiveState>(
  entry: PrSplitEntry<string, TLiveState>,
  config: PrSplitUrlConfig<TLiveState>,
  origin = "http://localhost:3003",
): string {
  const url = new URL(`/prototypes/${config.slug}`, origin);
  config.writeEntryToSearchParams(url.searchParams, entry);
  url.searchParams.set("prSplit", String(entry.order));
  return url.toString();
}
