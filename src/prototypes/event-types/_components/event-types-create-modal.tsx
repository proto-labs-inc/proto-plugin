"use client";

import { Button } from "@calcom/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@calcom/ui/components/dialog";
import { TextField } from "@calcom/ui/components/form";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";

import {
  EVENT_TYPES_PROFILE_SLUG,
  EVENT_TYPES_URL_PREFIX,
} from "./event-types-mock-data";
import { EventTypesDescriptionField } from "./event-types-description-field";
import type { EventTypesCreateFormState } from "./event-types-types";

type EventTypesCreateModalProps = {
  open: boolean;
  form: EventTypesCreateFormState;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: EventTypesCreateFormState) => void;
};

export function EventTypesCreateModal({
  open,
  form,
  onOpenChange,
  onFormChange,
}: EventTypesCreateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        type="creation"
        enableOverflow
        title="Add a new event type"
        description="Set up event types to offer different types of meetings."
      >
        <PrototypeComponent id="event-types-create-modal" className="mt-3 stack-y-6 pb-11">
          <TextField
            label="Title"
            placeholder="Quick chat"
            data-testid="event-type-quick-chat"
            value={form.title}
            onChange={(event) =>
              onFormChange({ ...form, title: event.target.value })
            }
          />

          <TextField
            label={`URL: ${EVENT_TYPES_URL_PREFIX}`}
            required
            addOnLeading={
              <span className="max-w-24 md:max-w-56 inline-block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {`/${EVENT_TYPES_PROFILE_SLUG}/`}
              </span>
            }
            containerClassName="[&>div]:gap-0"
            className="pl-0"
            value={form.slug}
            onChange={(event) =>
              onFormChange({ ...form, slug: event.target.value })
            }
          />

          <EventTypesDescriptionField
            value={form.description}
            onChange={(description) => onFormChange({ ...form, description })}
          />

          <div className="relative">
            <TextField
              type="number"
              required
              min={1}
              max={1440}
              placeholder="15"
              label="Duration"
              className="pr-4"
              value={String(form.length)}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  length: Number(event.target.value) || 15,
                })
              }
              addOnSuffix="minutes"
            />
          </div>
        </PrototypeComponent>

        <DialogFooter showDivider>
          <DialogClose />
          <Button type="button">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
