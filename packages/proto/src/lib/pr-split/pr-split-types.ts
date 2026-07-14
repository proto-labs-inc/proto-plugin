export type PrSplitEntrySize = "Small" | "Medium" | "Large";

export type PrSplitEntry<
  TWireframeId extends string = string,
  TLiveState = unknown,
> = {
  order: number;
  title: string;
  description: string;
  size: PrSplitEntrySize;
  targetId: string;
  liveState: TLiveState;
  wireframeId: TWireframeId;
  prUrl?: string;
  branch?: string;
  /** Linear issue URL for this PR slice. */
  linearUrl?: string;
  /** Path appended to the Vercel preview host (e.g. demo list page). */
  previewPath?: string;
  /** Cached Vercel preview host when GitHub lookup is unavailable. */
  vercelPreviewHost?: string;
  analyticsNotes?: string[];
  approved?: boolean;
  merged?: boolean;
};

export type PrSplitAgentPromptConfig = {
  /** Label for the PR series, e.g. "Feature area FE". */
  seriesLabel: string;
  /** GitHub repo slug where agents open PRs, e.g. "acme/source-app". */
  sourceRepo: string;
  /** Path within sourceRepo where agents implement the change, e.g. "apps/web". */
  sourceWorkPath: string;
  /** Path to the prototype's pr-split config file agents update after opening a PR. */
  configFilePath: string;
  /** Returns the full branch name for an entry. */
  branchName: (entry: Pick<PrSplitEntry, "order" | "title">) => string;
  /** Optional scope guardrail appended to default instructions. */
  scopeNote?: string;
};

export type PrSplitUrlConfig<TLiveState = unknown> = {
  /** Prototype slug — used in `/prototypes/[slug]`. */
  slug: string;
  /** Writes entry live state into search params (before `prSplit` is set). */
  writeEntryToSearchParams: (
    searchParams: URLSearchParams,
    entry: PrSplitEntry<string, TLiveState>,
  ) => void;
};

export type PrSplitConfig<TLiveState = unknown> = PrSplitAgentPromptConfig &
  PrSplitUrlConfig<TLiveState> & {
    /** Vercel project name to prefer when resolving preview URLs. */
    vercelProjectName: string;
    /** Default preview path when entry.previewPath is omitted. */
    defaultPreviewPath: string;
  };
