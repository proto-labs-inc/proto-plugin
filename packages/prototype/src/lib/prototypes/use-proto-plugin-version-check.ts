"use client";

import {
  fetchProtoPluginVersionStatus,
  type ProtoPluginVersionStatus,
} from "@prototype/lib/prototypes/proto-plugin-version";
import { isMinorProtoPluginVersionBump } from "@prototype/lib/prototypes/proto-plugin-semver";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { useCallback, useEffect, useMemo, useState } from "react";

const DISMISSED_VERSION_KEY = "prototype-review:global:dismissed-plugin-version";
const DISMISSED_AT_KEY = "prototype-review:global:dismissed-plugin-at";
const MINOR_BUMP_REMIND_INTERVAL_MS = 60 * 60 * 1000;
const PREVIEW_PLUGIN_UPDATE_PARAM = "previewPluginUpdate";

function isMinorBumpReminderDue(dismissedAt: string): boolean {
  if (!dismissedAt) return true;

  const dismissedMs = Number(dismissedAt);
  if (!Number.isFinite(dismissedMs)) return true;

  return Date.now() - dismissedMs >= MINOR_BUMP_REMIND_INTERVAL_MS;
}

function readPreviewPluginUpdateParam(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has(PREVIEW_PLUGIN_UPDATE_PARAM);
}

export function useProtoPluginVersionCheck() {
  const [status, setStatus] = useState<ProtoPluginVersionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minorBumpReminderReady, setMinorBumpReminderReady] = useState(true);
  const { value: dismissedVersion, updateValue: setDismissedVersion } =
    usePersistedLocalString(DISMISSED_VERSION_KEY, "");
  const { value: dismissedAt, updateValue: setDismissedAt } =
    usePersistedLocalString(DISMISSED_AT_KEY, "");
  const forcePreview = readPreviewPluginUpdateParam();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextStatus = await fetchProtoPluginVersionStatus();
        if (!cancelled) {
          setStatus(nextStatus);
        }
      } catch {
        if (!cancelled) {
          setStatus(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!status?.installed || !status.latest) return;
    if (!isMinorProtoPluginVersionBump(status.installed, status.latest)) {
      setMinorBumpReminderReady(true);
      return;
    }

    if (isMinorBumpReminderDue(dismissedAt)) {
      setMinorBumpReminderReady(true);
      return;
    }

    setMinorBumpReminderReady(false);
    const dismissedMs = Number(dismissedAt);
    const remaining = MINOR_BUMP_REMIND_INTERVAL_MS - (Date.now() - dismissedMs);
    const timer = window.setTimeout(() => setMinorBumpReminderReady(true), remaining);
    return () => window.clearTimeout(timer);
  }, [dismissedAt, status?.installed, status?.latest]);

  const dismiss = useCallback(() => {
    if (!status?.latest || !status.installed) return;

    if (isMinorProtoPluginVersionBump(status.installed, status.latest)) {
      setDismissedAt(String(Date.now()));
      setMinorBumpReminderReady(false);
      return;
    }

    setDismissedVersion(status.latest);
  }, [setDismissedAt, setDismissedVersion, status?.installed, status?.latest]);

  const previewStatus = useMemo<ProtoPluginVersionStatus | null>(() => {
    if (!forcePreview) return null;

    const installed = status?.installed ?? "0.1.7";
    let latest = status?.latest ?? "0.1.9";

    if (latest === installed) {
      const match = /^(\d+)\.(\d+)\.(\d+)/.exec(installed);
      latest = match
        ? `${match[1]}.${match[2]}.${Number(match[3]) + 1}`
        : "0.1.9";
    }

    return {
      installed,
      latest,
      updateAvailable: true,
      isWorkspaceLink: false,
      repositoryUrl: status?.repositoryUrl,
    };
  }, [forcePreview, status]);

  const effectiveStatus = previewStatus ?? status;

  const shouldShowPopup = useMemo(() => {
    if (forcePreview) {
      return Boolean(effectiveStatus?.installed && effectiveStatus.latest);
    }

    if (isLoading || !status?.updateAvailable || !status.latest || !status.installed) {
      return false;
    }

    if (isMinorProtoPluginVersionBump(status.installed, status.latest)) {
      return minorBumpReminderReady;
    }

    if (!dismissedVersion) {
      return true;
    }

    return dismissedVersion !== status.latest;
  }, [
    dismissedVersion,
    effectiveStatus,
    forcePreview,
    isLoading,
    minorBumpReminderReady,
    status,
  ]);

  return {
    status: effectiveStatus,
    shouldShowPopup,
    dismiss,
    isLoading,
  };
}
