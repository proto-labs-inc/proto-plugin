"use client";

import { Button } from "@calcom/ui/components/button";
import { PrototypeComponent } from "proto-plugin";

import {
  EVENT_TYPES_PROFILE_SLUG,
  EVENT_TYPES_URL_PREFIX,
} from "./event-types-mock-data";
import { EventTypesDescriptionField } from "./event-types-description-field";
import { EventTypesFormField } from "./event-types-form-field";
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
  if (!open) return null;

  return (
    <PrototypeComponent id="event-types-create-modal" className="contents">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="fadeIn fixed inset-0 z-50 bg-neutral-800/70 transition-opacity dark:bg-neutral-800/80"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fadeIn bg-default scroll-bar fixed left-1/2 top-1/2 z-50 m-auto max-h-[95vh] w-[95vw] max-w-140 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl px-8 pt-8 text-left shadow-xl focus-visible:outline-none sm:align-middle"
      >
        <div className="mb-4">
          <h2
            data-testid="dialog-title"
            className="text-semibold text-emphasis font-cal mb-1 text-xl"
            id="modal-title"
          >
            Add a new event type
          </h2>
          <p className="text-subtle text-sm" data-testid="dialog-subtitle">
            Set up event types to offer different types of meetings.
          </p>
        </div>

        <div data-testid="dialog-creation" className="flex flex-col">
          <div className="mt-3 stack-y-6 pb-11">
            <EventTypesFormField
              label="Title"
              placeholder="Quick chat"
              data-testid="event-type-quick-chat"
              value={form.title}
              onChange={(title) => onFormChange({ ...form, title })}
            />

            <EventTypesFormField
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
              onChange={(slug) => onFormChange({ ...form, slug })}
            />

            <EventTypesDescriptionField
              value={form.description}
              onChange={(description) => onFormChange({ ...form, description })}
            />

            <EventTypesFormField
              type="number"
              label="Duration"
              placeholder="15"
              required
              value={String(form.length)}
              onChange={(value) =>
                onFormChange({
                  ...form,
                  length: Number(value) || 15,
                })
              }
              addOnSuffix="minutes"
              className="pr-4"
            />
          </div>

          <div className="bg-cal-muted border-muted sticky bottom-0 -mx-8 mt-10 rounded-b-2xl border">
            <div data-testid="divider" className="border-subtle border-t" />
            <div className="flex justify-end space-x-2 px-8 py-4 font-sans rtl:space-x-reverse">
              <Button
                type="button"
                color="minimal"
                data-testid="dialog-rejection"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button type="button">Continue</Button>
            </div>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
