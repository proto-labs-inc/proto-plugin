"use client";

import {
  PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
  PrototypeBriefTextarea,
} from "@prototype/components/prototypes/prototype-brief-field";
import { RepeatableFieldList } from "@prototype/components/prototypes/prototype-modal-repeatable-field-list";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import { cn } from "@prototype/lib/utils";

export type DocField = {
  id: string;
  name: string;
  content: string;
  link: string;
};

export const EMPTY_DOC_FIELD = (): DocField => ({
  id: crypto.randomUUID(),
  name: "",
  content: "",
  link: "",
});

export function isDocFieldEmpty(doc: DocField): boolean {
  return (
    doc.name.trim().length === 0 &&
    doc.content.trim().length === 0 &&
    doc.link.trim().length === 0
  );
}

export function isDocFieldComplete(doc: DocField): boolean {
  return doc.content.trim().length > 0;
}

export function isDocFieldPartial(doc: DocField): boolean {
  return !isDocFieldEmpty(doc) && !isDocFieldComplete(doc);
}

export function DocFields({
  docs,
  onChange,
}: {
  docs: DocField[];
  onChange: (docs: DocField[]) => void;
}) {
  return (
    <RepeatableFieldList
      items={docs}
      onChange={onChange}
      createItem={EMPTY_DOC_FIELD}
      addLabel="Add doc"
      itemLabel={(index, total) => (total > 1 ? `Doc ${index + 1}` : "Doc")}
      renderItem={(doc, update) => {
        const titleFieldId = `${doc.id}-title`;
        const contentFieldId = `${doc.id}-content`;
        const linkFieldId = `${doc.id}-link`;
        const docLabel =
          docs.length > 1
            ? `Doc ${docs.findIndex((entry) => entry.id === doc.id) + 1}`
            : "Doc";

        return (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={titleFieldId} className="text-foreground">
                Title{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id={titleFieldId}
                value={doc.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="ex. Table Editor Filters Spec"
                className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={contentFieldId} className="text-foreground">
                Content
              </Label>
              <PrototypeBriefTextarea
                id={contentFieldId}
                value={doc.content}
                onChange={(event) => update({ content: event.target.value })}
                placeholder="Summarize requirements, scope, and states to match…"
                minHeightClass="min-h-[5rem]"
                aria-label={`${docLabel} content`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={linkFieldId} className="text-foreground">
                URL{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id={linkFieldId}
                value={doc.link}
                onChange={(event) => update({ link: event.target.value })}
                placeholder="https://docs.google.com/..."
                className={cn("min-w-0", PROTOTYPE_BRIEF_FIELD_BORDER_CLASS)}
                spellCheck={false}
              />
            </div>
          </>
        );
      }}
    />
  );
}
