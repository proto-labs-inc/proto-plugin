"use client";

import { Button } from "@prototype/components/ui/button";
import { Label } from "@prototype/components/ui/label";
import { OptionSelect } from "@prototype/components/ui/option-select";
import { ScrollArea } from "@prototype/components/ui/scroll-area";
import { Slider } from "@prototype/components/ui/slider";
import { Switch } from "@prototype/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@prototype/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@prototype/components/ui/toggle-group";
import {
  getPrototypeShareCommand,
  getPrototypeSlugFromPathname,
} from "@prototype/lib/prototypes/share-command";
import { cn } from "@prototype/lib/utils";
import {
  ArrowLeft,
  Copy,
  Info,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { PrototypeReferenceDocs } from "./prototype-reference-docs";

type PrototypeControlsTabProps = {
  value: string;
  label: string;
  children: ReactNode;
};

type PrototypeControlsFieldProps = {
  label: string;
  htmlFor?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

type PrototypeControlsToggleProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
};

type PrototypeControlsSelectProps<T extends string = string> = {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
};

type PrototypeControlsSliderProps = {
  label: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
  disabled?: boolean;
};

type PrototypeControlsDropdownProps<T extends string = string> = {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
};

type PrototypeControlsToggleGroupProps<T extends string = string> = {
  label: string;
  type?: "single" | "multiple";
  value?: T | T[];
  onValueChange?: (value: T | T[]) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
};

function PrototypeControlsTab(_props: PrototypeControlsTabProps) {
  return null;
}

PrototypeControlsTab.displayName = "PrototypeControlsTab";

function isPrototypeControlsTab(
  child: ReactNode,
): child is ReactElement<PrototypeControlsTabProps> {
  return (
    isValidElement(child) &&
    (child.type as { displayName?: string }).displayName ===
      "PrototypeControlsTab"
  );
}

function PrototypeControlsField({
  label,
  htmlFor,
  description,
  children,
  className,
}: PrototypeControlsFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor} className="text-foreground">
          {label}
        </Label>
      </div>
      {description ? (
        <p className="text-xs text-muted-foreground -mt-0.5">{description}</p>
      ) : null}
      {children}
    </div>
  );
}

function PrototypeControlsToggle({
  label,
  checked,
  onCheckedChange,
  disabled,
  id,
}: PrototypeControlsToggleProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={fieldId} className="text-foreground">
        {label}
      </Label>
      <Switch
        id={fieldId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

function PrototypeControlsSelect<T extends string>({
  label,
  value,
  onValueChange,
  options,
  disabled,
}: PrototypeControlsSelectProps<T>) {
  return (
    <PrototypeControlsField label={label}>
      <OptionSelect
        value={value}
        onValueChange={onValueChange}
        options={options}
        disabled={disabled}
        triggerClassName="w-full"
      />
    </PrototypeControlsField>
  );
}

function PrototypeControlsSlider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue = (nextValue) => String(nextValue),
  disabled,
}: PrototypeControlsSliderProps) {
  const currentValue = value[0] ?? min;

  return (
    <PrototypeControlsField label={label}>
      <div className="flex items-center gap-3">
        <Slider
          value={value}
          onValueChange={onValueChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatValue(currentValue)}
        </span>
      </div>
    </PrototypeControlsField>
  );
}

function PrototypeControlsDropdown<T extends string>({
  label,
  value,
  onValueChange,
  options,
  disabled,
}: PrototypeControlsDropdownProps<T>) {
  return (
    <PrototypeControlsField label={label}>
      <OptionSelect
        value={value}
        onValueChange={onValueChange}
        options={options}
        disabled={disabled}
        triggerClassName="w-full"
      />
    </PrototypeControlsField>
  );
}

function PrototypeControlsToggleGroup<T extends string>({
  label,
  type = "single",
  value,
  onValueChange,
  options,
  disabled,
}: PrototypeControlsToggleGroupProps<T>) {
  const items = options.map((option) => (
    <ToggleGroupItem
      key={option.value}
      value={option.value}
      className="flex-1"
    >
      {option.label}
    </ToggleGroupItem>
  ));

  return (
    <PrototypeControlsField label={label}>
      {type === "multiple" ? (
        <ToggleGroup
          type="multiple"
          variant="outline"
          value={value as T[] | undefined}
          onValueChange={(nextValue) => {
            onValueChange?.(nextValue as T[]);
          }}
          disabled={disabled}
          className="w-full"
        >
          {items}
        </ToggleGroup>
      ) : (
        <ToggleGroup
          type="single"
          variant="outline"
          value={value as T | undefined}
          onValueChange={(nextValue) => {
            onValueChange?.(nextValue as T);
          }}
          disabled={disabled}
          className="w-full"
        >
          {items}
        </ToggleGroup>
      )}
    </PrototypeControlsField>
  );
}

type PrototypeShareCommandButtonProps = {
  command: string;
};

