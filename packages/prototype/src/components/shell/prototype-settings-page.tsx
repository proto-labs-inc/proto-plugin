"use client";

import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "@prototype/components/shell/prototype-gallery-shell";
import { PrototypeSettingsProfileModal } from "@prototype/components/shell/prototype-settings-profile-modal";
import { PrototypeSettingsSourceModal } from "@prototype/components/shell/prototype-settings-source-modal";
import { Button } from "@prototype/components/ui/button";
import { Label } from "@prototype/components/ui/label";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { cn } from "@prototype/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

export type PrototypeSettingsPageProps = {
  sourceDirectoryName?: string;
  sourcePath?: string;
  userName?: string;
};

const DEFAULT_SOURCE_DESCRIPTION =
  "The product codebase prototypes are built from.";

const PROFILE_STORAGE_KEYS = {
  sourceName: "prototype-profile:source-name",
  sourceDescription: "prototype-profile:source-description",
} as const;

const SETTINGS_READ_ONLY_FIELD_CLASS =
  "rounded-md border border-[var(--tool-chrome-border)]/70 bg-muted/20 px-3 py-2 text-sm leading-relaxed";

function SettingsReadOnlyField({
  id,
  label,
  description,
  value,
  placeholder,
  monospace = false,
}: {
  id: string;
  label: string;
  description?: string;
  value: string;
  placeholder: string;
  monospace?: boolean;
}) {
  const hintId = description ? `${id}-hint` : undefined;
  const trimmedValue = value.trim();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>
      {description ? (
        <p
          id={hintId}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      ) : null}
      <div
        id={id}
        aria-describedby={hintId}
        className={cn(
          SETTINGS_READ_ONLY_FIELD_CLASS,
          trimmedValue ? "text-foreground" : "text-muted-foreground",
          monospace && "font-mono",
        )}
      >
        {trimmedValue || placeholder}
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-lg font-medium tracking-tight text-foreground">{title}</h2>
        </div>
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-8 shrink-0 px-3"
          onClick={onEdit}
          aria-label={`Edit ${title.toLowerCase()}`}
        >
          Edit
        </Button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function PrototypeSettingsPage({
  sourceDirectoryName,
  sourcePath,
  userName: initialUserName = "",
}: PrototypeSettingsPageProps) {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [userName, setUserName] = useState(initialUserName);

  const hasSource = Boolean(sourceDirectoryName?.trim());
  const resolvedPath = sourcePath?.trim() ?? "";
  const defaultSourceName = sourceDirectoryName?.trim() ?? "";

  useEffect(() => {
    setUserName(initialUserName);
  }, [initialUserName]);

  const { value: sourceName, updateValue: setSourceName } =
    usePersistedLocalString(PROFILE_STORAGE_KEYS.sourceName, defaultSourceName);
  const { value: sourceDescription, updateValue: setSourceDescription } =
    usePersistedLocalString(
      PROFILE_STORAGE_KEYS.sourceDescription,
      DEFAULT_SOURCE_DESCRIPTION,
    );

  return (
    <>
      <PrototypeGalleryPageLayout
        header={
          <PrototypeGalleryHeader
            title="Settings"
            description=""
            className="mb-0"
          />
        }
      >
        <div className="flex w-full max-w-2xl flex-col gap-8">
          <SettingsSection
            title="Profile"
            onEdit={() => setProfileModalOpen(true)}
          >
            <SettingsReadOnlyField
              id="settings-profile-user-name"
              label="User name"
              value={userName}
              placeholder="Not set"
            />
          </SettingsSection>

          <SettingsSection
            title="Source directory"
            onEdit={() => setSourceModalOpen(true)}
          >
            <SettingsReadOnlyField
              id="settings-source-name"
              label="Source directory name"
              description="The name of the source code directory on your machine that Proto will reference to make prototypes"
              value={sourceName}
              placeholder="Not set"
            />
            {hasSource ? (
              <SettingsReadOnlyField
                id="settings-source-path"
                label="Source path"
                description="This is set by the agent"
                value={resolvedPath}
                placeholder="Not linked"
                monospace
              />
            ) : (
              <SettingsReadOnlyField
                id="settings-source-description"
                label="Source description"
                description="A brief description of the location or contents of the source code to help the agent find it"
                value={sourceDescription}
                placeholder="Not set"
              />
            )}
          </SettingsSection>
        </div>
      </PrototypeGalleryPageLayout>

      <PrototypeSettingsProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        userName={userName}
        onSave={({ userName: nextUserName }) => {
          setUserName(nextUserName);
        }}
      />

      <PrototypeSettingsSourceModal
        open={sourceModalOpen}
        onOpenChange={setSourceModalOpen}
        sourceName={sourceName}
        sourceDescription={sourceDescription}
        currentSourcePath={hasSource ? resolvedPath : undefined}
        onSave={({
          sourceName: nextSourceName,
          sourceDescription: nextSourceDescription,
        }) => {
          setSourceName(nextSourceName);
          setSourceDescription(nextSourceDescription);
        }}
      />
    </>
  );
}
