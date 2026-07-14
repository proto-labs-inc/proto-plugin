"use client";

import { ArrowButton } from "@calcom/ui/components/arrow-button";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { ButtonGroup } from "@calcom/ui/components/buttonGroup";
import Icon from "@calcom/ui/components/icon/Icon";
import { showToast } from "@calcom/ui/components/toast";
import { PrototypeComponent } from "proto";

import {
  EVENT_TYPES_PROFILE_SLUG,
  EVENT_TYPES_URL_PREFIX,
} from "./event-types-mock-data";
import type { MockEventType } from "./event-types-types";

type EventTypeListItemActionsProps = {
  type: MockEventType;
  onToggleHidden: (id: number) => void;
};

export function EventTypeListItemActions({
  type,
  onToggleHidden,
}: EventTypeListItemActionsProps) {
  const calLink = `/${EVENT_TYPES_PROFILE_SLUG}/${type.slug}`;

  return (
    <div className="flex items-center gap-2">
      {type.hidden ? <span className="text-gray-400 text-sm">Hidden</span> : null}
      <div className="self-center rounded-md p-2" title={type.hidden ? "Show event type on profile" : "Hide from profile"}>
        <button
          type="button"
          role="switch"
          aria-checked={!type.hidden}
          aria-label={type.hidden ? "Show event type on profile" : "Hide from profile"}
          onClick={() => onToggleHidden(type.id)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            !type.hidden ? "bg-emphasis" : "bg-subtle"
          }`}
        >
          <span
            className={`bg-default pointer-events-none inline-block h-5 w-5 rounded-full shadow ring-0 transition ${
              !type.hidden ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <ButtonGroup combined>
        <Button
          color="secondary"
          target="_blank"
          variant="icon"
          href={calLink}
          StartIcon="external-link"
          aria-label="Preview"
        />
        <Button
          color="secondary"
          variant="icon"
          StartIcon="link"
          aria-label="Copy link"
          onClick={() => {
            void navigator.clipboard.writeText(`${EVENT_TYPES_URL_PREFIX}${calLink}`);
            showToast("Link copied", "success");
          }}
        />
        <Button
          type="button"
          variant="icon"
          color="secondary"
          StartIcon="ellipsis"
          aria-label="More options"
        />
      </ButtonGroup>
    </div>
  );
}

type EventTypeListItemProps = {
  type: MockEventType;
  isFirst: boolean;
  isLast: boolean;
  onToggleHidden: (id: number) => void;
};

export function EventTypeListItem({
  type,
  isFirst,
  isLast,
  onToggleHidden,
}: EventTypeListItemProps) {
  return (
    <PrototypeComponent
      id={`event-types-list-item.${type.id}`}
      className="contents"
    >
      <li>
        <div className="hover:bg-cal-muted flex w-full items-center justify-between transition">
          <div className="group flex w-full max-w-full items-center justify-between overflow-hidden px-4 py-4 sm:px-6">
            {!isFirst ? <ArrowButton arrowDirection="up" onClick={() => undefined} /> : null}
            {!isLast ? <ArrowButton arrowDirection="down" onClick={() => undefined} /> : null}

            <div className="relative flex-1 overflow-hidden pr-4 text-sm">
              <div title={type.title}>
                <div>
                  <span className="text-default break-words font-semibold ltr:mr-1 rtl:ml-1">
                    {type.title}
                  </span>
                  <small className="text-subtle hidden font-normal leading-4 sm:inline">
                    {`/${EVENT_TYPES_PROFILE_SLUG}/${type.slug}`}
                  </small>
                </div>
                <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                  <li>
                    <Badge variant="gray" startIcon="clock">
                      {type.length}m
                    </Badge>
                  </li>
                  {type.isSecret ? (
                    <li>
                      <Badge variant="orange" startIcon="lock">
                        Secret
                      </Badge>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>

            <div className="mt-4 hidden sm:mt-0 sm:flex">
              <EventTypeListItemActions type={type} onToggleHidden={onToggleHidden} />
            </div>
          </div>
        </div>
      </li>
    </PrototypeComponent>
  );
}
