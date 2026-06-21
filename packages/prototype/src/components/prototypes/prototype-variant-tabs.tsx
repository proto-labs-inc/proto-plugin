"use client";

import pillStyles from "@prototype/components/prototypes/prototype-floating-pill.module.scss";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { Tabs, TabsList, TabsTrigger } from "@prototype/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@prototype/components/ui/tooltip";
import { cn } from "@prototype/lib/utils";
import {
  getAdjacentDesignExplorationVariant,
  type DesignExplorationVariantOption,
} from "@prototype/lib/prototypes/design-exploration-types";
import { useCallback, useEffect, useState } from "react";

type PrototypeVariantTabsProps<TVariant extends string> = {
  idPrefix: string;
  options: DesignExplorationVariantOption<TVariant>[];
  value: TVariant;
  onValueChange: (value: TVariant) => void;
  /** When true, ArrowLeft/ArrowRight cycle variants (unless a lightbox is open). */
  keyboardScopeActive?: boolean;
  className?: string;
  /** Disambiguates comment targets when multiple tab strips could mount. */
  surface?: "inline" | "modal";
  variantTabAriaLabel?: string;
  /** Shown with a marker when this option is not the active tab. */
  defaultVariantValue?: TVariant;
  /** Dark styling for the review chrome floating popover. */
  appearance?: "light" | "dark";
  /** Tab trigger content — footer chrome uses labels; modals default to index numbers. */
  tabDisplay?: "index" | "label";
};

function getVariantTabsId(idPrefix: string, surface: "inline" | "modal", segment: string) {
  return surface === "modal"
    ? `${idPrefix}.modal.${segment}`
    : `${idPrefix}.${segment}`;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function PrototypeVariantTabs<TVariant extends string>({
  idPrefix,
  options,
  value,
  onValueChange,
  keyboardScopeActive = true,
  className,
  surface = "inline",
  variantTabAriaLabel = "variant",
  defaultVariantValue,
  appearance = "dark",
  tabDisplay = "index",
}: PrototypeVariantTabsProps<TVariant>) {
  const [keyboardNavEngaged, setKeyboardNavEngaged] = useState(false);

  const goPrev = useCallback(() => {
    onValueChange(getAdjacentDesignExplorationVariant(options, value, "prev"));
  }, [onValueChange, options, value]);

  const goNext = useCallback(() => {
    onValueChange(getAdjacentDesignExplorationVariant(options, value, "next"));
  }, [onValueChange, options, value]);

  const engageKeyboardNav = useCallback(() => {
    setKeyboardNavEngaged(true);
  }, []);

  const handleArrowNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev],
  );

  useEffect(() => {
    if (!keyboardScopeActive) {
      setKeyboardNavEngaged(false);
    }
  }, [keyboardScopeActive]);

  useEffect(() => {
    if (!keyboardScopeActive || !keyboardNavEngaged) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (isTypingTarget(event.target)) return;
      if (document.querySelector("[data-mobbin-lightbox-open]")) return;

      event.preventDefault();
      handleArrowNavigation(event.key === "ArrowLeft" ? "prev" : "next");
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleArrowNavigation, keyboardNavEngaged, keyboardScopeActive]);

  const activeIndex = options.findIndex((option) => option.value === value);
  const rootId = surface === "modal" ? `${idPrefix}.modal` : idPrefix;
  const isDark = appearance === "dark";
  const showLabel = tabDisplay === "label";

  function getTabTriggerContent(
    option: DesignExplorationVariantOption<TVariant>,
    index: number,
  ) {
    return showLabel ? option.label : index + 1;
  }

  return (
    <PrototypeComponent
      id={rootId}
      className={cn("min-w-0 shrink-0", className)}
      onPointerDown={engageKeyboardNav}
    >
      <Tabs
        value={value}
        onValueChange={(nextValue) => {
          engageKeyboardNav();
          onValueChange(nextValue as TVariant);
        }}
        className="min-w-0"
      >
        <PrototypeComponent
          id={getVariantTabsId(idPrefix, surface, "list")}
          className="min-w-0 overflow-x-auto"
        >
          <TooltipProvider delayDuration={200}>
            <TabsList
              className={cn(
                "inline-flex w-max",
                isDark && pillStyles.variantsTabsList,
              )}
            >
              {options.map((option, index) => {
                const isDefaultOption =
                  defaultVariantValue !== undefined &&
                  option.value === defaultVariantValue;
                const isDefaultWhenUnselected =
                  isDefaultOption && option.value !== value;
                const tabClassName = cn(
                  "shrink-0",
                  !showLabel && "min-w-8 tabular-nums",
                  showLabel && "max-w-[10rem] truncate px-2.5",
                  !isDark && !showLabel && "px-2",
                  isDefaultWhenUnselected &&
                    (isDark
                      ? pillStyles.variantsDefaultTab
                      : "bg-muted text-foreground"),
                  isDark && pillStyles.variantsTab,
                );
                const tabId = `${idPrefix}-tab-${surface}-${option.value}`;
                const defaultTabAriaLabel = `${variantTabAriaLabel} ${index + 1}: ${option.label}, selected`;

                if (!isDefaultOption) {
                  return (
                    <TabsTrigger
                      key={option.value}
                      value={option.value}
                      id={tabId}
                      aria-label={`${variantTabAriaLabel} ${index + 1}: ${option.label}`}
                      className={tabClassName}
                    >
                      {getTabTriggerContent(option, index)}
                    </TabsTrigger>
                  );
                }

                return (
                  <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={option.value}
                        id={tabId}
                        aria-label={defaultTabAriaLabel}
                        className={tabClassName}
                      >
                        {getTabTriggerContent(option, index)}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">Selected</TooltipContent>
                  </Tooltip>
                );
              })}
            </TabsList>
          </TooltipProvider>
        </PrototypeComponent>
      </Tabs>

      <span className="text-xs text-muted-foreground sr-only" aria-live="polite">
        {`${activeIndex + 1} of ${options.length}: ${options[activeIndex]?.label ?? ""}`}
      </span>
    </PrototypeComponent>
  );
}
