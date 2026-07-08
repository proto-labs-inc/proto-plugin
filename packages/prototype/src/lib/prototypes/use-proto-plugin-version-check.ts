"use client";

import {
  fetchProtoPluginVersionStatus,
  type ProtoPluginVersionStatus,
} from "@prototype/lib/prototypes/proto-plugin-version";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { useCallback, useEffect, useMemo, useState } from "react";

const DISMISSED_VERSION_KEY = "prototype-review:global:dismissed-plugin-version";
const PREVIEW_PLUGIN_UPDATE_PARAM = "previewPluginUpdate";

function readPreviewPluginUpdateParam(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has(PREVIEW_PLUGIN_UPDATE_PARAM);
}

export function useProtoPluginVersionCheck() {
  const [status, setStatus] = useState<ProtoPluginVersionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { value: dismissedVersion, updateValue: setDismissedVersion } =
    usePersistedLocalString(DISMISSED_VERSION_KEY, "");
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

  const dismiss = useCallback(() => {
    if (status?.latest) {
      setDismissedVersion(status.latest);
    }
  }, [setDismissedVersion, status?.latest]);

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

    if (!dismissedVersion) {
      return true;
    }

    return dismissedVersion !== status.latest;
  }, [dismissedVersion, effectiveStatus, forcePreview, isLoading, status]);

  return {
    status: effectiveStatus,
    shouldShowPopup,
    dismiss,
    isLoading,
  };
}