export function PrototypeShareCommandButton({
  command,
}: PrototypeShareCommandButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Copy share command: ${command}`}
      className={cn(
        "group bg-muted border-border w-full rounded-md border p-2.5 text-left",
        "ring-focus-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "transition-colors duration-200 ease hover:bg-muted",
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(command);
          toast.success("Command copied", {
            description: "Paste in your terminal to push and get a preview link.",
            duration: 3000,
          });
        } catch {
          toast.error("Could not copy to clipboard");
        }
      }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
          <Terminal className="size-3 shrink-0" aria-hidden />
          Share
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1 transition-colors duration-200 ease group-hover:text-muted-foreground">
          <Copy className="size-3 shrink-0" aria-hidden />
          Copy
        </span>
      </div>
      <p className="text-xs text-foreground overflow-x-auto font-mono leading-relaxed whitespace-nowrap">
        <span className="text-success select-none">$ </span>
        {command}
      </p>
    </button>
  );
}

type PrototypeControlsProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  slug?: string;
};

type PrototypeControlsPanelProps = {
  children: ReactNode;
  tabs: Array<{ value: string; label: string; content: ReactNode }>;
  hasTabs: boolean;
};

function PrototypeControlsPanel({
  children,
  tabs,
  hasTabs,
}: PrototypeControlsPanelProps) {
  const defaultTab = tabs[0]?.value;

  return hasTabs ? (
    <Tabs defaultValue={defaultTab} className="gap-0">
      {tabs.length > 1 ? (
        <div className="border-border border-b px-0 pb-2">
          <TabsList className="w-full">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      ) : null}

      <ScrollArea className="max-h-[min(32rem,calc(100svh-12rem))]">
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="mt-0 px-0 py-3"
          >
            <div className="flex flex-col gap-4">{tab.content}</div>
          </TabsContent>
        ))}
      </ScrollArea>
    </Tabs>
  ) : (
    <div className="flex flex-col gap-4">{children}</div>
  );
}

type PrototypeControlsActionsProps = {
  shareCommand: string | null;
  slug?: string | null;
  className?: string;
};

export function PrototypeGalleryBackButton({ className }: { className?: string }) {
  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label="Back to gallery"
      className={cn("rounded-md", className)}
      asChild
    >
      <Link href="/">
        <ArrowLeft size={16} strokeWidth={2} />
      </Link>
    </Button>
  );
}

export function PrototypeControlsActions({
  shareCommand,
  slug,
  className,
}: PrototypeControlsActionsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {shareCommand ? (
        <PrototypeShareCommandButton command={shareCommand} />
      ) : null}
      {slug ? <PrototypeReferenceDocs slug={slug} /> : null}
    </div>
  );
}

function PrototypeControlsRoot({
  children,
  defaultOpen = false,
  className,
  slug: slugProp,
}: PrototypeControlsProps) {
  const pathname = usePathname();
  const review = usePrototypeReviewOptional();
  const [tweaksOpen, setTweaksOpen] = useState(defaultOpen);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const slug = slugProp ?? getPrototypeSlugFromPathname(pathname);
  const shareCommand = slug ? getPrototypeShareCommand(slug) : null;

  const tabs = useMemo(() => {
    return Children.toArray(children)
      .filter(isPrototypeControlsTab)
      .map((child) => ({
        value: child.props.value,
        label: child.props.label,
        content: child.props.children,
      }));
  }, [children]);

  const hasTabs = tabs.length > 0;

  const setTweaksContent = review?.setTweaksContent;
  const setTweaksContentRef = useRef(setTweaksContent);
  setTweaksContentRef.current = setTweaksContent;

  useLayoutEffect(() => {
    setTweaksContentRef.current?.(children);
  }, [children]);

  useEffect(() => {
    return () => setTweaksContentRef.current?.(null);
  }, []);

  if (review) {
    return null;
  }

  const toggleTweaks = () => {
    setTweaksOpen((current) => {
      const next = !current;
      if (next) setSettingsOpen(false);
      return next;
    });
  };

  const toggleSettings = () => {
    setSettingsOpen((current) => {
      const next = !current;
      if (next) setTweaksOpen(false);
      return next;
    });
  };

  return (
    <div
      data-prototype-controls
      className={cn(
        "pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-auto transition-opacity duration-150 ease-out motion-reduce:transition-none",
          tweaksOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!tweaksOpen}
      >
        <div className="border-border bg-card ring-border flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl shadow-lg ring-[0.5px]">
          <div className="px-3 py-3">
            <PrototypeControlsPanel tabs={tabs} hasTabs={hasTabs}>
              {children}
            </PrototypeControlsPanel>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-auto transition-opacity duration-150 ease-out motion-reduce:transition-none",
          settingsOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!settingsOpen}
      >
        <div className="border-border bg-card ring-border flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl p-3 shadow-lg ring-[0.5px]">
          <PrototypeControlsActions shareCommand={shareCommand} slug={slug} />
        </div>
      </div>

      <div className="bg-card ring-border pointer-events-auto flex items-center gap-1.5 rounded-lg p-1.5 shadow-md ring-[0.5px]">
        <PrototypeGalleryBackButton />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-expanded={tweaksOpen}
          aria-label={tweaksOpen ? "Close controls" : "Open controls"}
          className={cn("rounded-md", tweaksOpen && "bg-muted")}
          onClick={toggleTweaks}
        >
          <SlidersHorizontal />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-expanded={settingsOpen}
          aria-label={settingsOpen ? "Close info" : "Open info"}
          className={cn("rounded-md", settingsOpen && "bg-muted")}
          onClick={toggleSettings}
        >
          <Info />
        </Button>
      </div>
    </div>
  );
}

export const PrototypeControls = Object.assign(PrototypeControlsRoot, {
  Tab: PrototypeControlsTab,
  Field: PrototypeControlsField,
  Toggle: PrototypeControlsToggle,
  Select: PrototypeControlsSelect,
  Slider: PrototypeControlsSlider,
  Dropdown: PrototypeControlsDropdown,
  ToggleGroup: PrototypeControlsToggleGroup,
});
