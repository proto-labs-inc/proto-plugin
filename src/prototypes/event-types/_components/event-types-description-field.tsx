"use client";

import { Label } from "@calcom/ui/components/form";
import { PrototypeComponent } from "proto-plugin";

type EventTypesDescriptionFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function EventTypesDescriptionField({
  value,
  onChange,
}: EventTypesDescriptionFieldProps) {
  return (
    <PrototypeComponent id="event-types-description-field" className="editor rounded-md">
      <Label className="mb-1 block text-sm font-medium leading-6">Description</Label>
      <div className="editor-container border-subtle focus-within:border-emphasis! focus-within:shadow-outline-gray-focused rounded-lg! border p-0 transition">
        <div className="border-subtle flex items-center gap-1 border-b px-2 py-1">
          <button
            type="button"
            className="text-emphasis hover:bg-subtle rounded px-2 py-1 text-sm font-bold"
            aria-label="Bold"
          >
            B
          </button>
          <button
            type="button"
            className="text-emphasis hover:bg-subtle rounded px-2 py-1 text-sm italic"
            aria-label="Italic"
          >
            I
          </button>
        </div>
        <textarea
          id="custom-editor"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="A quick video meeting."
          className="text-default min-h-[120px] w-full resize-none rounded-b-lg bg-transparent px-3 py-2 text-sm outline-none"
        />
      </div>
    </PrototypeComponent>
  );
}
