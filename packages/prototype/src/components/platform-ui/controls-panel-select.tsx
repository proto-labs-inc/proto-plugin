"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import pillStyles from "@prototype/components/prototypes/prototype-floating-pill.module.scss";
import { MiniPillLabel } from "@prototype/components/prototypes/mini-pill-label";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { usePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@prototype/components/ui/dropdown-menu";
import { cn } from "@prototype/lib/utils";

import { ControlsPanelOptionSeparator } from "./controls-panel-options";

export type ControlsPanelSelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export type ControlsPanelSelectSeparator = {
  type: "separator";
};

export type ControlsPanelSelectSubmenuOption = {
  value: string;
  label: string;
};

export type ControlsPanelSelectSubmenu<T extends string = string> = {
  type: "submenu";
  value: T;
  label: string;
  options: ControlsPanelSelectSubmenuOption[];
};

export type ControlsPanelSelectEntry<T extends string = string> =
  | ControlsPanelSelectOption<T>
  | ControlsPanelSelectSeparator
  | ControlsPanelSelectSubmenu<T>;

function isControlsPanelSelectSeparator<T extends string>(
  entry: ControlsPanelSelectEntry<T>,
): entry is ControlsPanelSelectSeparator {
  return "type" in entry && entry.type === "separator";
}

function isControlsPanelSelectSubmenu<T extends string>(
  entry: ControlsPanelSelectEntry<T>,
): entry is ControlsPanelSelectSubmenu<T> {
  return "type" in entry && entry.type === "submenu";
}

function getSelectableOptions<T extends string>(
  entries: ControlsPanelSelectEntry<T>[],
): ControlsPanelSelectOption<T>[] {
  return entries.flatMap((entry) => {
    if (isControlsPanelSelectSeparator(entry)) return [];
    if (isControlsPanelSelectSubmenu(entry)) {
      return [{ value: entry.value, label: entry.label }];
    }
    return [entry];
  });
}

type ControlsPanelSelectProps<T extends string = string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: ControlsPanelSelectEntry<T>[];
  className?: string;
  /** Renders as a half-height pill for the review chrome control row. */
  appearance?: "panel" | "miniPill" | "menuList";
  /** Overrides the mini pill trigger label (dropdown options are unchanged). */
  miniPillLabel?: string;
  /** Active nested option when the current value matches a submenu entry. */
  submenuValue?: string;
  onSubmenuValueChange?: (submenuValue: string) => void;
};

/**
 * Marks the portaled select surface so the surrounding review controls menu
 * can keep itself open while the user interacts with this select.
 */
export const CONTROLS_PANEL_SELECT_CONTENT_ATTR =
  "data-controls-panel-select-content";

/**
 * Select for the review controls panel, built on Radix Select. The option
 * list is portaled to document.body and positioned over page content, so opening
 * it overlays rather than reflowing the surrounding menu.
 */
