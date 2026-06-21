import type { VercelPreviewFromPr } from "../vercel-preview/parse-vercel-github-comment";
import { buildVercelPreviewPageUrl } from "../vercel-preview/parse-vercel-github-comment";
import type { PrSplitEntry } from "./pr-split-types";

export function resolveSourcePreviewUrl<TLiveState>(
  payload: VercelPreviewFromPr | null,
  entry: Pick<
    PrSplitEntry<string, TLiveState>,
    "previewPath" | "vercelPreviewHost"
  >,
  options: {
    defaultPreviewPath: string;
    vercelProjectName: string;
  },
): { previewUrl: string; inspectorUrl: string | null } | null {
  const previewPath = entry.previewPath ?? options.defaultPreviewPath;

  if (payload) {
    const sourceProject =
      payload.projects.find(
        (project) => project.name === options.vercelProjectName,
      ) ?? payload.projects[0];
    if (sourceProject?.previewUrl) {
      return {
        previewUrl: buildVercelPreviewPageUrl(
          sourceProject.previewUrl,
          previewPath,
        ),
        inspectorUrl: sourceProject.inspectorUrl ?? null,
      };
    }
  }

  if (entry.vercelPreviewHost) {
    return {
      previewUrl: buildVercelPreviewPageUrl(
        entry.vercelPreviewHost,
        previewPath,
      ),
      inspectorUrl: null,
    };
  }

  return null;
}
