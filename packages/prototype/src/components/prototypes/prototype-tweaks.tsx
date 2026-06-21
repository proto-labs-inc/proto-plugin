"use client";

import {
  focusPrototypeTweak,
  registerPrototypeTweaks,
} from "@prototype/lib/prototypes/prototype-tweak-registry";
import type { PrototypeTweakDefinition } from "@prototype/lib/prototypes/prototype-tweak-types";
import { useLayoutEffect, useMemo, useRef } from "react";

export type PrototypeTweakConfig = PrototypeTweakDefinition & {
  onNavigate: () => void;
};

type PrototypeTweaksProps = {
  tweaks: PrototypeTweakConfig[];
};

export function PrototypeTweaks({ tweaks }: PrototypeTweaksProps) {
  const navigateRef = useRef<Map<string, () => void>>(new Map());

  const items = useMemo(() => {
    const nextNavigate = new Map<string, () => void>();
    const nextItems = tweaks.map((tweak) => {
      nextNavigate.set(tweak.id, tweak.onNavigate);
      return {
        id: tweak.id,
        label: tweak.label,
        targetId: tweak.targetId,
        category: tweak.category,
      };
    });
    navigateRef.current = nextNavigate;
    return nextItems;
  }, [tweaks]);

  useLayoutEffect(() => {
    registerPrototypeTweaks({
      items,
      navigateTo: (id) => {
        navigateRef.current.get(id)?.();
      },
    });
  }, [items]);

  return null;
}

export { focusPrototypeTweak };
