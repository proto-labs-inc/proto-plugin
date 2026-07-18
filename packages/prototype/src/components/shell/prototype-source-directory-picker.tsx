"use client";

import {
  pickSourceDirectory,
  resolveSourceDirectoryFromDataTransfer,
  resolveSourceDirectoryFromFileList,
  type SourceDirectoryPick,
} from "@prototype/lib/prototypes/resolve-source-directory-pick";
import { cn } from "@prototype/lib/utils";
import { FolderOpen } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { toast } from "sonner";

export type PrototypeSourceDirectoryPickerProps = {
  value: SourceDirectoryPick | null;
  onChange: (value: SourceDirectoryPick | null) => void;
  className?: string;
};

export function PrototypeSourceDirectoryPicker({
  value,
  onChange,
  className,
}: PrototypeSourceDirectoryPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpeningPicker, setIsOpeningPicker] = useState(false);

  const applyPick = useCallback(
    (pick: SourceDirectoryPick | null) => {
      if (!pick) return;
      onChange(pick);
    },
    [onChange],
  );

  const handleBrowse = useCallback(async () => {
    if (isOpeningPicker) return;

    setIsOpeningPicker(true);

    try {
      const pick = await pickSourceDirectory();
      applyPick(pick);
    } catch {
      inputRef.current?.click();
    } finally {
      setIsOpeningPicker(false);
    }
  }, [applyPick, isOpeningPicker]);

  const handleInputChange = useCallback(() => {
    const pick = resolveSourceDirectoryFromFileList(inputRef.current?.files ?? null);
    applyPick(pick);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [applyPick]);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const pick = await resolveSourceDirectoryFromDataTransfer(event.dataTransfer);
      if (!pick) {
        toast.error("Drop a folder", {
          description: "Choose the product codebase directory, not an individual file.",
        });
        return;
      }

      applyPick(pick);
    },
    [applyPick],
  );

  const hasSelection = Boolean(value?.name.trim());
  const emptyHintText =
    "Select the product codebase folder Proto should reference when building prototypes.";
  const selectedHintText = "Drop another folder or click to change the selection.";

  return (
    <div className={cn("flex flex-col", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        // @ts-expect-error Non-standard directory picker attribute supported in Chromium.
        webkitdirectory=""
        multiple
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={() => {
          void handleBrowse();
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(event) => {
          void handleDrop(event);
        }}
        aria-describedby={`${inputId}-hint`}
        aria-label={
          hasSelection
            ? `Selected source directory: ${value!.name}. ${selectedHintText}`
            : emptyHintText
        }
        className={cn(
          "group flex min-h-[8.5rem] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-5 py-7 text-center outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out",
          hasSelection
            ? "border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface-muted)]/35 hover:bg-[var(--tool-chrome-surface-muted)]/55"
            : "border-[var(--tool-chrome-border)]/80 bg-[var(--tool-chrome-surface-muted)]/25 hover:border-[var(--tool-chrome-border)] hover:bg-[var(--tool-chrome-surface-muted)]/45",
          "focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0",
          isDragging &&
            "scale-[1.005] border-[var(--tool-chrome-blue)]/60 bg-[var(--tool-chrome-blue-highlight)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--tool-chrome-blue)_35%,transparent)]",
        )}
      >
        <FolderOpen
          className={cn(
            "size-8 text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80",
            isDragging && "text-foreground",
          )}
          aria-hidden
          strokeWidth={1.5}
        />

        {hasSelection ? (
          <div className="flex min-w-0 max-w-full flex-col items-center gap-1 px-2">
            <p className="truncate text-sm font-medium text-foreground">{value!.name}</p>
            {value!.path ? (
              <p className="max-w-full truncate font-mono text-xs text-muted-foreground">
                {value!.path}
              </p>
            ) : null}
          </div>
        ) : null}

        <p
          id={`${inputId}-hint`}
          className="max-w-[30rem] px-2 text-sm leading-relaxed text-muted-foreground"
        >
          {hasSelection ? selectedHintText : emptyHintText}
        </p>
      </button>
    </div>
  );
}
