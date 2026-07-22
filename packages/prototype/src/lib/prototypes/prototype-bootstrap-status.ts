import type { BootstrapSyncPaths } from "@prototype/lib/prototypes/host-sync-config";
import type { BootstrapPreviewStep } from "@prototype/lib/prototypes/use-bootstrap-preview";
import type { PrototypeBootstrapConfig } from "@prototype/lib/prototypes/prototype-config-types";
import {
  readWorkspaceProfileFromEnv,
  type WorkspaceProfile,
} from "@prototype/lib/prototypes/workspace-profile";

export const PROTOTYPE_BOOTSTRAP_STATUS_PATH = "/api/prototypes/bootstrap-status";

export type BootstrapRequirementId =
  | "sourceLinked"
  | "userName"
  | "designTokens"
  | "uiPrimitives"
  | "sharedBlocks";

export const BOOTSTRAP_REQUIREMENT_IDS = [
  "sourceLinked",
  "userName",
  "designTokens",
  "uiPrimitives",
  "sharedBlocks",
] as const satisfies readonly BootstrapRequirementId[];

export const DEFAULT_BOOTSTRAP_REQUIREMENT_ORDER: BootstrapRequirementId[] = [
  "sourceLinked",
  "userName",
  "designTokens",
  "uiPrimitives",
  "sharedBlocks",
];

export const DEFAULT_BOOTSTRAP_PATHS: Record<
  Exclude<BootstrapRequirementId, "sourceLinked" | "userName">,
  string[]
> = {
  designTokens: ["src/app/globals.css"],
  uiPrimitives: ["src/components/ui"],
  sharedBlocks: ["src/lib/utils.ts"],
};

export const BOOTSTRAP_REQUIREMENT_LABELS: Record<BootstrapRequirementId, string> =
  {
    sourceLinked: "Connect your source directory",
    userName: "What should we call you?",
    designTokens: "Design tokens and global styles",
    uiPrimitives: "Base ui/ primitives from source",
    sharedBlocks: "Shared building blocks and utilities",
  };

export type BootstrapRequirement = {
  id: BootstrapRequirementId;
  label: string;
  satisfied: boolean;
  checkedPaths?: string[];
};

export type PrototypeBootstrapStatus = {
  requirements: BootstrapRequirement[];
  complete: boolean;
  /** Synced design tokens + ui primitives exist on disk. */
  designSystemReady: boolean;
  firstIncompleteId: BootstrapRequirementId | null;
  resolvedStep: BootstrapPreviewStep;
};

export type PathExistenceChecker = (relativePath: string) => boolean;

export function requirementToModalStep(
  id: BootstrapRequirementId,
): BootstrapPreviewStep {
  switch (id) {
    case "sourceLinked":
      return "source-directory";
    case "userName":
      return "name";
    case "designTokens":
    case "uiPrimitives":
    case "sharedBlocks":
      return "component-library";
  }
}

export function resolveBootstrapStep(
  requirements: BootstrapRequirement[],
): BootstrapPreviewStep {
  const firstIncomplete = requirements.find((requirement) => !requirement.satisfied);
  if (!firstIncomplete) return "normal";
  return requirementToModalStep(firstIncomplete.id);
}

export function isSourceLinked(
  env: NodeJS.ProcessEnv,
  checkExists: PathExistenceChecker,
): boolean {
  const sourcePath = env.SOURCE_PATH?.trim();
  if (!sourcePath) return false;
  return checkExists("source");
}

export function isUserNameSet(profile: WorkspaceProfile): boolean {
  return profile.userName.trim().length > 0;
}

export function pathGroupSatisfied(
  paths: string[],
  checkExists: PathExistenceChecker,
): boolean {
  return paths.some((relativePath) => checkExists(relativePath));
}

export function resolveBootstrapPaths(
  bootstrap?: PrototypeBootstrapConfig,
  syncPaths?: BootstrapSyncPaths | null,
): Record<
  Exclude<BootstrapRequirementId, "sourceLinked" | "userName">,
  string[]
> {
  const hasSyncConfig = syncPaths != null;

  return {
    designTokens:
      bootstrap?.paths?.designTokens ??
      (hasSyncConfig
        ? syncPaths.designTokens
        : DEFAULT_BOOTSTRAP_PATHS.designTokens),
    uiPrimitives:
      bootstrap?.paths?.uiPrimitives ??
      (hasSyncConfig
        ? syncPaths.uiPrimitives
        : DEFAULT_BOOTSTRAP_PATHS.uiPrimitives),
    sharedBlocks:
      bootstrap?.paths?.sharedBlocks ??
      (hasSyncConfig
        ? syncPaths.sharedBlocks
        : DEFAULT_BOOTSTRAP_PATHS.sharedBlocks),
  };
}

export function isSyncBootstrapRequirement(
  id: BootstrapRequirementId,
): id is Exclude<BootstrapRequirementId, "sourceLinked" | "userName"> {
  return (
    id === "designTokens" || id === "uiPrimitives" || id === "sharedBlocks"
  );
}

export function isSyncBootstrapRequirementSatisfied(
  paths: string[],
  checkExists: PathExistenceChecker,
): boolean {
  if (paths.length === 0) return false;
  return pathGroupSatisfied(paths, checkExists);
}

