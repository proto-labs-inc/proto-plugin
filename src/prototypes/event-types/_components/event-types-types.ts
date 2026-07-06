export type EventTypesPreviewStateId =
  | "event-types-list"
  | "new-event-type-modal"
  | "empty-search"
  | "secret-events-filter";

export type MockEventType = {
  id: number;
  title: string;
  slug: string;
  length: number;
  hidden: boolean;
  isSecret: boolean;
};

export type EventTypesCreateFormState = {
  title: string;
  slug: string;
  description: string;
  length: number;
};

export type EventTypesLiveState = {
  previewStateId: EventTypesPreviewStateId;
  searchTerm: string;
  secretFilterActive: boolean;
  createModalOpen: boolean;
  eventTypes: MockEventType[];
  createForm: EventTypesCreateFormState;
};
