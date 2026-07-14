import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";

import {
  parseGithubPrUrl,
  parseVercelGithubCommentBody,
  type VercelPreviewFromPr,
} from "../lib/vercel-preview/parse-vercel-github-comment";

type GithubIssueComment = {
  user?: { login?: string };
  body?: string;
};

const execFileAsync = promisify(execFile);

async function fetchGithubIssueComments(
  owner: string,
  repo: string,
  number: number,
  token: string,
): Promise<GithubIssueComment[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`);
  }

  return (await response.json()) as GithubIssueComment[];
}

async function fetchGithubIssueCommentsViaGhCli(
  owner: string,
  repo: string,
  number: number,
): Promise<GithubIssueComment[]> {
  const { stdout } = await execFileAsync(
    "gh",
    ["api", `repos/${owner}/${repo}/issues/${number}/comments`],
    { timeout: 20_000 },
  );
  return JSON.parse(stdout) as GithubIssueComment[];
}

function extractVercelPreviewFromComments(
  comments: GithubIssueComment[],
): VercelPreviewFromPr | null {
  for (const comment of comments) {
    const login = comment.user?.login?.toLowerCase() ?? "";
    if (!login.includes("vercel")) continue;
    const preview = parseVercelGithubCommentBody(comment.body ?? "");
    if (preview) return preview;
  }
  return null;
}

async function fetchVercelPreviewForPr(
  prUrl: string,
  token?: string,
): Promise<VercelPreviewFromPr | null> {
  const parsed = parseGithubPrUrl(prUrl);
  if (!parsed) return null;

  let comments: GithubIssueComment[] | null = null;

  if (token) {
    try {
      comments = await fetchGithubIssueComments(
        parsed.owner,
        parsed.repo,
        parsed.number,
        token,
      );
    } catch (error) {
      console.warn("GitHub token fetch failed, trying gh CLI:", error);
    }
  }

  if (!comments) {
    try {
      comments = await fetchGithubIssueCommentsViaGhCli(
        parsed.owner,
        parsed.repo,
        parsed.number,
      );
    } catch (error) {
      console.error("gh CLI fetch failed:", error);
      return null;
    }
  }

  return extractVercelPreviewFromComments(comments);
}

export async function GET(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN;

  const prUrl = request.nextUrl.searchParams.get("prUrl");
  const prUrlsParam = request.nextUrl.searchParams.get("prUrls");

  const prUrls = [
    ...(prUrl ? [prUrl] : []),
    ...(prUrlsParam
      ? prUrlsParam.split(",").map((value) => value.trim()).filter(Boolean)
      : []),
  ];

  if (prUrls.length === 0) {
    return NextResponse.json(
      { error: "Provide prUrl or prUrls query parameter." },
      { status: 400 },
    );
  }

  try {
    const previews = await Promise.all(
      prUrls.map(async (url) => {
        try {
          const preview = await fetchVercelPreviewForPr(url, token);
          return { prUrl: url, preview };
        } catch (error) {
          console.error("PR Vercel preview fetch error:", url, error);
          return {
            prUrl: url,
            preview: null,
            error: "Failed to fetch preview.",
          };
        }
      }),
    );

    if (prUrls.length === 1) {
      const [entry] = previews;
      if (!entry.preview) {
        return NextResponse.json(
          { error: entry.error ?? "No Vercel preview found for this PR." },
          { status: 404 },
        );
      }
      return NextResponse.json(entry.preview);
    }

    return NextResponse.json({ previews });
  } catch (error) {
    console.error("PR Vercel preview route error:", error);
    return NextResponse.json(
      { error: "Failed to load Vercel previews." },
      { status: 500 },
    );
  }
}
