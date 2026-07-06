import type { MockEventType } from "./event-types-types";

export const EVENT_TYPES_USER = {
  name: "Maayan Albert",
  username: "maayan",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maayan",
};

export const EVENT_TYPES_PROFILE_SLUG = "maayan";

export const EVENT_TYPES_URL_PREFIX = "http://localhost:3001";

export const DEFAULT_EVENT_TYPES: MockEventType[] = [
  {
    id: 1,
    title: "Secret meeting",
    slug: "secret",
    length: 15,
    hidden: false,
  },
  {
    id: 2,
    title: "30 min meeting",
    slug: "30min",
    length: 30,
    hidden: false,
  },
  {
    id: 3,
    title: "15 min meeting",
    slug: "15min",
    length: 15,
    hidden: false,
  },
];

export const EMPTY_SEARCH_QUERY = "kkkk";

export function filterEventTypes(
  eventTypes: MockEventType[],
  searchTerm: string,
  profileSlug: string,
): MockEventType[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return eventTypes;

  return eventTypes.filter(
    (type) =>
      type.title.toLowerCase().includes(query) ||
      type.slug.toLowerCase().includes(query) ||
      `/${profileSlug}/${type.slug}`.includes(query),
  );
}
