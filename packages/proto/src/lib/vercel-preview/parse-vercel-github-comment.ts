export type VercelPreviewProject = {
  name: string;
  previewUrl: string;
  inspectorUrl?: string;
  status?: string;
};

export type VercelPreviewFromPr = {
  projects: VercelPreviewProject[];
  requestReviewUrl?: string;
};

type VercelGithubCommentPayload = {
  projects?: Array<{
    name?: string;
    previewUrl?: string;
    inspectorUrl?: string;
    nextCommitStatus?: string;
  }>;
  requestReviewUrl?: string;
};

const VERCEL_COMMENT_PATTERN = /\[vc\]:\s*#[^:]+:([A-Za-z0-9+/=]+)/;

export function parseGithubPrUrl(
  prUrl: string,
): { owner: string; repo: string; number: number } | null {
  try {
    const url = new URL(prUrl);
    const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/);
    if (!match) return null;
    const number = Number(match[3]);
    if (!Number.isInteger(number) || number < 1) return null;
    return { owner: match[1], repo: match[2], number };
  } catch {
    return null;
  }
}

export function parseVercelGithubCommentBody(
  body: string,
): VercelPreviewFromPr | null {
  const match = body.match(VERCEL_COMMENT_PATTERN);
  if (!match) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(match[1], "base64").toString("utf8"),
    ) as VercelGithubCommentPayload;

    const projects = (payload.projects ?? [])
      .filter((project) => typeof project.previewUrl === "string")
      .map((project) => ({
        name: project.name ?? "preview",
        previewUrl: project.previewUrl as string,
        inspectorUrl: project.inspectorUrl,
        status: project.nextCommitStatus,
      }));

    if (projects.length === 0) return null;

    return {
      projects,
      requestReviewUrl: payload.requestReviewUrl,
    };
  } catch {
    return null;
  }
}

export function buildVercelPreviewPageUrl(
  previewHostOrUrl: string,
  previewPath = "/",
): string {
  const normalized = previewHostOrUrl.startsWith("http")
    ? previewHostOrUrl
    : `https://${previewHostOrUrl}`;
  const url = new URL(normalized);
  url.pathname = previewPath;
  return url.toString();
}
