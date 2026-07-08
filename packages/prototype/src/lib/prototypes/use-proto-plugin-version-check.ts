"use client";

import {
  fetchProtoPluginVersionStatus,
  type ProtoPluginVersionStatus,
} from "@prototype/lib/prototypes/proto-plugin-version";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { useCallback, useEffect, useMemo, useState } from "react";

const DISMISSED_VERSION_KEY = "prototype-review:global:dismissed-plugin-version";

export function useProtoPluginVersionCheck() {
  const [status, setStatus] = useState<ProtoPluginVersionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { value: dismissedVersion, updateValue: setDismissedVersion } =
    usePersistedLocalString(DISMISSED_VERSION_KEY, "");

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

  const shouldShowPopup = useMemo(() => {
    if (isLoading || !status?.updateAvailable || !status.latest || !status.installed) {
      return false;
    }

    if (!dismissedVersion) {
      return true;
    }

    return dismissedVersion !== status.latest;
  }, [dismissedVersion, isLoading, status]);

  return {
    status,
    shouldShowPopup,
    dismiss,
    isLoading,
  };
}