export function ControlsPanelSelect<T extends string>({
  value,
  onValueChange,
  options,
  className,
  appearance = "panel",
  miniPillLabel,
  submenuValue,
  onSubmenuValueChange,
}: ControlsPanelSelectProps<T>) {
  const selectableOptions = getSelectableOptions(options);
  const activeLabel =
    selectableOptions.find((option) => option.value === value)?.label ?? "Select";
  const isMiniPill = appearance === "miniPill";
  const isMenuList = appearance === "menuList";
  const review = usePrototypeReviewOptional();
  const registerPreviewStates = review?.registerPreviewStates;
  const { commentTheme } = usePrototypeToolTheme();
  const triggerLabel = isMiniPill ? (miniPillLabel ?? activeLabel) : activeLabel;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuList || !registerPreviewStates) return;

    registerPreviewStates(
      getSelectableOptions(options).map((option) => ({
        id: option.value,
        label: option.label,
      })),
    );
  }, [isMenuList, options, registerPreviewStates]);

  const selectSubmenuEntry = useCallback(
    (
      entry: ControlsPanelSelectSubmenu<T>,
      submenuOption: ControlsPanelSelectSubmenuOption,
    ) => {
      onValueChange(entry.value);
      onSubmenuValueChange?.(submenuOption.value);
    },
    [onSubmenuValueChange, onValueChange],
  );

  const handleValueChange = useCallback(
    (next: T) => {
      onValueChange(next);

      const submenuEntry = options.find(
        (entry) => isControlsPanelSelectSubmenu(entry) && entry.value === next,
      );
      if (submenuEntry && isControlsPanelSelectSubmenu(submenuEntry)) {
        const firstOption = submenuEntry.options[0];
        if (firstOption) {
          onSubmenuValueChange?.(firstOption.value);
        }
      }
    },
    [onSubmenuValueChange, onValueChange, options],
  );

  const closeSelect = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.blur());
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (triggerRef.current?.contains(target)) return;
      if (target.closest(`[${CONTROLS_PANEL_SELECT_CONTENT_ATTR}]`)) return;
      closeSelect();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [closeSelect, open]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      requestAnimationFrame(() => triggerRef.current?.blur());
    }
  };

  const handleTriggerPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  if (isMenuList) {
    return (
      <div className={cn(pillStyles.controlsPanelMenuList, className)}>
        {options.map((entry, index) => {
          if (isControlsPanelSelectSeparator(entry)) {
            return (
              <ControlsPanelOptionSeparator
                key={`separator-${index}`}
                className={pillStyles.dropdownMenuSeparator}
              />
            );
          }
          if (isControlsPanelSelectSubmenu(entry)) {
            const parentSelected = entry.value === value;
            const firstOption = entry.options[0];

            return (
              <DropdownMenuSub key={entry.value}>
                <DropdownMenuSubTrigger
                  className={cn(
                    pillStyles.dropdownMenuItem,
                    pillStyles.dropdownMenuSubTrigger,
                    parentSelected && pillStyles.dropdownMenuItemSelected,
                  )}
                  onClick={(event) => {
                    if (parentSelected) {
                      // Hover opens the sub-layout; suppress click-to-open submenu.
                      event.preventDefault();
                      return;
                    }
                    if (!firstOption) return;
                    event.preventDefault();
                    selectSubmenuEntry(entry, firstOption);
                    requestAnimationFrame(() => {
                      event.currentTarget.ownerDocument.dispatchEvent(
                        new KeyboardEvent("keydown", {
                          key: "Escape",
                          code: "Escape",
                          bubbles: true,
                          cancelable: true,
                        }),
                      );
                    });
                  }}
                >
                  <span>{entry.label}</span>
                  {parentSelected ? (
                    <Check
                      className={cn(
                        "size-3.5 shrink-0",
                        pillStyles.dropdownMenuItemCheck,
                      )}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  ) : null}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  sideOffset={6}
                  collisionPadding={{ top: 12, right: 12, bottom: 88, left: 12 }}
                  data-prototype-comment-theme={commentTheme}
                  className={cn(
                    pillStyles.dropdownSubContent,
                    "border-0 bg-transparent p-0 text-foreground ring-0",
                  )}
                >
                  {entry.options.map((subOption) => {
                    const selected =
                      parentSelected && submenuValue === subOption.value;
                    return (
                      <DropdownMenuItem
                        key={subOption.value}
                        className={cn(
                          pillStyles.dropdownMenuItem,
                          selected && pillStyles.dropdownMenuItemSelected,
                        )}
                        onSelect={() => selectSubmenuEntry(entry, subOption)}
                      >
                        <span>{subOption.label}</span>
                        {selected ? (
                          <Check
                            className={cn(
                              "size-3.5 shrink-0",
                              pillStyles.dropdownMenuItemCheck,
                            )}
                            strokeWidth={2.5}
                            aria-hidden
                          />
                        ) : null}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          }

          const selected = entry.value === value;
          return (
            <DropdownMenuItem
              key={entry.value}
              className={cn(
                pillStyles.dropdownMenuItem,
                selected && pillStyles.dropdownMenuItemSelected,
              )}
              onSelect={() => handleValueChange(entry.value)}
            >
              <span>{entry.label}</span>
              {selected ? (
                <Check
                  className={cn("size-3.5 shrink-0", pillStyles.dropdownMenuItemCheck)}
                  strokeWidth={2.5}
                  aria-hidden
                />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </div>
    );
  }

  return (
    <SelectPrimitive.Root
      value={value}
      open={open}
      onOpenChange={handleOpenChange}
      onValueChange={(next) => handleValueChange(next as T)}
    >
      {isMiniPill ? (
        <SelectPrimitive.Trigger
          ref={triggerRef}
          className={cn(
            pillStyles.panelSelectTriggerMiniPill,
            "justify-center gap-1",
            className,
          )}
          onPointerDown={handleTriggerPointerDown}
        >
          <span className={pillStyles.miniPillLabelGroup}>
            <MiniPillLabel label={triggerLabel} />
          </span>
          <SelectPrimitive.Icon asChild>
            <ChevronDown
              className="size-3 shrink-0 opacity-60"
              aria-hidden
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
      ) : (
        <div
          className={cn(
            pillStyles.panelSelect,
            pillStyles.controlsPanelSelect,
            className,
          )}
        >
          <SelectPrimitive.Trigger
            ref={triggerRef}
            className={cn(pillStyles.panelSelectTrigger, "justify-between gap-2")}
            onPointerDown={handleTriggerPointerDown}
          >
            <span className={pillStyles.panelSelectValue}>{activeLabel}</span>
            <SelectPrimitive.Icon asChild>
              <ChevronDown
                className={cn("size-3.5", pillStyles.panelSelectChevron)}
                aria-hidden
              />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
        </div>
      )}

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          {...{ [CONTROLS_PANEL_SELECT_CONTENT_ATTR]: "" }}
          data-prototype-root
          data-prototype-comment-theme={commentTheme}
          position="popper"
          side="top"
          align="start"
          sideOffset={4}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={cn(
            pillStyles.dropdownContent,
            "border-0 bg-transparent p-0 text-foreground ring-0",
          )}
          style={{
            // Above review chrome toolbar (prototype-review-chrome.module.scss z-index: 1050).
            zIndex: 1051,
            minWidth: "max(var(--radix-select-trigger-width), 12rem)",
          }}
        >
          <SelectPrimitive.Viewport className="flex max-h-[min(20rem,60vh)] flex-col gap-0.5">
            {options.map((entry, index) => {
              if (isControlsPanelSelectSeparator(entry)) {
                return (
                  <ControlsPanelOptionSeparator
                    key={`separator-${index}`}
                    className={pillStyles.dropdownMenuSeparator}
                  />
                );
              }
              if (isControlsPanelSelectSubmenu(entry)) {
                return (
                  <SelectPrimitive.Item
                    key={entry.value}
                    value={entry.value}
                    className={pillStyles.dropdownMenuItem}
                  >
                    <SelectPrimitive.ItemText>{entry.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator asChild>
                      <Check
                        className={cn("size-3.5 shrink-0", pillStyles.dropdownMenuItemCheck)}
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                );
              }

              return (
                <SelectPrimitive.Item
                  key={entry.value}
                  value={entry.value}
                  className={pillStyles.dropdownMenuItem}
                >
                  <SelectPrimitive.ItemText>{entry.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator asChild>
                    <Check
                      className={cn("size-3.5 shrink-0", pillStyles.dropdownMenuItemCheck)}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