export function resolveBootstrapRequirementOrder(
  bootstrap?: PrototypeBootstrapConfig,
): BootstrapRequirementId[] {
  const order = bootstrap?.requirementOrder;
  if (!order?.length) return [...DEFAULT_BOOTSTRAP_REQUIREMENT_ORDER];

  const seen = new Set<BootstrapRequirementId>();
  const resolved: BootstrapRequirementId[] = [];

  for (const id of order) {
    if (!BOOTSTRAP_REQUIREMENT_IDS.includes(id) || seen.has(id)) continue;
    seen.add(id);
    resolved.push(id);
  }

  for (const id of DEFAULT_BOOTSTRAP_REQUIREMENT_ORDER) {
    if (!seen.has(id)) resolved.push(id);
  }

  return resolved;
}

export function evaluateBootstrapRequirement(
  id: BootstrapRequirementId,
  options: {
    bootstrap?: PrototypeBootstrapConfig;
    env?: NodeJS.ProcessEnv;
    checkExists: PathExistenceChecker;
    syncPaths?: BootstrapSyncPaths | null;
  },
): BootstrapRequirement {
  const env = options.env ?? process.env;
  const paths = resolveBootstrapPaths(options.bootstrap, options.syncPaths);
  const profile = readWorkspaceProfileFromEnv(env);
  const sourceLinked = isSourceLinked(env, options.checkExists);

  switch (id) {
    case "sourceLinked":
      return {
        id,
        label: BOOTSTRAP_REQUIREMENT_LABELS.sourceLinked,
        satisfied: sourceLinked,
      };
    case "userName":
      return {
        id,
        label: BOOTSTRAP_REQUIREMENT_LABELS.userName,
        satisfied: isUserNameSet(profile),
      };
    case "designTokens":
      return {
        id,
        label: BOOTSTRAP_REQUIREMENT_LABELS.designTokens,
        satisfied:
          sourceLinked &&
          isSyncBootstrapRequirementSatisfied(
            paths.designTokens,
            options.checkExists,
          ),
        checkedPaths: paths.designTokens,
      };
    case "uiPrimitives":
      return {
        id,
        label: BOOTSTRAP_REQUIREMENT_LABELS.uiPrimitives,
        satisfied:
          sourceLinked &&
          isSyncBootstrapRequirementSatisfied(
            paths.uiPrimitives,
            options.checkExists,
          ),
        checkedPaths: paths.uiPrimitives,
      };
    case "sharedBlocks":
      return {
        id,
        label: BOOTSTRAP_REQUIREMENT_LABELS.sharedBlocks,
        satisfied:
          sourceLinked &&
          isSyncBootstrapRequirementSatisfied(
            paths.sharedBlocks,
            options.checkExists,
          ),
        checkedPaths: paths.sharedBlocks,
      };
  }
}

export function evaluateBootstrapRequirements(options: {
  bootstrap?: PrototypeBootstrapConfig;
  env?: NodeJS.ProcessEnv;
  checkExists: PathExistenceChecker;
  syncPaths?: BootstrapSyncPaths | null;
  designSystemReady?: boolean;
}): PrototypeBootstrapStatus {
  const order = resolveBootstrapRequirementOrder(options.bootstrap);
  const requirements = order.map((id) =>
    evaluateBootstrapRequirement(id, options),
  );
  const firstIncomplete =
    requirements.find((requirement) => !requirement.satisfied) ?? null;
  const designTokens = requirements.find(
    (requirement) => requirement.id === "designTokens",
  );
  const uiPrimitives = requirements.find(
    (requirement) => requirement.id === "uiPrimitives",
  );
  const designSystemReady =
    options.designSystemReady ??
    Boolean(designTokens?.satisfied && uiPrimitives?.satisfied);

  return {
    requirements,
    complete: firstIncomplete == null,
    designSystemReady,
    firstIncompleteId: firstIncomplete?.id ?? null,
    resolvedStep: resolveBootstrapStep(requirements),
  };
}

export function createCompletedBootstrapStatus(): PrototypeBootstrapStatus {
  const requirements = DEFAULT_BOOTSTRAP_REQUIREMENT_ORDER.map((id) => ({
    id,
    label: BOOTSTRAP_REQUIREMENT_LABELS[id],
    satisfied: true,
  }));

  return {
    requirements,
    complete: true,
    designSystemReady: true,
    firstIncompleteId: null,
    resolvedStep: "normal",
  };
}

/**
 * Status returned when the workspace is not yet onboarded (source not linked or
 * workspace profile unset), so this reports incomplete and starts the modal from
 * the beginning.
 */
export function createOnboardingRequiredBootstrapStatus(): PrototypeBootstrapStatus {
  const requirements = DEFAULT_BOOTSTRAP_REQUIREMENT_ORDER.map((id) => ({
    id,
    label: BOOTSTRAP_REQUIREMENT_LABELS[id],
    satisfied: false,
  }));

  return {
    requirements,
    complete: false,
    designSystemReady: false,
    firstIncompleteId: requirements[0]?.id ?? null,
    resolvedStep: "welcome",
  };
}

export async function fetchPrototypeBootstrapStatus(): Promise<PrototypeBootstrapStatus> {
  const response = await fetch(PROTOTYPE_BOOTSTRAP_STATUS_PATH);

  if (!response.ok) {
    throw new Error("Failed to check prototype bootstrap status.");
  }

  return (await response.json()) as PrototypeBootstrapStatus;
}
