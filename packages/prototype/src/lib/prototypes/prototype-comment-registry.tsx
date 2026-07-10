"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import type { AnnotationTargetOptions } from "@prototype/lib/prototype-comments/core/annotation-target";

import {
  augmentLiveStateWithDesignVariants,
  collectDesignVariants,
  restoreDesignVariants,
  splitDesignVariants,
  type PrototypeCommentDesignVariantCapture,
} from "./prototype-comment-design-variants";
import {
  augmentLiveStateWithReviewState,
  restoreLiveStateWithReviewState,
  type PrototypeCommentReviewStateBridge,
} from "./prototype-comment-review-state";

export type PrototypeCommentHandlers = {
  getLiveState: () => unknown;
  onRestore: (live: unknown) => void;
  resolveTargetOptions?: () => AnnotationTargetOptions;
};

type PrototypeCommentRegistryValue = {
  register: (handlers: PrototypeCommentHandlers) => void;
  unregister: (handlers: PrototypeCommentHandlers) => void;
  registerReviewStateBridge: (
    bridge: PrototypeCommentReviewStateBridge | null,
  ) => void;
  registerDesignVariantCapture: (
    variantSetId: string,
    capture: PrototypeCommentDesignVariantCapture,
  ) => void;
  unregisterDesignVariantCapture: (variantSetId: string) => void;
  readHandlers: () => PrototypeCommentHandlers | null;
  /** Notify subscribers that the prototype's live state changed. */
  notifyLiveStateChange: () => void;
  /** Subscribe to live-state changes. Returns an unsubscribe function. */
  subscribeLiveStateChange: (listener: () => void) => () => void;
};

const PrototypeCommentRegistryContext =
  createContext<PrototypeCommentRegistryValue | null>(null);

export function PrototypeCommentRegistryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const handlersRef = useRef<PrototypeCommentHandlers | null>(null);
  const reviewBridgeRef = useRef<PrototypeCommentReviewStateBridge | null>(
    null,
  );
  const designVariantCapturesRef = useRef<
    Map<string, PrototypeCommentDesignVariantCapture>
  >(new Map());
  const liveStateListenersRef = useRef<Set<() => void>>(new Set());

  const notifyLiveStateChange = useCallback(() => {
    liveStateListenersRef.current.forEach((listener) => listener());
  }, []);

  const subscribeLiveStateChange = useCallback((listener: () => void) => {
    liveStateListenersRef.current.add(listener);
    return () => {
      liveStateListenersRef.current.delete(listener);
    };
  }, []);

  const register = useCallback((handlers: PrototypeCommentHandlers) => {
    handlersRef.current = handlers;
  }, []);

  const unregister = useCallback((handlers: PrototypeCommentHandlers) => {
    if (handlersRef.current === handlers) {
      handlersRef.current = null;
    }
  }, []);

  const registerReviewStateBridge = useCallback(
    (bridge: PrototypeCommentReviewStateBridge | null) => {
      reviewBridgeRef.current = bridge;
    },
    [],
  );

  const registerDesignVariantCapture = useCallback(
    (variantSetId: string, capture: PrototypeCommentDesignVariantCapture) => {
      designVariantCapturesRef.current.set(variantSetId, capture);
    },
    [],
  );

  const unregisterDesignVariantCapture = useCallback((variantSetId: string) => {
    designVariantCapturesRef.current.delete(variantSetId);
  }, []);

  const readHandlers = useCallback((): PrototypeCommentHandlers | null => {
    const prototypeHandlers = handlersRef.current;
    if (!prototypeHandlers) return null;

    const bridge = reviewBridgeRef.current;
    const designVariantCaptures = designVariantCapturesRef.current;
    const hasDesignVariants = designVariantCaptures.size > 0;
    const hasReviewBridge = bridge?.prodReferenceAvailable === true;

    if (!hasDesignVariants && !hasReviewBridge) {
      return prototypeHandlers;
    }

    return {
      getLiveState: () => {
        let live = prototypeHandlers.getLiveState();

        if (hasDesignVariants) {
          live = augmentLiveStateWithDesignVariants(
            live,
            collectDesignVariants(designVariantCaptures),
          );
        }

        if (hasReviewBridge) {
          live = augmentLiveStateWithReviewState(
            live,
            bridge.getShowProdReference(),
          );
        }

        return live;
      },
      onRestore: (live) => {
        const { designVariants, prototypeLive: liveWithoutDesignVariants } =
          splitDesignVariants(live);

        const restorePrototypeLive = (restoredLive: unknown) => {
          prototypeHandlers.onRestore(restoredLive);
          requestAnimationFrame(() => {
            restoreDesignVariants(designVariants, designVariantCaptures);
          });
        };

        if (hasReviewBridge) {
          restoreLiveStateWithReviewState(
            liveWithoutDesignVariants,
            restorePrototypeLive,
            bridge,
          );
          return;
        }

        restorePrototypeLive(liveWithoutDesignVariants);
      },
      ...(prototypeHandlers.resolveTargetOptions
        ? {
            resolveTargetOptions: prototypeHandlers.resolveTargetOptions,
          }
        : {}),
    };
  }, []);

  const value = useMemo(
    () => ({
      register,
      unregister,
      registerReviewStateBridge,
      registerDesignVariantCapture,
      unregisterDesignVariantCapture,
      readHandlers,
      notifyLiveStateChange,
      subscribeLiveStateChange,
    }),
    [
      register,
      unregister,
      registerReviewStateBridge,
      registerDesignVariantCapture,
      unregisterDesignVariantCapture,
      readHandlers,
      notifyLiveStateChange,
      subscribeLiveStateChange,
    ],
  );

  return (
    <PrototypeCommentRegistryContext.Provider value={value}>
      {children}
    </PrototypeCommentRegistryContext.Provider>
  );
}

export function usePrototypeCommentRegistry(): PrototypeCommentRegistryValue {
  const context = useContext(PrototypeCommentRegistryContext);
  if (!context) {
    throw new Error(
      "usePrototypeCommentRegistry must be used within PrototypeCommentRegistryProvider",
    );
  }
  return context;
}
