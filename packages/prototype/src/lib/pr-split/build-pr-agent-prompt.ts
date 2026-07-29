import { buildPrSplitPrototypeUrl } from "./build-pr-split-prototype-url";
import type {
  PrSplitAgentPromptConfig,
  PrSplitConfig,
  PrSplitEntry,
} from "./pr-split-types";

export function buildPrAgentPrompt<TLiveState>(
  entry: PrSplitEntry<string, TLiveState>,
  allEntries: PrSplitEntry<string, TLiveState>[],
  config: PrSplitConfig<TLiveState>,
  origin = "http://localhost:3003",
): string {
  const priorPrs = allEntries.filter((e) => e.order < entry.order);
  const prototypeUrl = buildPrSplitPrototypeUrl(entry, config, origin);
  const lines = [
    `Create a focused pull request in ${config.sourceRepo} for ${config.seriesLabel} #${entry.order}: ${entry.title}.`,
    "",
    "## Summary",
    entry.description,
    "",
    "## Scope",
    `- Estimated size: ${entry.size}`,
    `- Primary UI target: \`${entry.targetId}\``,
    `- Prototype preview: ${prototypeUrl}`,
    "",
  ];

  if (priorPrs.length > 0) {
    lines.push("## Depends on (merge order)");
    for (const prior of priorPrs) {
      const link = prior.prUrl
        ? `${prior.prUrl}${prior.branch ? ` (branch: ${prior.branch})` : ""}`
        : null;
      let status: string;
      if (prior.merged) {
        status = link ? `merged — ${link}` : "merged";
      } else if (prior.closed) {
        status = link ? `closed — ${link}` : "closed";
      } else if (prior.cancelled) {
        status = link ? `cancelled — ${link}` : "cancelled";
      } else if (link) {
        status = link;
      } else {
        status = "not yet open";
      }
      lines.push(`- PR ${prior.order} · ${prior.title} — ${status}`);
    }
    lines.push("");
  }

  if (entry.analyticsNotes?.length) {
    lines.push("## Event logging");
    entry.analyticsNotes.forEach((note, index) => {
      lines.push(`${index + 1}. ${note}`);
    });
    lines.push("");
  }

  const scopeGuardrail =
    config.scopeNote ??
    "Do not bundle unrelated work from other PR slices in this series.";

  lines.push(
    "## Instructions",
    `1. Work in \`${config.sourceWorkPath}\` — find the target page and replicate this slice from the prototype with exact visual fidelity.`,
    `2. Keep the PR small: only the changes described above. ${scopeGuardrail}`,
    "3. Match prototype layout, spacing, semantic tokens, and interactive behavior.",
    `4. Branch naming: \`${config.branchName(entry)}\`.`,
    `5. After opening the pull request, copy the GitHub PR URL and add it to the matching card in \`${config.configFilePath}\` — set \`prUrl\` and \`branch\` on the matching \`PR_SPLIT_ENTRIES\` item so the prototype sidebar links to it.`,
  );

  if (entry.analyticsNotes?.length) {
    lines.push("6. Add analytics events listed under Event logging.");
  }

  return lines.join("\n");
}

export type { PrSplitAgentPromptConfig };
